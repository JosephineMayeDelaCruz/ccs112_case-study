<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PickingOrderLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'picking_order_id', 'product_id', 'product_label', 'qty', 'picked_qty',
    ];

    public function order()
    {
        return $this->belongsTo(PickingOrder::class, 'picking_order_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
