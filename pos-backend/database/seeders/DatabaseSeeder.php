<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Discount;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Users ────────────────────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'admin@pos.com'],
            ['name' => 'Owner', 'password' => Hash::make('password'), 'role' => 'admin']
        );

        User::updateOrCreate(
            ['email' => 'cashier@pos.com'],
            ['name' => 'Cashier 1', 'password' => Hash::make('password'), 'role' => 'cashier']
        );

        // ─── Discounts ────────────────────────────────────────────────────────
        $discounts = [
            ['name' => 'Senior Citizen', 'percentage' => 20.00, 'is_active' => true],
            ['name' => 'PWD',            'percentage' => 20.00, 'is_active' => true],
            ['name' => 'Employee',       'percentage' => 15.00, 'is_active' => true],
            ['name' => 'Loyalty Member', 'percentage' => 10.00, 'is_active' => true],
        ];

        foreach ($discounts as $d) {
            Discount::updateOrCreate(['name' => $d['name']], $d);
        }

        // ─── Categories ───────────────────────────────────────────────────────
        $categories = [
            ['name' => 'Rice Meals', 'sort_order' => 1],
            ['name' => 'Main Dishes', 'sort_order' => 2],
            ['name' => 'Soups', 'sort_order' => 3],
            ['name' => 'Flavored Wings', 'sort_order' => 4],
            ['name' => 'Starters', 'sort_order' => 5],
            ['name' => 'Short Orders', 'sort_order' => 6],
            ['name' => 'Pasta', 'sort_order' => 7],
            ['name' => 'Pizza', 'sort_order' => 8],
            ['name' => 'Burgers & Sandwiches', 'sort_order' => 9],
            ['name' => 'Desserts', 'sort_order' => 10],
            ['name' => 'Add Ons', 'sort_order' => 11],
            ['name' => 'Coolers', 'sort_order' => 12],
            ['name' => 'Fresh Fruits', 'sort_order' => 13],
            ['name' => 'Soda', 'sort_order' => 14],
            ['name' => 'Liquor', 'sort_order' => 15],
            ['name' => 'Coffee', 'sort_order' => 16],
            ['name' => 'Non-Coffee', 'sort_order' => 17],
            ['name' => 'Frappes', 'sort_order' => 18],
        ];

        $categoryIds = [];
        foreach ($categories as $cat) {
            $created = Category::updateOrCreate(['name' => $cat['name']], $cat);
            $categoryIds[$cat['name']] = $created->id;
        }

        // ─── Menu Items ───────────────────────────────────────────────────────
        $items = [
            // ─── Rice Meals ───────────────────
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Unli Rice - Chicken BBQ Paa', 'price' => 145.00],
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Unli Rice - Chicken BBQ Pecho', 'price' => 155.00],
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Unli Rice - Pork BBQ', 'price' => 155.00],
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Unli Rice - Buffalo Wings', 'price' => 155.00],
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Unli Rice - Buttered Chicken Wings', 'price' => 155.00],
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Unli Rice - Chicken Teriyaki Wings', 'price' => 155.00],
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Unli Rice - Garlic Parmesan Wings', 'price' => 155.00],
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Unli Rice - Honey Glazed Wings', 'price' => 155.00],
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Unli Rice - Honey Sriracha Wings', 'price' => 155.00],
            
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Combo Rice - Chicken BBQ Paa', 'price' => 135.00],
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Combo Rice - Chicken BBQ Pecho', 'price' => 140.00],
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Combo Rice - Pork BBQ (2 pc)', 'price' => 140.00],
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Combo Rice - Fried Chicken (2 pc)', 'price' => 130.00],
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Combo Rice - Buffalo Wings', 'price' => 135.00],
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Combo Rice - Buttered Chicken Wings', 'price' => 135.00],
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Combo Rice - Chicken Teriyaki Wings', 'price' => 135.00],
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Combo Rice - Garlic Parmesan Wings', 'price' => 135.00],
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Combo Rice - Honey Glazed Wings', 'price' => 135.00],
            ['category_id' => $categoryIds['Rice Meals'], 'name' => 'Combo Rice - Honey Sriracha Wings', 'price' => 135.00],

            // ─── Main Dishes ───────────────────
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Chicken BBQ Paa Solo', 'price' => 100.00],
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Chicken BBQ Pecho Solo', 'price' => 110.00],
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Pork BBQ (2 pc) Solo', 'price' => 110.00],
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Cordon Blue', 'price' => 260.00],
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Buttered Shrimp', 'price' => 310.00],
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Pork Sisig', 'price' => 330.00],
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Bangus Sisig', 'price' => 310.00],
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Boneless Bangus (Grilled/Fried)', 'price' => 310.00],
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Crispy Pata', 'price' => 730.00],
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Lechon Kawali', 'price' => 310.00],
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Calamares', 'price' => 390.00],
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Fish Fillet', 'price' => 370.00],
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Chopseuy', 'price' => 310.00],
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Grilled Pantat', 'price' => 130.00],
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Grilled Tanigue', 'price' => 460.00],
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Grilled Tuna', 'price' => 460.00],
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Tanigue Sisig', 'price' => 390.00],
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Kinilaw Tanigue', 'price' => 310.00],
            ['category_id' => $categoryIds['Main Dishes'], 'name' => 'Sweet & Sour Lapu-Lapu', 'price' => 420.00],

            // ─── Soups ───────────────────
            ['category_id' => $categoryIds['Soups'], 'name' => 'Whole Native Chicken Soup', 'price' => 760.00],
            ['category_id' => $categoryIds['Soups'], 'name' => 'Beef Pata Soup', 'price' => 360.00],
            ['category_id' => $categoryIds['Soups'], 'name' => 'Beef Bulalo Soup', 'price' => 400.00],
            ['category_id' => $categoryIds['Soups'], 'name' => 'Sinigang Baboy', 'price' => 380.00],
            ['category_id' => $categoryIds['Soups'], 'name' => 'Sinigang Bangus', 'price' => 380.00],
            ['category_id' => $categoryIds['Soups'], 'name' => 'Sinigang Tuna', 'price' => 410.00],
            ['category_id' => $categoryIds['Soups'], 'name' => 'Sinigang Lapu-Lapu', 'price' => 460.00],
            ['category_id' => $categoryIds['Soups'], 'name' => 'Sinigang Lison', 'price' => 430.00],
            ['category_id' => $categoryIds['Soups'], 'name' => 'Sinigang Tanigue', 'price' => 430.00],
            ['category_id' => $categoryIds['Soups'], 'name' => 'Sinigang Pasayan', 'price' => 370.00],
            ['category_id' => $categoryIds['Soups'], 'name' => 'Sinigang Bonito Fish', 'price' => 350.00],
            ['category_id' => $categoryIds['Soups'], 'name' => 'Sinigang Bulgan', 'price' => 350.00],

            // ─── Flavored Wings ───────────────────
            ['category_id' => $categoryIds['Flavored Wings'], 'name' => 'Flavored Wings - Buffalo', 'price' => 220.00],
            ['category_id' => $categoryIds['Flavored Wings'], 'name' => 'Flavored Wings - Garlic Parmesan', 'price' => 220.00],
            ['category_id' => $categoryIds['Flavored Wings'], 'name' => 'Flavored Wings - Honey Glazed', 'price' => 220.00],
            ['category_id' => $categoryIds['Flavored Wings'], 'name' => 'Flavored Wings - Honey Sriracha', 'price' => 220.00],
            ['category_id' => $categoryIds['Flavored Wings'], 'name' => 'Flavored Wings - Buttered Chicken', 'price' => 220.00],

            // ─── Starters ───────────────────
            ['category_id' => $categoryIds['Starters'], 'name' => 'Crunchy Beef Nachos', 'price' => 190.00],
            ['category_id' => $categoryIds['Starters'], 'name' => 'Beef Shawarma Roll', 'price' => 100.00],
            ['category_id' => $categoryIds['Starters'], 'name' => 'Cheesy Beef Quesadilla', 'price' => 190.00],
            ['category_id' => $categoryIds['Starters'], 'name' => 'Chicken N\' Fries', 'price' => 160.00],
            ['category_id' => $categoryIds['Starters'], 'name' => 'Plain Fries', 'price' => 95.00],
            ['category_id' => $categoryIds['Starters'], 'name' => 'Cheesy Ham-Bacon Fries', 'price' => 170.00],
            ['category_id' => $categoryIds['Starters'], 'name' => 'Cheese Sticks (Starters)', 'price' => 95.00],
            ['category_id' => $categoryIds['Starters'], 'name' => 'Lumpiang Shanghai', 'price' => 170.00],
            ['category_id' => $categoryIds['Starters'], 'name' => 'Pina-Cheesin\' Roll', 'price' => 130.00],
            ['category_id' => $categoryIds['Starters'], 'name' => 'Garlic Bread', 'price' => 60.00],

            // ─── Short Orders ───────────────────
            ['category_id' => $categoryIds['Short Orders'], 'name' => 'Sotanghon Guisado', 'price' => 290.00],
            ['category_id' => $categoryIds['Short Orders'], 'name' => 'Bihon Guisado', 'price' => 290.00],
            ['category_id' => $categoryIds['Short Orders'], 'name' => 'Pansit Guisado', 'price' => 290.00],
            ['category_id' => $categoryIds['Short Orders'], 'name' => 'Bam-E', 'price' => 280.00],
            ['category_id' => $categoryIds['Short Orders'], 'name' => 'Pancit Molo', 'price' => 250.00],
            ['category_id' => $categoryIds['Short Orders'], 'name' => 'Special Batchoy', 'price' => 110.00],
            ['category_id' => $categoryIds['Short Orders'], 'name' => 'Special Batchoy Sotanghon', 'price' => 130.00],
            ['category_id' => $categoryIds['Short Orders'], 'name' => 'Lomi (Good for 2)', 'price' => 180.00],
            ['category_id' => $categoryIds['Short Orders'], 'name' => 'Lomi (Good for 4)', 'price' => 260.00],
            ['category_id' => $categoryIds['Short Orders'], 'name' => 'Siomai (Pork/Chicken)', 'price' => 120.00],

            // ─── Pasta ───────────────────
            ['category_id' => $categoryIds['Pasta'], 'name' => 'Creamy Tuna Carbonara', 'price' => 230.00],
            ['category_id' => $categoryIds['Pasta'], 'name' => 'Creamy Mushroom & Bacon Carbonara', 'price' => 230.00],
            ['category_id' => $categoryIds['Pasta'], 'name' => 'Spaghetti | 3 pc Lumpia', 'price' => 230.00],

            // ─── Pizza ───────────────────
            ['category_id' => $categoryIds['Pizza'], 'name' => 'Hawaiian Overload Round', 'price' => 290.00],
            ['category_id' => $categoryIds['Pizza'], 'name' => 'Hawaiian Overload Square', 'price' => 390.00],
            ['category_id' => $categoryIds['Pizza'], 'name' => 'White Creamy Pizza Round', 'price' => 300.00],
            ['category_id' => $categoryIds['Pizza'], 'name' => 'White Creamy Pizza Square', 'price' => 400.00],
            ['category_id' => $categoryIds['Pizza'], 'name' => 'Pepperoni Pizza', 'price' => 300.00],

            // ─── Burgers & Sandwiches ─────────
            ['category_id' => $categoryIds['Burgers & Sandwiches'], 'name' => 'Classic Burger | Fries', 'price' => 185.00],
            ['category_id' => $categoryIds['Burgers & Sandwiches'], 'name' => 'Clubhouse Sandwich | Fries', 'price' => 180.00],
            ['category_id' => $categoryIds['Burgers & Sandwiches'], 'name' => 'Ham & Cheese Sandwich | Fries', 'price' => 160.00],
            ['category_id' => $categoryIds['Burgers & Sandwiches'], 'name' => 'Tuna Sandwich | Fries', 'price' => 160.00],
            ['category_id' => $categoryIds['Burgers & Sandwiches'], 'name' => 'Chicken Sandwich | Fries', 'price' => 160.00],

            // ─── Desserts ───────────────────
            ['category_id' => $categoryIds['Desserts'], 'name' => 'Mais Con Yelo', 'price' => 120.00],
            ['category_id' => $categoryIds['Desserts'], 'name' => 'Mango Graham Dessert', 'price' => 180.00],
            ['category_id' => $categoryIds['Desserts'], 'name' => 'Special Halo-Halo', 'price' => 130.00],

            // ─── Add Ons ───────────────────
            ['category_id' => $categoryIds['Add Ons'], 'name' => 'Plain Rice | Cup', 'price' => 35.00],
            ['category_id' => $categoryIds['Add Ons'], 'name' => 'Plain Rice | Platter', 'price' => 135.00],
            ['category_id' => $categoryIds['Add Ons'], 'name' => 'Atchara (Add-on)', 'price' => 45.00],

            // ─── Coolers ───────────────────
            ['category_id' => $categoryIds['Coolers'], 'name' => 'Blueberry Cooler (16 oz)', 'price' => 65.00],
            ['category_id' => $categoryIds['Coolers'], 'name' => 'Lychee Cooler (16 oz)', 'price' => 65.00],
            ['category_id' => $categoryIds['Coolers'], 'name' => 'Strawberry Cooler (16 oz)', 'price' => 65.00],
            ['category_id' => $categoryIds['Coolers'], 'name' => 'Green Apple Cooler (16 oz)', 'price' => 65.00],
            ['category_id' => $categoryIds['Coolers'], 'name' => 'Kiwi Cooler (16 oz)', 'price' => 65.00],
            ['category_id' => $categoryIds['Coolers'], 'name' => 'Iced Tea Cooler (16 oz)', 'price' => 75.00],
            ['category_id' => $categoryIds['Coolers'], 'name' => 'Iced Tea Cooler (Pitcher)', 'price' => 150.00],
            ['category_id' => $categoryIds['Coolers'], 'name' => 'Blue Lemonade Cooler (16 oz)', 'price' => 75.00],
            ['category_id' => $categoryIds['Coolers'], 'name' => 'Blue Lemonade Cooler (Pitcher)', 'price' => 150.00],
            ['category_id' => $categoryIds['Coolers'], 'name' => 'Pink Lemonade Cooler (16 oz)', 'price' => 75.00],
            ['category_id' => $categoryIds['Coolers'], 'name' => 'Pink Lemonade Cooler (Pitcher)', 'price' => 150.00],
            ['category_id' => $categoryIds['Coolers'], 'name' => 'Cucumber Cooler (16 oz)', 'price' => 75.00],
            ['category_id' => $categoryIds['Coolers'], 'name' => 'Cucumber Cooler (Pitcher)', 'price' => 150.00],

            // ─── Fresh Fruits ───────────────────
            ['category_id' => $categoryIds['Fresh Fruits'], 'name' => 'Fresh Fruit Juice', 'price' => 120.00],
            ['category_id' => $categoryIds['Fresh Fruits'], 'name' => 'Fresh Organic Juice', 'price' => 140.00],
            ['category_id' => $categoryIds['Fresh Fruits'], 'name' => 'Mango Shake', 'price' => 160.00],
            ['category_id' => $categoryIds['Fresh Fruits'], 'name' => 'Strawberry Shake', 'price' => 140.00],

            // ─── Soda ───────────────────
            ['category_id' => $categoryIds['Soda'], 'name' => 'Coke (200 ML)', 'price' => 25.00],
            ['category_id' => $categoryIds['Soda'], 'name' => 'Royal (200 ML)', 'price' => 25.00],
            ['category_id' => $categoryIds['Soda'], 'name' => 'Sprite (200 ML)', 'price' => 25.00],
            ['category_id' => $categoryIds['Soda'], 'name' => 'Coke (290 ML)', 'price' => 30.00],
            ['category_id' => $categoryIds['Soda'], 'name' => 'Sprite (290 ML)', 'price' => 30.00],
            ['category_id' => $categoryIds['Soda'], 'name' => 'Coke Zero (320 ML)', 'price' => 55.00],
            ['category_id' => $categoryIds['Soda'], 'name' => 'Coke Original (320 ML)', 'price' => 55.00],
            ['category_id' => $categoryIds['Soda'], 'name' => 'Sprite (320 ML)', 'price' => 55.00],
            ['category_id' => $categoryIds['Soda'], 'name' => 'Coke (1.5 L)', 'price' => 105.00],
            ['category_id' => $categoryIds['Soda'], 'name' => 'Sprite (1.5 L)', 'price' => 105.00],

            // ─── Liquor ───────────────────
            ['category_id' => $categoryIds['Liquor'], 'name' => 'San Miguel Lights', 'price' => 85.00],
            ['category_id' => $categoryIds['Liquor'], 'name' => 'San Miguel Pale Pilsen', 'price' => 85.00],
            ['category_id' => $categoryIds['Liquor'], 'name' => 'Red Horse Beer', 'price' => 90.00],
            ['category_id' => $categoryIds['Liquor'], 'name' => 'San Miguel Flavored Beer', 'price' => 85.00],
            ['category_id' => $categoryIds['Liquor'], 'name' => 'SM Lights Bucket (6 Cans)', 'price' => 500.00],
            ['category_id' => $categoryIds['Liquor'], 'name' => 'SM Pale Pilsen Bucket (6 Cans)', 'price' => 500.00],
            ['category_id' => $categoryIds['Liquor'], 'name' => 'Red Horse Bucket (6 Cans)', 'price' => 530.00],

            // ─── Coffee ───────────────────
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Espresso Shot (Small)', 'price' => 55.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Brewed Coffee (Small)', 'price' => 55.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Brewed Coffee (Medium)', 'price' => 65.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Americano (Small)', 'price' => 65.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Americano (Medium)', 'price' => 75.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Cappuccino (Small)', 'price' => 80.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Cappuccino (Medium)', 'price' => 90.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Peppermint Coffee (Small)', 'price' => 90.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Peppermint Coffee (Medium)', 'price' => 100.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Salted Caramel Coffee (Small)', 'price' => 90.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Salted Caramel Coffee (Medium)', 'price' => 100.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Latté (Small)', 'price' => 80.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Latté (Medium)', 'price' => 90.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Butterscotch Latté (Small)', 'price' => 90.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Butterscotch Latté (Medium)', 'price' => 100.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Hazelnut Latté (Small)', 'price' => 90.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Hazelnut Latté (Medium)', 'price' => 100.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Strawberry Latté (Small)', 'price' => 90.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Strawberry Latté (Medium)', 'price' => 100.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Mocha Latté (Small)', 'price' => 95.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Mocha Latté (Medium)', 'price' => 105.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Caramel Macchiato (Small)', 'price' => 95.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Caramel Macchiato (Medium)', 'price' => 105.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Iced Americano', 'price' => 90.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Iced Cappuccino', 'price' => 110.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Iced Latté', 'price' => 110.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Iced Butterscotch Latté', 'price' => 120.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Iced French Vanilla Latté', 'price' => 120.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Iced Hazelnut Latté', 'price' => 120.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Iced Strawberry Latté', 'price' => 120.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Iced Salted Caramel Coffee', 'price' => 120.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Iced Dirty Mocha Latté', 'price' => 130.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Iced Mocha Latté', 'price' => 130.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Iced Peppermint Coffee', 'price' => 130.00],
            ['category_id' => $categoryIds['Coffee'], 'name' => 'Iced Caramel Macchiato', 'price' => 130.00],

            // ─── Non-Coffee ───────────────────
            ['category_id' => $categoryIds['Non-Coffee'], 'name' => 'Hot Green Tea', 'price' => 50.00],
            ['category_id' => $categoryIds['Non-Coffee'], 'name' => 'Hot Green Tea | Honey', 'price' => 70.00],
            ['category_id' => $categoryIds['Non-Coffee'], 'name' => 'Hot Matcha Green Tea', 'price' => 70.00],
            ['category_id' => $categoryIds['Non-Coffee'], 'name' => 'Hot Chamomile Tea', 'price' => 70.00],
            ['category_id' => $categoryIds['Non-Coffee'], 'name' => 'Hot Peppermint Tea', 'price' => 60.00],
            ['category_id' => $categoryIds['Non-Coffee'], 'name' => 'Iced Choco Latté', 'price' => 120.00],
            ['category_id' => $categoryIds['Non-Coffee'], 'name' => 'Iced Matcha Latté', 'price' => 120.00],
            ['category_id' => $categoryIds['Non-Coffee'], 'name' => 'Iced Strawberry Latté (Non-Coffee)', 'price' => 120.00],

            // ─── Frappes ───────────────────
            ['category_id' => $categoryIds['Frappes'], 'name' => 'Salted Caramel Frappe', 'price' => 140.00],
            ['category_id' => $categoryIds['Frappes'], 'name' => 'Mocha Frappe', 'price' => 150.00],
            ['category_id' => $categoryIds['Frappes'], 'name' => 'Caramel Macchiato Frappe', 'price' => 150.00],
            ['category_id' => $categoryIds['Frappes'], 'name' => 'Cookies & Cream Frappe', 'price' => 150.00],
            ['category_id' => $categoryIds['Frappes'], 'name' => 'Choco Hazelnut Frappe', 'price' => 150.00],
            ['category_id' => $categoryIds['Frappes'], 'name' => 'Matcha Frappe', 'price' => 150.00],
            ['category_id' => $categoryIds['Frappes'], 'name' => 'Strawberry Frappe', 'price' => 160.00],
            ['category_id' => $categoryIds['Frappes'], 'name' => 'Matcha Strawberry Frappe', 'price' => 160.00],
            ['category_id' => $categoryIds['Frappes'], 'name' => 'Kitkat Frappe', 'price' => 160.00],
        ];

        foreach ($items as $item) {
            MenuItem::updateOrCreate(
                ['name' => $item['name'], 'category_id' => $item['category_id']],
                array_merge($item, ['is_available' => true])
            );
        }
    }
}
