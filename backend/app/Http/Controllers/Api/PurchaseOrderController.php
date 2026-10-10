<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;

class PurchaseOrderController extends Controller
{
    // GET /api/purchase-orders
    public function index()
    {
        return PurchaseOrder::latest()->get()->map(fn ($po) => $this->format($po));
    }

    // POST /api/purchase-orders — manager/admin only
    // Body: { supplier, items, total }
    public function store(Request $request)
    {
        $this->requireRole($request, ['admin', 'manager']);

        $validated = $request->validate([
            'supplier' => 'required|string|max:255',
            'items'    => 'required|integer|min:1',
            'total'    => 'required|numeric|min:0',
            'notes'    => 'nullable|string|max:1000',
        ]);

        $po = PurchaseOrder::create([
            'code'           => PurchaseOrder::nextCode(),
            'supplier_label' => $validated['supplier'],
            'items'          => $validated['items'],
            'total'          => $validated['total'],
            'notes'          => $validated['notes'] ?? null,
            'status'         => 'Pending',
        ]);

        AuditLog::record($request->user(), "Created {$po->code} for {$po->supplier_label}");

        return response()->json($this->format($po), 201);
    }

    // PATCH /api/purchase-orders/{code}/approve — manager/admin only
    public function approve(Request $request, string $code)
    {
        $this->requireRole($request, ['admin', 'manager']);

        $po = PurchaseOrder::where('code', $code)->firstOrFail();

        if ($po->status !== 'Pending') {
            abort(422, "Only Pending orders can be approved. Current status: {$po->status}.");
        }

        $po->update(['status' => 'Approved']);
        AuditLog::record($request->user(), "Approved {$po->code}");

        return response()->json($this->format($po->fresh()));
    }

    // PATCH /api/purchase-orders/{code}/receive — warehouse/admin only
    // Marks a PO as Received (warehouse staff confirms goods arrived)
    public function receive(Request $request, string $code)
    {
        $this->requireRole($request, ['admin', 'staff']);

        $po = PurchaseOrder::where('code', $code)->firstOrFail();

        if ($po->status !== 'Approved') {
            abort(422, "Only Approved orders can be marked received. Current status: {$po->status}.");
        }

        $po->update(['status' => 'Received']);
        AuditLog::record($request->user(), "Marked {$po->code} as Received");

        return response()->json($this->format($po->fresh()));
    }

    private function format(PurchaseOrder $po): array
    {
        return [
            'id'       => $po->code,
            'supplier' => $po->supplier_label,
            'items'    => $po->items,
            'total'    => (float) $po->total,
            'status'   => $po->status,
            'notes'    => $po->notes,
        ];
    }

    private function requireRole(Request $request, array $roles): void
    {
        if (! in_array($request->user()->role, $roles, true)) {
            abort(403, 'Forbidden.');
        }
    }
}
