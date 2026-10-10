<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'requested_by', 'requested_by_label', 'item', 'qty', 'status', 'converted_po_id',
    ];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function convertedPo()
    {
        return $this->belongsTo(PurchaseOrder::class, 'converted_po_id');
    }

    public static function nextCode(): string
    {
        $last = static::query()->orderByDesc('id')->first();
        $lastNumber = $last ? (int) str_replace('PR-', '', $last->code) : 329;
        return 'PR-' . ($lastNumber + 1);
    }
}
