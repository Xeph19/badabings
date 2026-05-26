<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DiscountController;
use App\Http\Controllers\Api\MenuItemController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\RevenueOverrideController;
use App\Http\Controllers\Api\ShiftController;
use Illuminate\Support\Facades\Route;

// ─── Public ──────────────────────────────────────────────────────────────────
Route::post('/auth/login', [AuthController::class, 'login']);

// ─── All Authenticated ────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Categories (read: all roles; write: admin only via middleware below)
    Route::get('/categories', [CategoryController::class, 'index']);

    // Menu Items (read: all roles)
    Route::get('/menu-items', [MenuItemController::class, 'index']);

    // Discounts (read: all roles; write: admin only)
    Route::get('/discounts', [DiscountController::class, 'index']);

    // Orders (read/write: all roles)
    Route::get('/orders',               [OrderController::class, 'index']);
    Route::post('/orders',              [OrderController::class, 'store']);
    Route::get('/orders/{order}',       [OrderController::class, 'show']);
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);

    // Shifts (all roles)
    Route::get('/shifts/current', [ShiftController::class, 'current']);
    Route::post('/shifts/open',   [ShiftController::class, 'open']);
    Route::put('/shifts/close',   [ShiftController::class, 'close']);
    Route::get('/shifts',         [ShiftController::class, 'index']);

    // ─── Admin-Only Routes ────────────────────────────────────────────────────
    Route::middleware('admin')->group(function () {

        // Categories write
        Route::post('/categories',              [CategoryController::class, 'store']);
        Route::put('/categories/{category}',    [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        // Menu Items write
        Route::post('/menu-items',             [MenuItemController::class, 'store']);
        Route::post('/menu-items/{menuItem}',  [MenuItemController::class, 'update']);
        Route::delete('/menu-items/{menuItem}',[MenuItemController::class, 'destroy']);

        // Discounts write
        Route::post('/discounts',           [DiscountController::class, 'store']);
        Route::put('/discounts/{discount}', [DiscountController::class, 'update']);
        Route::delete('/discounts/{discount}', [DiscountController::class, 'destroy']);

        // Dashboard & Analytics
        Route::get('/dashboard/analytics',       [DashboardController::class, 'analytics']);
        Route::get('/dashboard/summary',          [DashboardController::class, 'summary']);
        Route::get('/dashboard/daily-revenue',    [DashboardController::class, 'dailyRevenue']);
        Route::get('/dashboard/monthly-revenue',  [DashboardController::class, 'monthlyRevenue']);

        // Revenue Overrides
        Route::get('/revenue-overrides',                      [RevenueOverrideController::class, 'index']);
        Route::post('/revenue-overrides',                     [RevenueOverrideController::class, 'upsert']);
        Route::delete('/revenue-overrides/{revenueOverride}', [RevenueOverrideController::class, 'destroy']);
    });
});
