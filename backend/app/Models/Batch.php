<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Batch extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'product_id', 'product_label', 'received_date', 'expiry_date', 'qty',
    ];

    protected function casts(): array
    {
        return [
            'received_date' => 'date',
            'expiry_date'   => 'date',
        ];
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Deduct qty from this batch and sync the parent product's total qty.
     * Returns the actual qty deducted (may be less than requested if batch
     * runs out).
     */
    public function deduct(int $amount): int
    {
        $actual = min($amount, $this->qty);
        $this->decrement('qty', $actual);

        // Keep product.qty in sync
        if ($this->product_id) {
            Product::where('id', $this->product_id)->decrement('qty', $actual);
        }

        return $actual;
    }

    /**
     * Add qty to this batch and sync the parent product's total qty.
     */
    public function receive(int $amount): void
    {
        $this->increment('qty', $amount);

        if ($this->product_id) {
            Product::where('id', $this->product_id)->increment('qty', $amount);
        }
    }
}
