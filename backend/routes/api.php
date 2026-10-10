<?php

use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BatchController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PickingOrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\PurchaseRequestController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// ── Public ──────────────────────────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);

// ── Authenticated ────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Products — read: any auth; write: admin/products/staff (enforced in controller)
    Route::get('/products',                      [ProductController::class, 'index']);
    Route::post('/products',                     [ProductController::class, 'store']);
    Route::put('/products/{product}',            [ProductController::class, 'update']);
    Route::patch('/products/{product}/restock',  [ProductController::class, 'restock']);

    // Batches
    Route::get('/batches',                [BatchController::class, 'index']);
    Route::post('/batches',               [BatchController::class, 'store']);
    Route::patch('/batches/{batch}/adjust', [BatchController::class, 'adjust']);
    Route::get('/batches/fifo/{product}', [BatchController::class, 'fifo']);

    // Stock Movements
    Route::get('/stock-movements',  [StockMovementController::class, 'index']);
    Route::post('/stock-movements', [StockMovementController::class, 'store']);

    // Users — read/write: admin only (enforced in controller)
    Route::get('/users',             [UserController::class, 'index']);
    Route::post('/users',            [UserController::class, 'store']);
    Route::patch('/users/{user}',    [UserController::class, 'update']);

    // Audit logs — admin only (enforced in controller)
    Route::get('/audit-logs', [AuditLogController::class, 'index']);

    // Settings — admin only (enforced in controller)
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::put('/settings', [SettingsController::class, 'update']);

    // Suppliers
    Route::get('/suppliers', [SupplierController::class, 'index']);

    // Purchase Orders
    Route::get('/purchase-orders',                       [PurchaseOrderController::class, 'index']);
    Route::post('/purchase-orders',                      [PurchaseOrderController::class, 'store']);
    Route::patch('/purchase-orders/{code}/approve',      [PurchaseOrderController::class, 'approve']);
    Route::patch('/purchase-orders/{code}/receive',      [PurchaseOrderController::class, 'receive']);

    // Purchase Requests
    Route::get('/purchase-requests',                     [PurchaseRequestController::class, 'index']);
    Route::post('/purchase-requests',                    [PurchaseRequestController::class, 'store']);
    Route::patch('/purchase-requests/{code}/convert',    [PurchaseRequestController::class, 'convert']);

    // Picking Orders
    Route::get('/picking-orders',                        [PickingOrderController::class, 'index']);
    Route::post('/picking-orders',                       [PickingOrderController::class, 'store']);
    Route::patch('/picking-orders/{code}/pick',          [PickingOrderController::class, 'pick']);
    Route::patch('/picking-orders/{code}/ship',          [PickingOrderController::class, 'ship']);

    // Dashboards (real data)
    Route::get('/dashboard/admin',      [DashboardController::class, 'admin']);
    Route::get('/dashboard/warehouse',  [DashboardController::class, 'warehouse']);
    Route::get('/dashboard/picking',    [DashboardController::class, 'picking']);
    Route::get('/dashboard/purchasing', [DashboardController::class, 'purchasing']);
});
