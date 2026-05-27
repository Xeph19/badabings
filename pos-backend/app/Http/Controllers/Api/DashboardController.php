<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\RevenueOverride;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Full analytics endpoint with time navigation.
     * Params: date (Y-m-d), OR month (1-12) + year (YYYY)
     * Defaults to today.
     */
    public function analytics(Request $request)
    {
        $viewType = $request->get('view', 'day'); // 'day' | 'month'

        if ($viewType === 'month') {
            $year  = (int) $request->get('year',  now()->year);
            $month = (int) $request->get('month', now()->month);
            $start = Carbon::createFromDate($year, $month, 1)->startOfMonth();
            $end   = $start->copy()->endOfMonth();
            $label = $start->format('F Y');
            $periodKey = $start->format('Y-m');
        } else {
            $date  = $request->get('date', now()->toDateString());
            $start = Carbon::parse($date)->startOfDay();
            $end   = Carbon::parse($date)->endOfDay();
            $label = Carbon::parse($date)->format('D, M j, Y');
            $periodKey = $date;
        }

        // Base query for the period (completed orders only for revenue)
        $completedOrders = Order::whereBetween('created_at', [$start, $end])
            ->where('status', 'completed');

        $voidedOrders = Order::whereBetween('created_at', [$start, $end])
            ->where('status', 'voided');

        // ─── KPIs ──────────────────────────────────────────────
        $actualGrossSales   = (float) (clone $completedOrders)->sum('gross_amount');
        $discountTotal      = (float) (clone $completedOrders)->sum('discount_amount');
        $refunds            = (float) (clone $voidedOrders)->sum('refund_amount');
        $actualNetSales     = $actualGrossSales - $discountTotal - $refunds;
        $costOfGoods        = (float) (clone $completedOrders)->sum('cost_of_goods');
        $orderCount         = (clone $completedOrders)->count();

        // ─── Revenue Override ──────────────────────────────────
        $overrideType = $viewType === 'month' ? 'monthly' : 'daily';
        $override = RevenueOverride::where('period_type', $overrideType)
            ->where('period_date', $viewType === 'month' ? $start->toDateString() : $periodKey)
            ->first();

        $monthlyOverride = null;
        $hasOverride = (bool) $override;

        if ($viewType === 'day' && !$override) {
            // Check if there is a monthly override for the month containing this day
            $monthStart = $start->copy()->startOfMonth();
            $monthlyOverride = RevenueOverride::where('period_type', 'monthly')
                ->where('period_date', $monthStart->toDateString())
                ->first();
            if ($monthlyOverride) {
                $hasOverride = true;
            }
        }

        // Apply override if present
        if ($override) {
            $netSales      = $orderCount > 0 ? $actualNetSales : (float) $override->override_amount;
            $grossSales    = $orderCount > 0 ? $actualGrossSales : ($netSales + $discountTotal + $refunds);
        } elseif ($viewType === 'day' && $monthlyOverride) {
            if ($orderCount > 0) {
                $netSales   = $actualNetSales;
                $grossSales = $actualGrossSales;
            } else {
                // Compute the day's portion of the monthly override using the same LCG algorithm
                $monthStart = $start->copy()->startOfMonth();
                $monthEnd = $start->copy()->endOfMonth();
                $numDays = $monthStart->diffInDays($monthEnd) + 1;
                
                $dailyOverrides = RevenueOverride::where('period_type', 'daily')
                    ->whereBetween('period_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                    ->pluck('override_amount', 'period_date');

                $monthlyOverrideAmount = (float) $monthlyOverride->override_amount;
                $dailyOverridesSum = 0;
                foreach ($dailyOverrides as $dDate => $dAmount) {
                    $dailyOverridesSum += (float) $dAmount;
                }
                $remainingMonthlyRevenue = max(0, $monthlyOverrideAmount - $dailyOverridesSum);

                // Recompute LCG weights and discount rates
                $seed = crc32($monthStart->format('Y-m'));
                $state = $seed;
                $weights = [];
                $discountRatios = [];
                $totalWeightForUnoverridden = 0;

                // Base discount rate of the month from actual sales
                $monthCompletedOrders = Order::whereBetween('created_at', [$monthStart, $monthEnd])
                    ->where('status', 'completed');
                $monthActualGross   = (float) (clone $monthCompletedOrders)->sum('gross_amount');
                $monthActualDiscount = (float) (clone $monthCompletedOrders)->sum('discount_amount');
                $monthActualNet     = $monthActualGross - $monthActualDiscount - (float) Order::whereBetween('created_at', [$monthStart, $monthEnd])->where('status', 'voided')->sum('refund_amount');
                
                $monthBaseDiscountRate = $monthActualNet > 0 ? ($monthActualDiscount / $monthActualNet) : 0.05;
                if ($monthBaseDiscountRate <= 0) {
                    $monthBaseDiscountRate = 0.05;
                }
                $monthMaxDiscountLimit = max(0.20, min(0.40, $monthBaseDiscountRate * 1.5));

                $current = $monthStart->copy();
                for ($day = 1; $day <= $numDays; $day++) {
                    $d = $current->format('Y-m-d');
                    $state = ($state * 1103515245 + 12345) & 0x7fffffff;
                    $randFloat = $state / 2147483647.0;
                    $weight = 0.4 + ($randFloat * 1.2);
                    $weights[$d] = $weight;

                    $state = ($state * 1103515245 + 12345) & 0x7fffffff;
                    $randDiscount = $state / 2147483647.0;
                    $dailyDiscountRate = max(0.01, min($monthMaxDiscountLimit, $monthBaseDiscountRate * (0.5 + $randDiscount * 1.0)));
                    $discountRatios[$d] = 1.0 + $dailyDiscountRate;

                    if (!isset($dailyOverrides[$d])) {
                        $totalWeightForUnoverridden += $weight;
                    }
                    $current->addDay();
                }

                $targetDateStr = $start->toDateString();
                if (isset($dailyOverrides[$targetDateStr])) {
                    $netSales = (float) $dailyOverrides[$targetDateStr];
                    $discountTotal = $netSales * ($discountRatios[$targetDateStr] - 1.0);
                } else {
                    $fraction = $totalWeightForUnoverridden > 0 ? ($weights[$targetDateStr] / $totalWeightForUnoverridden) : (1 / $numDays);
                    $netSales = $remainingMonthlyRevenue * $fraction;
                    $discountTotal = $netSales * ($discountRatios[$targetDateStr] - 1.0);
                }
                $grossSales = $netSales + $discountTotal + $refunds;
            }
        } else {
            $netSales   = $actualNetSales;
            $grossSales = $actualGrossSales;
        }

        $grossProfit   = $netSales - $costOfGoods;
        $avgOrderValue = $orderCount > 0 ? round($netSales / $orderCount, 2) : 0;

        // ─── Order Log (paginated) ─────────────────────────────
        $orderQuery = Order::with(['items', 'discount'])
            ->whereBetween('created_at', [$start, $end])
            ->orderByDesc('created_at');

        if ($request->filled('search')) {
            $s = $request->search;
            $orderQuery->where(function ($q) use ($s) {
                $q->where('customer_name', 'like', "%{$s}%")
                  ->orWhere('id', $s);
            });
        }
        if ($request->filled('status_filter')) {
            $orderQuery->where('status', $request->status_filter);
        }

        $orders = $orderQuery->paginate($request->get('per_page', 20));

        // ─── Hourly trend (for day view) / Daily trend (month view) ─
        $trend = [];
        if ($viewType === 'day') {
            $hourly = Order::select(
                    DB::raw("strftime('%H', created_at) as hour"),
                    DB::raw('SUM(gross_amount) as gross'),
                    DB::raw('SUM(net_amount) as net')
                )
                ->whereBetween('created_at', [$start, $end])
                ->where('status', 'completed')
                ->groupBy(DB::raw("strftime('%H', created_at)"))
                ->get()
                ->keyBy('hour');

            $netRatio = 1;
            $grossRatio = 1;
            if ($hasOverride) {
                if ($actualNetSales > 0) {
                    $netRatio = $netSales / $actualNetSales;
                }
                if ($actualGrossSales > 0) {
                    $grossRatio = $grossSales / $actualGrossSales;
                }
            }

            for ($h = 0; $h < 24; $h++) {
                $hStr = str_pad($h, 2, '0', STR_PAD_LEFT);
                $hourlyGross = (float) ($hourly[$hStr]->gross ?? 0);
                $hourlyNet   = (float) ($hourly[$hStr]->net ?? 0);

                if ($hasOverride) {
                    if ($actualNetSales > 0) {
                        $net = $hourlyNet * $netRatio;
                        $gross = $hourlyGross * $grossRatio;
                    } else {
                        if ($h >= 9 && $h <= 20) {
                            $net = $netSales / 12;
                            $gross = $grossSales / 12;
                        } else {
                            $net = 0;
                            $gross = 0;
                        }
                    }
                } else {
                    $net = $hourlyNet;
                    $gross = $hourlyGross;
                }

                $trend[] = [
                    'label' => $hStr . ':00',
                    'gross' => round($gross, 2),
                    'net'   => round($net, 2),
                ];
            }
        } else {
            $daily = Order::select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('SUM(gross_amount) as gross'),
                    DB::raw('SUM(net_amount) as net')
                )
                ->whereBetween('created_at', [$start, $end])
                ->where('status', 'completed')
                ->groupBy(DB::raw('DATE(created_at)'))
                ->get()
                ->keyBy('date');

            // Fetch daily overrides to apply to trend chart
            $dailyOverrides = RevenueOverride::where('period_type', 'daily')
                ->whereBetween('period_date', [$start->toDateString(), $end->toDateString()])
                ->pluck('override_amount', 'period_date');

            $monthlyOverrideAmount = $override ? (float) $override->override_amount : 0;
            $dailyOverridesSum = 0;
            foreach ($dailyOverrides as $dDate => $dAmount) {
                $dailyOverridesSum += (float) $dAmount;
            }

            $remainingMonthlyRevenue = max(0, $monthlyOverrideAmount - $dailyOverridesSum);

            // Generate deterministic weights for all days of the month (LCG seeded with month hash)
            $numDays = $start->diffInDays($end) + 1;
            $seed = crc32($start->format('Y-m'));
            $state = $seed;

            $weights = [];
            $discountRatios = [];
            $totalWeightForUnoverridden = 0;

            // Base discount rate from actual sales of this month
            $baseDiscountRate = $actualNetSales > 0 ? ($discountTotal / $actualNetSales) : 0.05;
            if ($baseDiscountRate <= 0) {
                $baseDiscountRate = 0.05;
            }
            $maxDiscountLimit = max(0.20, min(0.40, $baseDiscountRate * 1.5));

            $current = $start->copy();
            for ($day = 1; $day <= $numDays; $day++) {
                $d = $current->format('Y-m-d');
                
                // Advance LCG state for weight
                $state = ($state * 1103515245 + 12345) & 0x7fffffff;
                $randFloat = $state / 2147483647.0;
                $weight = 0.4 + ($randFloat * 1.2); // weight between 0.4 and 1.6
                $weights[$d] = $weight;

                // Advance LCG state for discount ratio
                $state = ($state * 1103515245 + 12345) & 0x7fffffff;
                $randDiscount = $state / 2147483647.0;
                // Let the discount rate fluctuate between 50% and 150% of the base discount rate
                // Bounded between 1% and the dynamic maximum limit
                $dailyDiscountRate = max(0.01, min($maxDiscountLimit, $baseDiscountRate * (0.5 + $randDiscount * 1.0)));
                $discountRatios[$d] = 1.0 + $dailyDiscountRate;

                if (!isset($dailyOverrides[$d])) {
                    $totalWeightForUnoverridden += $weight;
                }
                $current->addDay();
            }

            $totalNetSum = 0;
            $totalDiscountSum = 0;
            $totalGrossSum = 0;

            // Build trend
            $current = $start->copy();
            for ($day = 1; $day <= $numDays; $day++) {
                $d = $current->format('Y-m-d');
                $actualDailyNet   = (float) ($daily[$d]->net ?? 0);
                $actualDailyGross = (float) ($daily[$d]->gross ?? 0);

                if (isset($dailyOverrides[$d])) {
                    $dayStart = Carbon::parse($d)->startOfDay();
                    $dayEnd = Carbon::parse($d)->endOfDay();
                    $dayOrdersCount = Order::whereBetween('created_at', [$dayStart, $dayEnd])->where('status', 'completed')->count();

                    if ($dayOrdersCount > 0) {
                        $net = $actualDailyNet;
                        $gross = $actualDailyGross;
                        $discount = $actualDailyGross - $actualDailyNet;
                    } else {
                        $net = (float) $dailyOverrides[$d];
                        // Always use randomized discount ratio when overridden
                        $discount = $net * ($discountRatios[$d] - 1.0);
                        $gross = $net + $discount;
                    }
                } else {
                    if ($override) {
                        $dayStart = Carbon::parse($d)->startOfDay();
                        $dayEnd = Carbon::parse($d)->endOfDay();
                        $dayOrdersCount = Order::whereBetween('created_at', [$dayStart, $dayEnd])->where('status', 'completed')->count();

                        if ($dayOrdersCount > 0) {
                            $net = $actualDailyNet;
                            $gross = $actualDailyGross;
                            $discount = $actualDailyGross - $actualDailyNet;
                        } else {
                            $fraction = $totalWeightForUnoverridden > 0 ? ($weights[$d] / $totalWeightForUnoverridden) : (1 / $numDays);
                            $net = $remainingMonthlyRevenue * $fraction;
                            $discount = $net * ($discountRatios[$d] - 1.0);
                            $gross = $net + $discount;
                        }
                    } else {
                        $net = $actualDailyNet;
                        $gross = $actualDailyGross;
                        $discount = $actualDailyGross - $actualDailyNet;
                    }
                }

                $totalNetSum += $net;
                $totalDiscountSum += $discount;
                $totalGrossSum += $gross;

                $trend[] = [
                    'label' => $current->format('j'),
                    'gross' => round($gross, 2),
                    'net'   => round($net, 2),
                ];
                $current->addDay();
            }

            if ($override || count($dailyOverrides) > 0) {
                $netSales      = $totalNetSum;
                $discountTotal = $totalDiscountSum;
                $grossSales    = $netSales + $discountTotal + $refunds;
                $grossProfit   = $netSales - $costOfGoods;
                $avgOrderValue = $orderCount > 0 ? round($netSales / $orderCount, 2) : 0;
            }
        }

        return response()->json([
            'period' => [
                'view'       => $viewType,
                'label'      => $label,
                'start'      => $start->toDateString(),
                'end'        => $end->toDateString(),
            ],
            'kpis' => [
                'gross_sales'    => $grossSales,
                'discount_total' => $discountTotal,
                'refunds'        => $refunds,
                'net_sales'      => $netSales,
                'cost_of_goods'  => $costOfGoods,
                'gross_profit'   => $grossProfit,
                'order_count'    => $orderCount,
                'avg_order_value'=> $avgOrderValue,
            ],
            'trend'    => $trend,
            'orders'   => $orders,
        ]);
    }

    /** Legacy daily revenue — kept for backward compat */
    public function dailyRevenue(Request $request)
    {
        $days      = $request->get('days', 30);
        $startDate = Carbon::now()->subDays($days - 1)->startOfDay();

        $actual = Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(net_amount) as revenue')
            )
            ->where('status', 'completed')
            ->where('created_at', '>=', $startDate)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->pluck('revenue', 'date');

        $overrides = RevenueOverride::where('period_type', 'daily')
            ->where('period_date', '>=', $startDate->toDateString())
            ->pluck('override_amount', 'period_date');

        $result = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date          = Carbon::now()->subDays($i)->format('Y-m-d');
            $actualRevenue = (float) ($actual[$date] ?? 0);
            $override      = isset($overrides[$date]) ? (float) $overrides[$date] : null;

            $result[] = [
                'date'     => $date,
                'actual'   => $actualRevenue,
                'override' => $override,
                'display'  => $override ?? $actualRevenue,
            ];
        }

        return response()->json($result);
    }

    /** Legacy monthly revenue */
    public function monthlyRevenue(Request $request)
    {
        $months    = $request->get('months', 12);
        $startDate = Carbon::now()->subMonths($months - 1)->startOfMonth();

        $actual = Order::select(
                DB::raw("strftime('%Y-%m', created_at) as month"),
                DB::raw('SUM(net_amount) as revenue')
            )
            ->where('status', 'completed')
            ->where('created_at', '>=', $startDate)
            ->groupBy(DB::raw("strftime('%Y-%m', created_at)"))
            ->pluck('revenue', 'month');

        $overrides = RevenueOverride::where('period_type', 'monthly')
            ->where('period_date', '>=', $startDate->toDateString())
            ->get()
            ->mapWithKeys(fn($o) => [
                Carbon::parse($o->period_date)->format('Y-m') => (float) $o->override_amount
            ]);

        $result = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $month         = Carbon::now()->subMonths($i)->format('Y-m');
            $label         = Carbon::now()->subMonths($i)->format('M Y');
            $actualRevenue = (float) ($actual[$month] ?? 0);
            $override      = $overrides[$month] ?? null;

            $result[] = [
                'month'    => $month,
                'label'    => $label,
                'actual'   => $actualRevenue,
                'override' => $override,
                'display'  => $override ?? $actualRevenue,
            ];
        }

        return response()->json($result);
    }

    /** Legacy summary */
    public function summary()
    {
        $today = Carbon::today();

        $todayRevenue = Order::where('status', 'completed')
            ->whereDate('created_at', $today)
            ->sum('net_amount');

        $monthRevenue = Order::where('status', 'completed')
            ->whereYear('created_at', $today->year)
            ->whereMonth('created_at', $today->month)
            ->sum('net_amount');

        $todayOrders = Order::where('status', 'completed')
            ->whereDate('created_at', $today)
            ->count();

        return response()->json([
            'today_revenue' => (float) $todayRevenue,
            'month_revenue' => (float) $monthRevenue,
            'today_orders'  => $todayOrders,
        ]);
    }
}
