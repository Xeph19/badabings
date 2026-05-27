<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RevenueOverride;
use App\Jobs\GenerateOverrideOrders;
use Carbon\Carbon;
use Illuminate\Http\Request;

class RevenueOverrideController extends Controller
{
    public function index()
    {
        return response()->json(
            RevenueOverride::orderByDesc('period_date')->get()
        );
    }

    public function upsert(Request $request)
    {
        $data = $request->validate([
            'period_date'     => 'required|date',
            'period_type'     => 'required|in:daily,monthly',
            'override_amount' => 'required|numeric|min:0',
            'note'            => 'nullable|string|max:255',
        ]);

        // Normalize monthly overrides to first day of month
        if ($data['period_type'] === 'monthly') {
            $data['period_date'] = Carbon::parse($data['period_date'])->startOfMonth()->toDateString();
        }

        $override = RevenueOverride::updateOrCreate(
            [
                'period_date' => $data['period_date'],
                'period_type' => $data['period_type'],
            ],
            [
                'override_amount' => $data['override_amount'],
                'note'            => $data['note'] ?? null,
            ]
        );

        // Dispatch background job to generate orders
        GenerateOverrideOrders::dispatch($override);

        return response()->json($override, 200);
    }

    public function destroy(RevenueOverride $revenueOverride)
    {
        if ($revenueOverride->period_type === 'daily') {
            \App\Models\Order::whereDate('created_at', $revenueOverride->period_date)->delete();
        } else {
            $monthStart = Carbon::parse($revenueOverride->period_date)->startOfMonth();
            $monthEnd = Carbon::parse($revenueOverride->period_date)->endOfMonth();
            \App\Models\Order::whereBetween('created_at', [$monthStart, $monthEnd])->delete();
        }
        
        $revenueOverride->delete();
        return response()->json(['message' => 'Override removed.']);
    }
}
