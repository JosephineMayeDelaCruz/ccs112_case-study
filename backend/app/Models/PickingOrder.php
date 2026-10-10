<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PickingOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'customer', 'status', 'picked_by', 'fulfilled_at',
    ];

    protected function casts(): array
    {
        return [
            'fulfilled_at' => 'datetime',
        ];
    }

    public function lines()
    {
        return $this->hasMany(PickingOrderLine::class);
    }

    public function picker()
    {
        return $this->belongsTo(User::class, 'picked_by');
    }

    public static function nextCode(): string
    {
        $last = static::query()->orderByDesc('id')->first();
        $lastNumber = $last ? ltrim(str_replace('#', '', $last->code), '0') : 24;
        return '#' . str_pad((int)$lastNumber + 1, 6, '0', STR_PAD_LEFT);
    }
}
