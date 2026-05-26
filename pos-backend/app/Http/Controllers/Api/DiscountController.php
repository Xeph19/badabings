<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use Illuminate\Http\Request;

class DiscountController extends Controller
{
    /** GET /api/discounts — accessible by all authenticated users */
    public function index()
    {
        return response()->json(Discount::orderBy('name')->get());
    }

    /** POST /api/discounts — Admin only */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:100|unique:discounts,name',
            'percentage' => 'required|numeric|min:0.01|max:100',
            'is_active'  => 'boolean',
        ]);

        $discount = Discount::create($data);
        return response()->json($discount, 201);
    }

    /** PUT /api/discounts/{id} — Admin only */
    public function update(Request $request, Discount $discount)
    {
        $data = $request->validate([
            'name'       => 'sometimes|required|string|max:100|unique:discounts,name,' . $discount->id,
            'percentage' => 'sometimes|required|numeric|min:0.01|max:100',
            'is_active'  => 'sometimes|boolean',
        ]);

        $discount->update($data);
        return response()->json($discount);
    }

    /** DELETE /api/discounts/{id} — Admin only */
    public function destroy(Discount $discount)
    {
        $discount->delete();
        return response()->json(['message' => 'Discount deleted.']);
    }
}
