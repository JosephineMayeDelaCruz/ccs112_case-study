<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Batch;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;

class BatchController extends Controller
{
    // GET /api/batches
    public function index()
    {
        return Batch::orderBy('received_date')->get()->map(fn ($b) => $this->format($b));
    }

    // POST /api/batches — create a new batch (used by Receiving when linked to a PO)
    public function store(Request $request)
    {
        $this->requireRole($request, ['admin', 'products', 'staff']);

        $validated = $request->validate([
            'code'          => 'required|string|max:50|unique:batches,code',
            'product_id'    => 'required|exists:products,id',
            'received_date' => 'required|date',
            'expiry_date'   => 'nullable|date|after:received_date',
            'qty'           => 'required|integer|min:1|max:100000',
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $validated['product_label'] = $product->name;

        $batch = Batch::create($validated);

        // Receiving increases both batch and product qty
        $product->increment('qty', $validated['qty']);

        AuditLog::record(
            $request->user(),
            "Created batch {$batch->code} for {$product->name}, qty {$validated['qty']}"
        );

        return response()->json($this->format($batch->fresh()), 201);
    }

    // PATCH /api/batches/{batch}/adjust — inventory/admin only
    // Body: { new_count, reason }
    public function adjust(Request $request, Batch $batch)
    {
        $this->requireRole($request, ['admin', 'products']);

        $validated = $request->validate([
            'new_count' => 'required|integer|min:0',
            'reason'    => 'nullable|string|max:255',
        ]);

        $diff = $validated['new_count'] - $batch->qty;

        $batch->update(['qty' => $validated['new_count']]);

        // Sync the product's total qty by the same difference
        if ($batch->product_id && $diff !== 0) {
            if ($diff > 0) {
                Product::where('id', $batch->product_id)->increment('qty', $diff);
            } else {
                Product::where('id', $batch->product_id)->decrement('qty', abs($diff));
            }
        }

        $reason = $validated['reason'] ?? 'no reason given';

        // Log as a stock movement so the movement log reflects the adjustment
        StockMovement::create([
            'product_id'    => $batch->product_id,
            'product_label' => $batch->product_label,
            'batch_id'      => $batch->id,
            'type'          => 'adjusted',
            'qty'           => ($diff >= 0 ? '+' : '') . $diff,
            'status'        => 'flag',
            'user_id'       => $request->user()->id,
            'reference'     => "Batch {$batch->code} adjusted: {$reason}",
        ]);

        AuditLog::record(
            $request->user(),
            "Adjusted batch {$batch->code} to {$validated['new_count']} units ({$reason})"
        );

        return $this->format($batch->fresh());
    }

    // GET /api/batches/fifo/{product} — returns the FIFO batch for a product
    public function fifo(Product $product)
    {
        $batch = $product->oldestBatchWithStock();

        if (! $batch) {
            return response()->json(['message' => 'No stock available for this product.'], 404);
        }

        return response()->json($this->format($batch) + [
            'product_id'  => $batch->product_id,
            'expiry_date' => $batch->expiry_date?->format('M d, Y'),
        ]);
    }

    // Shapes a Batch model into the fields the React frontend expects
    private function format(Batch $batch): array
    {
        return [
            'id'          => $batch->id,
            'code'        => $batch->code,
            'product'     => $batch->product_label,
            'product_id'  => $batch->product_id,
            'received'    => $batch->received_date->format('M d'),
            'expiry_date' => $batch->expiry_date?->format('M d, Y'),
            'qty'         => $batch->qty,
        ];
    }

    private function requireRole(Request $request, array $roles): void
    {
        if (! in_array($request->user()->role, $roles, true)) {
            abort(403, 'Forbidden.');
        }
    }
}
