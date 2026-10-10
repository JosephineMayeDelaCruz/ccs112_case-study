<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // GET /api/products
    public function index()
    {
        return Product::orderBy('name')->get()->map(fn ($p) => $this->format($p));
    }

    // POST /api/products — admin/inventory only
    public function store(Request $request)
    {
        $this->requireRole($request, ['admin', 'products']);

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'sku'      => 'nullable|string|max:100|unique:products,sku',
            'category' => 'required|string|max:255',
            'qty'      => 'required|integer|min:0',
            'price'    => 'required|numeric|min:0',
        ]);

        $product = Product::create($validated);
        AuditLog::record($request->user(), "Added product {$product->name}" . ($product->sku ? " (SKU: {$product->sku})" : ""));

        return response()->json($this->format($product), 201);
    }

    // PUT /api/products/{product} — admin/inventory only
    public function update(Request $request, Product $product)
    {
        $this->requireRole($request, ['admin', 'products']);

        $validated = $request->validate([
            'name'     => 'sometimes|required|string|max:255',
            'sku'      => 'nullable|string|max:100|unique:products,sku,' . $product->id,
            'category' => 'sometimes|required|string|max:255',
            'qty'      => 'sometimes|required|integer|min:0',
            'price'    => 'sometimes|required|numeric|min:0',
        ]);

        $product->update($validated);
        AuditLog::record($request->user(), "Updated product {$product->name}");

        return response()->json($this->format($product->fresh()));
    }

    // PATCH /api/products/{product}/restock — warehouse/admin/inventory only
    public function restock(Request $request, Product $product)
    {
        $this->requireRole($request, ['admin', 'products', 'staff']);

        $validated = $request->validate([
            'amount' => 'required|integer|min:1|max:10000',
        ]);

        $amount = $validated['amount'];
        $product->increment('qty', $amount);

        AuditLog::record($request->user(), "Restocked {$product->name} by {$amount} unit(s)");

        return response()->json($this->format($product->fresh()));
    }

    private function format(Product $product): array
    {
        return [
            'id'       => $product->id,
            'name'     => $product->name,
            'sku'      => $product->sku,
            'category' => $product->category,
            'qty'      => $product->qty,
            'price'    => (float) $product->price,
        ];
    }

    private function requireRole(Request $request, array $roles): void
    {
        if (! in_array($request->user()->role, $roles, true)) {
            abort(403, 'Forbidden.');
        }
    }
}
