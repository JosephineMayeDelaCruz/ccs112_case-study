<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Batch;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockMovementController extends Controller
{
    // GET /api/stock-movements
    public function index()
    {
        return StockMovement::with('user')
            ->latest()
            ->limit(200)
            ->get()
            ->map(fn ($m) => [
                'id'        => $m->id,
                'product'   => $m->product_label,
                'batch'     => $m->batch_id ? optional($m->batch)->code : null,
                'type'      => $m->type,
                'qty'       => $m->qty,
                'status'    => $m->status,
                'reference' => $m->reference,
                'user'      => $m->user?->name ?? 'System',
                'date'      => $m->created_at->setTimezone('Asia/Manila')->format('M j, g:i A'),
            ]);
    }

    // POST /api/stock-movements
    // This is the main endpoint for warehouse transactions.
    // It ACTUALLY updates batch and product quantities, not just logs.
    //
    // Body:
    //   product_id?    — if given, a real product is targeted
    //   batch_id?      — if given, deduct/receive from that specific batch
    //   product_label  — display name (used when no product_id)
    //   type           — received|sold|transferred|adjusted|returned
    //   qty            — positive integer (direction inferred from type)
    //   status?        — ok|flag (default: ok)
    //   override_reason? — required when picking a non-FIFO batch
    //   reference?     — free-text e.g. "PO-1041", "Order #000025"
    public function store(Request $request)
    {
        $this->requireRole($request, ['admin', 'products', 'staff']);

        $validated = $request->validate([
            'product_id'      => 'nullable|integer|exists:products,id',
            'batch_id'        => 'nullable|integer|exists:batches,id',
            'product_label'   => 'required|string|max:255',
            'type'            => 'required|string|in:received,sold,transferred,adjusted,returned',
            'qty'             => 'required|integer|min:1',
            'status'          => 'nullable|string|in:ok,flag',
            'override_reason' => 'nullable|string|max:500',
            'reference'       => 'nullable|string|max:255',
        ]);

        $type      = $validated['type'];
        $qty       = (int) $validated['qty'];
        $status    = $validated['status'] ?? 'ok';
        $productId = $validated['product_id'] ?? null;
        $batchId   = $validated['batch_id'] ?? null;

        return DB::transaction(function () use ($validated, $type, $qty, $status, $productId, $batchId, $request) {

            // ── Inbound (received / returned) — increases stock ────────────────
            if (in_array($type, ['received', 'returned'], true)) {
                if ($batchId) {
                    $batch = Batch::findOrFail($batchId);
                    $batch->receive($qty);
                } elseif ($productId) {
                    // No batch specified — just bump the product total
                    Product::where('id', $productId)->increment('qty', $qty);
                }
                $signedQty = '+' . $qty;

            // ── Outbound (sold / transferred) — decreases stock ────────────────
            } elseif (in_array($type, ['sold', 'transferred'], true)) {
                if ($batchId) {
                    $batch = Batch::findOrFail($batchId);
                    if ($batch->qty < $qty) {
                        abort(422, "Insufficient stock in batch {$batch->code}. Available: {$batch->qty}.");
                    }
                    $batch->deduct($qty);
                } elseif ($productId) {
                    $product = Product::findOrFail($productId);
                    if ($product->qty < $qty) {
                        abort(422, "Insufficient stock for {$product->name}. Available: {$product->qty}.");
                    }
                    $product->decrement('qty', $qty);
                }
                $signedQty = '-' . $qty;

            // ── Adjustment — sets an absolute count via BatchController::adjust ──
            } else {
                // 'adjusted' type: treat as a delta (+/-)
                // Clients should prefer PATCH /batches/{id}/adjust for precision.
                $signedQty = '+' . $qty; // store positive; context is 'adjusted'
            }

            // Log the override if a non-FIFO batch was chosen
            if ($batchId && isset($validated['override_reason']) && $validated['override_reason']) {
                AuditLog::record(
                    $request->user(),
                    "FIFO override on batch #{$batchId}: " . $validated['override_reason']
                );
            }

            $movement = StockMovement::create([
                'product_id'    => $productId,
                'product_label' => $validated['product_label'],
                'batch_id'      => $batchId,
                'type'          => $type,
                'qty'           => $signedQty,
                'status'        => $status,
                'user_id'       => $request->user()->id,
                'reference'     => $validated['reference'] ?? null,
            ]);

            AuditLog::record(
                $request->user(),
                "{$type} {$qty} unit(s) of {$validated['product_label']}" .
                ($validated['reference'] ? " [{$validated['reference']}]" : "")
            );

            return response()->json([
                'id'        => $movement->id,
                'product'   => $movement->product_label,
                'type'      => $movement->type,
                'qty'       => $movement->qty,
                'status'    => $movement->status,
                'reference' => $movement->reference,
                'date'      => $movement->created_at->setTimezone('Asia/Manila')->format('M j, g:i A'),
            ], 201);
        });
    }

    private function requireRole(Request $request, array $roles): void
    {
        if (! in_array($request->user()->role, $roles, true)) {
            abort(403, 'Forbidden.');
        }
    }
}
