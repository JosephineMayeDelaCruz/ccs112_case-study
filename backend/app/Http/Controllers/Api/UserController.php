<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // GET /api/users — admin only
    public function index(Request $request)
    {
        $this->requireRole($request, ['admin']);

        return User::orderBy('name')->get()->map(fn ($u) => $this->format($u));
    }

    // POST /api/users — admin only
    // Body: { name, email, role, temp_password }
    public function store(Request $request)
    {
        $this->requireRole($request, ['admin']);

        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|string|email|unique:users,email',
            'role'          => 'required|string|in:Warehouse Staff,Inventory Clerk,Purchasing Manager,System Admin',
            'temp_password' => 'required|string|min:6|max:100',
        ]);

        $roleId = match ($validated['role']) {
            'Warehouse Staff'    => 'staff',
            'Inventory Clerk'    => 'products',
            'Purchasing Manager' => 'manager',
            'System Admin'       => 'admin',
        };

        $user = User::create([
            'name'                 => $validated['name'],
            'email'                => $validated['email'],
            'password'             => Hash::make($validated['temp_password']),
            'temp_password'        => $validated['temp_password'],  // stored for admin reference
            'must_change_password' => true,
            'role'                 => $roleId,
            'status'               => 'Active',
        ]);

        AuditLog::record($request->user(), "Added user {$user->name} as {$validated['role']}");

        return response()->json($this->format($user), 201);
    }

    // PATCH /api/users/{user} — admin only
    // Allows editing name, email, role, status, and resetting the temp password
    public function update(Request $request, User $user)
    {
        $this->requireRole($request, ['admin']);

        $validated = $request->validate([
            'name'          => 'sometimes|required|string|max:255',
            'email'         => 'sometimes|required|string|email|unique:users,email,' . $user->id,
            'role'          => 'sometimes|required|string|in:Warehouse Staff,Inventory Clerk,Purchasing Manager,System Admin',
            'status'        => 'sometimes|required|string|in:Active,Inactive',
            'temp_password' => 'sometimes|nullable|string|min:6|max:100',
        ]);

        if (isset($validated['role'])) {
            $validated['role'] = match ($validated['role']) {
                'Warehouse Staff'    => 'staff',
                'Inventory Clerk'    => 'products',
                'Purchasing Manager' => 'manager',
                'System Admin'       => 'admin',
            };
        }

        if (isset($validated['temp_password']) && $validated['temp_password']) {
            $validated['password'] = Hash::make($validated['temp_password']);
            $validated['must_change_password'] = true;
        }
        unset($validated['temp_password']);

        $user->update($validated);
        AuditLog::record($request->user(), "Updated user {$user->name}");

        return response()->json($this->format($user->fresh()));
    }

    private function format(User $user): array
    {
        return [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'role'       => $user->roleLabel(),
            'roleKey'    => $user->role,
            'lastActive' => $user->last_active_at?->diffForHumans() ?? 'Never',
            'status'     => $user->status,
        ];
    }

    private function requireRole(Request $request, array $roles): void
    {
        if (! in_array($request->user()->role, $roles, true)) {
            abort(403, 'Forbidden.');
        }
    }
}
