<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;

class SupplierController extends Controller
{
    // GET /api/suppliers
    // Shapes each supplier to match the frontend's expected camelCase field
    // (leadTime) instead of the raw database column (lead_time).
    public function index()
    {
        return Supplier::orderBy('name')->get()->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'contact' => $s->contact,
            'leadTime' => $s->lead_time,
            'rating' => $s->rating,
        ]);
    }
}
