<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'sku', 'category', 'qty', 'price'];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'qty' => 'integer',
        ];
    }

    public const LOW_STOCK_THRESHOLD = 15;

    public function isLowStock(): bool
    {
        return $this->qty < self::LOW_STOCK_THRESHOLD;
    }

    public function batches()
    {
        return $this->hasMany(Batch::class);
    }

    /**
     * FIFO: returns the oldest batch for this product that still has stock,
     * ordered by received_date ascending (then expiry_date).
     */
    public function oldestBatchWithStock(): ?Batch
    {
        return $this->batches()
            ->where('qty', '>', 0)
            ->orderBy('received_date')
            ->orderBy('expiry_date')
            ->first();
    }
}
