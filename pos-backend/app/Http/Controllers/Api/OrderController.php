<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use App\Models\Order;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['items', 'discount'])->orderByDesc('created_at');

        // Date filtering
        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        } elseif ($request->filled('month') && $request->filled('year')) {
            $query->whereYear('created_at', $request->year)
                  ->whereMonth('created_at', $request->month);
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search by customer name or order id
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('id', $search);
            });
        }

        $orders = $query->paginate($request->get('per_page', 25));
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'order_type'    => 'required|in:dine_in,takeout',
            'customer_name' => 'nullable|string|max:100',
            'notes'         => 'nullable|string',
            'discount_id'   => 'nullable|exists:discounts,id',
            'items'         => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity'     => 'required|integer|min:1',
        ]);

        // Calculate gross amount from items
        $grossAmount = 0;
        $orderItemsData = [];

        foreach ($data['items'] as $item) {
            $menuItem = MenuItem::findOrFail($item['menu_item_id']);
            $subtotal  = $menuItem->price * $item['quantity'];
            $grossAmount += $subtotal;

            $orderItemsData[] = [
                'menu_item_id' => $menuItem->id,
                'item_name'    => $menuItem->name,
                'unit_price'   => $menuItem->price,
                'quantity'     => $item['quantity'],
                'subtotal'     => $subtotal,
            ];
        }

        // Apply discount if provided
        $discountAmount  = 0;
        $discountName    = null;
        $discountPercent = 0;
        $discountId      = null;

        if (!empty($data['discount_id'])) {
            $discount        = Discount::findOrFail($data['discount_id']);
            $discountPercent = (float) $discount->percentage;
            $discountAmount  = round($grossAmount * ($discountPercent / 100), 2);
            $discountName    = $discount->name;
            $discountId      = $discount->id;
        }

        $netAmount = $grossAmount - $discountAmount;

        $order = Order::create([
            'order_type'      => $data['order_type'],
            'customer_name'   => $data['customer_name'] ?? null,
            'notes'           => $data['notes'] ?? null,
            'discount_id'     => $discountId,
            'discount_name'   => $discountName,
            'discount_percent'=> $discountPercent,
            'gross_amount'    => $grossAmount,
            'discount_amount' => $discountAmount,
            'net_amount'      => $netAmount,
            'total'           => $netAmount, // backward compat alias
            'refund_amount'   => 0,
            'cost_of_goods'   => 0,
            'status'          => 'completed',
        ]);

        $order->items()->createMany($orderItemsData);
        $order->load(['items', 'discount']);

        return response()->json($order, 201);
    }

    public function show(Order $order)
    {
        $order->load(['items', 'discount']);
        return response()->json($order);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => 'required|in:open,completed,voided',
        ]);

        // When voiding, set refund = net amount
        if ($data['status'] === 'voided' && $order->status !== 'voided') {
            $order->update([
                'status'        => 'voided',
                'refund_amount' => $order->net_amount,
            ]);
        } else {
            $order->update($data);
        }

        return response()->json($order->fresh(['items', 'discount']));
    }
}
