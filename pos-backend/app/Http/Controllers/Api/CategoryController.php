<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::orderBy('sort_order')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'sort_order' => 'integer|min:0',
        ]);

        $category = Category::create($data);
        return response()->json($category, 201);
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        $category->update($data);
        return response()->json($category);
    }

    public function destroy(Category $category)
    {
        // Get all menu item IDs in this category
        $menuItemIds = $category->menuItems()->pluck('id');

        // Disassociate order items
        DB::table('order_items')
            ->whereIn('menu_item_id', $menuItemIds)
            ->update(['menu_item_id' => null]);

        // Delete menu items' images from storage
        foreach ($category->menuItems as $item) {
            if ($item->image_path) {
                Storage::disk('public')->delete($item->image_path);
            }
        }

        $category->delete();
        return response()->json(['message' => 'Category deleted.']);
    }
}
