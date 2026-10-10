<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use Illuminate\Http\Request;

class PurchaseRequestController extends Controller
{
    // GET /api/purchase-requests
    public function index()
    {
        return PurchaseRequest::latest()->get()->map(fn ($r) => $this->format($r));
    }

    // POST /api/purchase-requests — any authenticated user (staff/clerk/manager/admin)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'item' => 'required|string|max:255',
            'qty'  => 'required|integer|min:1',
            'notes' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        $pr = PurchaseRequest::create([
            'code'                => PurchaseRequest::nextCode(),
            'requested_by'        => $user->id,
            'requested_by_label'  => $user->name,
            'item'                => $validated['item'],
            'qty'                 => $validated['qty'],
            'status'              => 'Pending review',
        ]);

        AuditLog::record($user, "Created purchase request {$pr->code} for {$pr->item} (qty {$pr->qty})");

        return response()->json($this->format($pr), 201);
    }

    // PATCH /api/purchase-requests/{code}/convert — manager/admin only
    // Marks the request converted AND creates a matching PurchaseOrder.
    // Blocked if already converted (prevents duplicate POs).
    public function convert(Request $request, string $code)
    {
        $this->requireRole($request, ['admin', 'manager']);

        $purchaseRequest = PurchaseRequest::where('code', $code)->firstOrFail();

        // Block converting the same PR twice
        if ($purchaseRequest->converted_po_id !== null) {
            abort(422, "{$code} has already been converted to a PO.");
        }
        if ($purchaseRequest->status === 'Converted to PO') {
            abort(422, "{$code} has already been converted to a PO.");
        }

        $po = PurchaseOrder::create([
            'code'           => PurchaseOrder::nextCode(),
            'supplier_label' => 'TBD — from ' . $purchaseRequest->code,
            'items'          => 1,
            'total'          => 0,
            'notes'          => "Item: {$purchaseRequest->item}, Qty: {$purchaseRequest->qty}",
            'status'         => 'Pending',
        ]);

        $purchaseRequest->update([
            'status'          => 'Converted to PO',
            'converted_po_id' => $po->id,
        ]);

        AuditLog::record($request->user(), "Converted {$purchaseRequest->code} to {$po->code}");

        return response()->json(
            $this->format($purchaseRequest->fresh()) + ['convertedPoCode' => $po->code]
        );
    }

    private function format(PurchaseRequest $r): array
    {
        return [
            'id'             => $r->code,
            'requestedBy'    => $r->requested_by_label,
            'item'           => $r->item,
            'qty'            => $r->qty,
            'status'         => $r->status,
            'convertedPoCode' => $r->convertedPo?->code,
        ];
    }

    private function requireRole(Request $request, array $roles): void
    {
        if (! in_array($request->user()->role, $roles, true)) {
            abort(403, 'Forbidden.');
        }
    }
}
