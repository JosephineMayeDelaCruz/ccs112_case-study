<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'temp_password',
        'must_change_password',
        'role',
        'status',
        'last_active_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'    => 'datetime',
            'last_active_at'       => 'datetime',
            'password'             => 'hashed',
            'must_change_password' => 'boolean',
        ];
    }

    // Human-readable role label, matching the frontend's roleOptions strings
    public function roleLabel(): string
    {
        return match ($this->role) {
            'staff'    => 'Warehouse Staff',
            'admin'    => 'System Admin',
            'manager'  => 'Purchasing Manager',
            'products' => 'Inventory Clerk',
            default    => $this->role,
        };
    }
}
