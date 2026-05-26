<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MenuItemController extends Controller
{
    public function index(Request $request)
    {
        $query = MenuItem::with('category');

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $items = $query->orderBy('name')->get();
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name'        => 'required|string|max:150',
            'price'       => 'required|numeric|min:0',
            'is_available'=> 'boolean',
            'image'       => 'nullable|image|max:4096',
        ]);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('menu-items', 'public');
        }

        unset($data['image']);
        $item = MenuItem::create($data);
        $item->load('category');

        return response()->json($item, 201);
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $data = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name'        => 'sometimes|required|string|max:150',
            'price'       => 'sometimes|required|numeric|min:0',
            'is_available'=> 'sometimes|boolean',
            'image'       => 'nullable|image|max:4096',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($menuItem->image_path) {
                Storage::disk('public')->delete($menuItem->image_path);
            }
            $data['image_path'] = $request->file('image')->store('menu-items', 'public');
        }

        unset($data['image']);
        $menuItem->update($data);
        $menuItem->load('category');

        return response()->json($menuItem);
    }

    public function destroy(MenuItem $menuItem)
    {
        if ($menuItem->image_path) {
            Storage::disk('public')->delete($menuItem->image_path);
        }
        
        // Disassociate this item from any existing order items so we don't violate foreign key constraints
        DB::table('order_items')
            ->where('menu_item_id', $menuItem->id)
            ->update(['menu_item_id' => null]);

        $menuItem->delete();
        return response()->json(['message' => 'Item deleted.']);
    }
}
