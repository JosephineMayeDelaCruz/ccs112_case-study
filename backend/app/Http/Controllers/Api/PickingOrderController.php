<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Batch;
use App\Models\PickingOrder;
use App\Models\PickingOrderLine;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PickingOrderController extends Controller
{
    // GET /api/picking-orders
    public function index()
    {
        return PickingOrder::with('lines')->latest()->get()->map(fn ($o) => $this->format($o));
    }

    // POST /api/picking-orders — admin/staff only
    // Creates a new picking order (with line items)
    public function store(Request $request)
    {
        $this->requireRole($request, ['admin', 'staff']);

        $validated = $request->validate([
            'customer' => 'required|string|max:255',
            'lines'    => 'required|array|min:1',
            'lines.*.product_id' => 'required|exists:products,id',
            'lines.*.qty'        => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $order = PickingOrder::create([
                'code'     => PickingOrder::nextCode(),
                'customer' => $validated['customer'],
                'status'   => 'Pending',
            ]);

            foreach ($validated['lines'] as $line) {
                $product = Product::find($line['product_id']);
                PickingOrderLine::create([
                    'picking_order_id' => $order->id,
                    'product_id'       => $product->id,
                    'product_label'    => $product->name,
                    'qty'              => $line['qty'],
                    'picked_qty'       => 0,
                ]);
            }

            AuditLog::record($request->user(), "Created picking order {$order->code} for {$order->customer}");

            return response()->json($this->format($order->load('lines')), 201);
        });
    }

    // PATCH /api/picking-orders/{code}/pick — marks order as Picked and deducts stock via FIFO
    public function pick(Request $request, string $code)
    {
        $this->requireRole($request, ['admin', 'staff']);

        $validated = $request->validate([
            'override_reason' => 'nullable|string|max:500',
            'damage_note'     => 'nullable|string|max:500',
            // Optional: explicit batch overrides per line { line_id: batch_id }
            'batch_overrides' => 'nullable|array',
            'batch_overrides.*' => 'nullable|integer|exists:batches,id',
        ]);

        return DB::transaction(function () use ($validated, $code, $request) {
            $order = PickingOrder::with('lines')->where('code', $code)->firstOrFail();

            if (in_array($order->status, ['Fulfilled', 'Shipped'], true)) {
                abort(422, "Order {$code} has already been fulfilled.");
            }

            $overrides = $validated['batch_overrides'] ?? [];

            foreach ($order->lines as $line) {
                $remaining = $line->qty;

                // Check if an explicit batch override was requested
                $overrideBatchId = $overrides[$line->id] ?? null;

                if ($overrideBatchId) {
                    $batch = Batch::findOrFail($overrideBatchId);
                    if ($batch->qty < $remaining) {
                        abort(422, "Batch {$batch->code} only has {$batch->qty} units but {$remaining} required.");
                    }
                    $batch->deduct($remaining);

                    StockMovement::create([
                        'product_id'    => $line->product_id,
                        'product_label' => $line->product_label,
                        'batch_id'      => $batch->id,
                        'type'          => 'sold',
                        'qty'           => '-' . $remaining,
                        'status'        => 'flag',
                        'user_id'       => $request->user()->id,
                        'reference'     => "Order {$order->code} (override: " . ($validated['override_reason'] ?? 'no reason') . ")",
                    ]);

                    if ($validated['override_reason'] ?? null) {
                        AuditLog::record(
                            $request->user(),
                            "FIFO override on batch {$batch->code} for order {$code}: " . $validated['override_reason']
                        );
                    }
                } else {
                    // FIFO: pull from oldest batches first
                    if ($line->product_id) {
                        $batches = Batch::where('product_id', $line->product_id)
                            ->where('qty', '>', 0)
                            ->orderBy('received_date')
                            ->orderBy('expiry_date')
                            ->get();

                        $totalAvailable = $batches->sum('qty');
                        if ($totalAvailable < $remaining) {
                            abort(422, "Insufficient stock for {$line->product_label}. Need {$remaining}, available {$totalAvailable}.");
                        }

                        foreach ($batches as $batch) {
                            if ($remaining <= 0) break;
                            $deducted = $batch->deduct($remaining);
                            $remaining -= $deducted;

                            StockMovement::create([
                                'product_id'    => $line->product_id,
                                'product_label' => $line->product_label,
                                'batch_id'      => $batch->id,
                                'type'          => 'sold',
                                'qty'           => '-' . $deducted,
                                'status'        => 'ok',
                                'user_id'       => $request->user()->id,
                                'reference'     => "Order {$order->code} (FIFO)",
                            ]);
                        }
                    } else {
                        // No product link — can't deduct from batches, just log
                        StockMovement::create([
                            'product_id'    => null,
                            'product_label' => $line->product_label,
                            'type'          => 'sold',
                            'qty'           => '-' . $line->qty,
                            'status'        => 'ok',
                            'user_id'       => $request->user()->id,
                            'reference'     => "Order {$order->code}",
                        ]);
                    }
                }

                $line->update(['picked_qty' => $line->qty]);
            }

            if ($validated['damage_note'] ?? null) {
                AuditLog::record(
                    $request->user(),
                    "Damage reported on order {$code}: " . $validated['damage_note']
                );
            }

            $order->update([
                'status'       => 'Fulfilled',
                'picked_by'    => $request->user()->id,
                'fulfilled_at' => now(),
            ]);

            AuditLog::record($request->user(), "Fulfilled picking order {$order->code} for {$order->customer}");

            return response()->json($this->format($order->fresh()->load('lines')));
        });
    }

    // PATCH /api/picking-orders/{code}/ship
    public function ship(Request $request, string $code)
    {
        $this->requireRole($request, ['admin', 'staff']);

        $order = PickingOrder::where('code', $code)->firstOrFail();

        if ($order->status !== 'Fulfilled') {
            abort(422, "Only Fulfilled orders can be shipped. Current status: {$order->status}.");
        }

        $order->update(['status' => 'Shipped']);
        AuditLog::record($request->user(), "Shipped picking order {$order->code}");

        return response()->json($this->format($order->fresh()->load('lines')));
    }

    private function format(PickingOrder $order): array
    {
        $items    = $order->lines->count();
        $totalQty = $order->lines->sum('qty');

        return [
            'id'          => $order->code,
            'customer'    => $order->customer,
            'items'       => $items,
            'qty'         => $totalQty,
            'status'      => $order->status,
            'fulfilled_at' => $order->fulfilled_at?->setTimezone('Asia/Manila')->format('M j, g:i A'),
            'lines'       => $order->lines->map(fn ($l) => [
                'id'            => $l->id,
                'product_id'    => $l->product_id,
                'product_label' => $l->product_label,
                'qty'           => $l->qty,
                'picked_qty'    => $l->picked_qty,
            ]),
        ];
    }

    private function requireRole(Request $request, array $roles): void
    {
        if (! in_array($request->user()->role, $roles, true)) {
            abort(403, 'Forbidden.');
        }
    }
}
