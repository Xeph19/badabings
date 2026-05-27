<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\Discount;
use App\Models\RevenueOverride;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\SerializesModels;

class GenerateOverrideOrders implements ShouldQueue
{
    use Queueable, SerializesModels;

    protected $override;

    /**
     * Create a new job instance.
     */
    public function __construct(RevenueOverride $override)
    {
        $this->override = $override;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $menuItems = MenuItem::where('is_available', true)->get();
        if ($menuItems->isEmpty()) {
            $menuItems = MenuItem::all();
        }
        $discounts = Discount::where('is_active', true)->get();

        if ($this->override->period_type === 'daily') {
            $this->generateOrdersForSingleDay($this->override->period_date, $this->override->override_amount, $menuItems, $discounts);
        } else {
            // Monthly override
            $monthStart = Carbon::parse($this->override->period_date)->startOfMonth();
            $monthEnd = Carbon::parse($this->override->period_date)->endOfMonth();

            // Clear all orders for the entire month
            Order::whereBetween('created_at', [$monthStart, $monthEnd])->delete();

            // Clear any daily overrides for this month to prevent conflicts
            RevenueOverride::where('period_type', 'daily')
                ->whereBetween('period_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                ->delete();

            $numDays = $monthStart->diffInDays($monthEnd) + 1;
            
            // Randomize distribution of daily sales across all days
            $dailyWeights = [];
            $totalWeight = 0;
            for ($day = 1; $day <= $numDays; $day++) {
                $w = rand(10, 100);
                $dailyWeights[$day] = $w;
                $totalWeight += $w;
            }

            $dailyAmounts = [];
            $tempSum = 0;
            for ($day = 1; $day <= $numDays; $day++) {
                $dailyAmt = round(($dailyWeights[$day] / $totalWeight) * $this->override->override_amount, 2);
                $dailyAmounts[$day] = $dailyAmt;
                $tempSum += $dailyAmt;
            }
            // Adjust discrepancy
            $diff = round($this->override->override_amount - $tempSum, 2);
            $dailyAmounts[$numDays] = round($dailyAmounts[$numDays] + $diff, 2);

            // Generate orders for each day
            $currentDate = $monthStart->copy();
            for ($day = 1; $day <= $numDays; $day++) {
                $this->generateOrdersForSingleDay($currentDate->toDateString(), $dailyAmounts[$day], $menuItems, $discounts);
                $currentDate->addDay();
            }
        }
    }

    private function generateOrdersForSingleDay($date, $targetAmount, $menuItems, $discounts)
    {
        // 1. Delete all existing orders on this day
        Order::whereDate('created_at', $date)->delete();

        if ($targetAmount <= 0) {
            return;
        }

        // 2. Decide how many orders to generate
        $avgOrderVal = rand(120, 250);
        $numOrders = (int) max(1, round($targetAmount / $avgOrderVal));
        if ($numOrders > 80) {
            $numOrders = 80; // Safety cap
        }

        // 3. Generate weights for the orders
        $weights = [];
        $totalWeight = 0;
        for ($i = 0; $i < $numOrders; $i++) {
            $w = rand(10, 100);
            $weights[] = $w;
            $totalWeight += $w;
        }

        // 4. Calculate targets per order
        $orderAmounts = [];
        $tempSum = 0;
        for ($i = 0; $i < $numOrders; $i++) {
            $amt = round(($weights[$i] / $totalWeight) * $targetAmount, 2);
            $orderAmounts[] = $amt;
            $tempSum += $amt;
        }
        // Adjust discrepancy
        $diff = round($targetAmount - $tempSum, 2);
        if ($numOrders > 0) {
            $orderAmounts[$numOrders - 1] = round($orderAmounts[$numOrders - 1] + $diff, 2);
        }

        // List of names to randomize
        $names = ['Liam', 'Noah', 'Oliver', 'James', 'Elijah', 'William', 'Henry', 'Lucas', 'Benjamin', 'Theodore', 'Mateo', 'Levi', 'Sebastian', 'Daniel', 'Jack', 'Wyatt', 'Alexander', 'Owen', 'Asher', 'Samuel', 'Olivia', 'Emma', 'Charlotte', 'Amelia', 'Sophia', 'Mia', 'Isabella', 'Ava', 'Evelyn', 'Luna', 'Harper', 'Sofia', 'Camila', 'Eleanor', 'Elizabeth', 'Violet', 'Emily', 'Hazel', 'Lily', 'Gianna'];

        // 5. Generate each order
        foreach ($orderAmounts as $netTarget) {
            if ($netTarget <= 0) {
                continue;
            }

            // Decide discount
            $discountId = null;
            $discountName = null;
            $discountPercent = 0;
            $discountAmount = 0;
            if ($discounts->isNotEmpty() && rand(1, 100) <= 15) {
                $discount = $discounts->random();
                $discountId = $discount->id;
                $discountName = $discount->name;
                $discountPercent = (float) $discount->percentage;
                
                $grossAmount = round($netTarget / (1 - $discountPercent / 100), 2);
                $discountAmount = round($grossAmount - $netTarget, 2);
            } else {
                $grossAmount = $netTarget;
            }

            // Customer Name
            $customerName = $names[array_rand($names)] . ' ' . chr(rand(65, 90)) . '.';

            // Time must be from 9am-9pm (09:00:00 to 21:00:00)
            $hour = rand(9, 20); // 9 to 20
            $minute = rand(0, 59);
            $second = rand(0, 59);
            $createdAt = Carbon::parse($date)->setTime($hour, $minute, $second);

            // Generate items
            $numItems = rand(1, 3);
            $itemWeights = [];
            $itemWeightSum = 0;
            for ($j = 0; $j < $numItems; $j++) {
                $w = rand(10, 100);
                $itemWeights[] = $w;
                $itemWeightSum += $w;
            }

            $orderItemsData = [];
            $itemGrossSum = 0;
            for ($j = 0; $j < $numItems; $j++) {
                $subtotal = round(($itemWeights[$j] / $itemWeightSum) * $grossAmount, 2);
                $menuItem = $menuItems->random();
                $qty = rand(1, 2);
                $unitPrice = round($subtotal / $qty, 2);
                $subtotal = round($unitPrice * $qty, 2);

                $orderItemsData[] = [
                    'menu_item_id' => $menuItem->id,
                    'item_name'    => $menuItem->name,
                    'unit_price'   => $unitPrice,
                    'quantity'     => $qty,
                    'subtotal'     => $subtotal,
                ];
                $itemGrossSum += $subtotal;
            }

            // Adjust discrepancy on items
            $grossDiff = round($grossAmount - $itemGrossSum, 2);
            if ($numItems > 0) {
                $orderItemsData[$numItems - 1]['subtotal'] = round($orderItemsData[$numItems - 1]['subtotal'] + $grossDiff, 2);
                $orderItemsData[$numItems - 1]['quantity'] = 1;
                $orderItemsData[$numItems - 1]['unit_price'] = $orderItemsData[$numItems - 1]['subtotal'];
            }

            // Re-calc final amounts
            $finalGrossAmount = 0;
            foreach ($orderItemsData as $itemData) {
                $finalGrossAmount += $itemData['subtotal'];
            }
            $finalGrossAmount = round($finalGrossAmount, 2);
            if ($discountPercent > 0) {
                $finalDiscountAmount = round($finalGrossAmount * ($discountPercent / 100), 2);
            } else {
                $finalDiscountAmount = 0;
            }
            $finalNetAmount = round($finalGrossAmount - $finalDiscountAmount, 2);

            // Cost of goods (30% to 40% of net amount)
            $costOfGoods = round($finalNetAmount * (rand(30, 40) / 100), 2);

            // Create Order
            $order = new Order();
            $order->fill([
                'order_type'       => rand(1, 100) <= 75 ? 'dine_in' : 'takeout',
                'customer_name'    => $customerName,
                'discount_id'      => $discountId,
                'discount_name'    => $discountName,
                'discount_percent' => $discountPercent,
                'gross_amount'     => $finalGrossAmount,
                'discount_amount'  => $finalDiscountAmount,
                'net_amount'       => $finalNetAmount,
                'total'            => $finalNetAmount,
                'refund_amount'    => 0,
                'cost_of_goods'    => $costOfGoods,
                'status'           => 'completed',
            ]);
            $order->created_at = $createdAt;
            $order->updated_at = $createdAt;
            $order->save();

            // Create Items
            foreach ($orderItemsData as $itemData) {
                $item = new OrderItem();
                $item->fill($itemData);
                $item->order_id = $order->id;
                $item->created_at = $createdAt;
                $item->updated_at = $createdAt;
                $item->save();
            }
        }
    }
}
