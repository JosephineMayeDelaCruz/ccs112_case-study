<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\PickingOrder;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    // GET /api/dashboard/admin
    public function admin(Request $request)
    {
        $this->requireRole($request, ['admin']);

        $users      = User::all();
        $recentIds  = ['second', 'minute', 'hour'];
        $activeToday = $users->filter(function ($u) {
            return $u->last_active_at && $u->last_active_at->isToday();
        })->count();

        $lowStock       = Product::where('qty', '<', Product::LOW_STOCK_THRESHOLD)->count();
        $pendingApprovals = PurchaseOrder::where('status', 'Pending')->count();

        // Weekly stock movements (last 7 days), grouped by day
        $days = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date  = Carbon::now('Asia/Manila')->subDays($i)->toDateString();
            $count = StockMovement::whereDate('created_at', $date)->count();
            $days->push(['date' => Carbon::parse($date)->format('D'), 'count' => $count]);
        }

        return response()->json([
            'totalUsers'       => $users->count(),
            'activeToday'      => $activeToday,
            'lowStockAlerts'   => $lowStock,
            'pendingApprovals' => $pendingApprovals,
            'weeklyMovements'  => $days,
        ]);
    }

    // GET /api/dashboard/warehouse
    public function warehouse(Request $request)
    {
        $this->requireRole($request, ['staff', 'admin']);

        $lowStock    = Product::where('qty', '<', Product::LOW_STOCK_THRESHOLD)->count();
        $flagged     = StockMovement::where('status', 'flag')
            ->whereDate('created_at', '>=', Carbon::now()->subDays(7))
            ->count();

        $expiring30 = Batch::where('qty', '>', 0)
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<=', Carbon::now()->addDays(30))
            ->count();

        $pendingTransfers = StockMovement::where('type', 'transferred')
            ->whereDate('created_at', '>=', Carbon::now()->subDays(7))
            ->count();

        // Recent activity (last 5 movements)
        $recent = StockMovement::with('user')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($m) => [
                'text' => "{$m->product_label} · {$m->qty} {$m->type}",
                'meta' => $m->created_at->setTimezone('Asia/Manila')->format('g:i A'),
            ]);

        return response()->json([
            'lowStock'         => $lowStock,
            'expiring30'       => $expiring30,
            'flagged'          => $flagged,
            'pendingTransfers' => $pendingTransfers,
            'recentActivity'   => $recent,
        ]);
    }

    // GET /api/dashboard/picking
    public function picking(Request $request)
    {
        $this->requireRole($request, ['staff', 'admin']);

        $pending    = PickingOrder::where('status', 'Pending')->count();
        $today      = PickingOrder::where('status', 'Fulfilled')
            ->whereDate('fulfilled_at', Carbon::today('Asia/Manila'))
            ->count();

        return response()->json([
            'ordersToPick'   => $pending,
            'fulfilledToday' => $today,
        ]);
    }

    // GET /api/dashboard/purchasing
    // (Kept for completeness; the frontend already calls /purchase-orders directly)
    public function purchasing(Request $request)
    {
        $this->requireRole($request, ['manager', 'admin']);

        $orders    = PurchaseOrder::all();
        $pending   = $orders->where('status', 'Pending')->count();
        $total     = $orders->sum('total');

        // Monthly spend: last 6 months
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $spend = PurchaseOrder::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->sum('total');
            $months->push(['month' => $month->format('M'), 'spend' => (float) $spend]);
        }

        return response()->json([
            'openPOs'        => $orders->count(),
            'pendingCount'   => $pending,
            'totalCommitted' => (float) $total,
            'monthlySpend'   => $months,
        ]);
    }

    private function requireRole(Request $request, array $roles): void
    {
        if (! in_array($request->user()->role, $roles, true)) {
            abort(403, 'Forbidden.');
        }
    }
}
