<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'supplier_id', 'supplier_label', 'items', 'total', 'status', 'notes'];

    protected function casts(): array
    {
        return ['total' => 'decimal:2'];
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    // Generates the next sequential code, e.g. "PO-1041"
    public static function nextCode(): string
    {
        $last = static::query()->orderByDesc('id')->first();
        $lastNumber = $last ? (int) str_replace('PO-', '', $last->code) : 1040;
        return 'PO-' . ($lastNumber + 1);
    }
}
