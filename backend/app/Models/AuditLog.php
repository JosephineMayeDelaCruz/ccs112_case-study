<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'user_label', 'action'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Convenience helper any controller can call to record an action,
    // e.g. AuditLog::record($request->user(), "Updated reorder threshold for X");
    public static function record(?User $user, string $action): self
    {
        return static::create([
            'user_id' => $user?->id,
            'user_label' => $user?->name ?? 'System',
            'action' => $action,
        ]);
    }
}
