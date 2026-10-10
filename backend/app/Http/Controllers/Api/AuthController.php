<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // POST /api/login
    // Body: { role, email, password }
    public function login(Request $request)
    {
        $validated = $request->validate([
            'role'     => 'required|string|in:staff,admin,manager,products',
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        if ($user->role !== $validated['role']) {
            throw ValidationException::withMessages([
                'role' => ['This account is not registered under that role.'],
            ]);
        }

        // Block inactive users from logging in
        if ($user->status === 'Inactive') {
            throw ValidationException::withMessages([
                'email' => ['This account has been deactivated. Contact your administrator.'],
            ]);
        }

        $user->forceFill(['last_active_at' => now()])->save();

        $token = $user->createToken('walangbrownout')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'                  => $user->id,
                'name'                => $user->name,
                'email'               => $user->email,
                'role'                => $user->role,
                'must_change_password' => (bool) $user->must_change_password,
            ],
        ]);
    }

    // POST /api/logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out.']);
    }

    // GET /api/me — used on app reload to restore session from a stored token
    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id'                  => $user->id,
            'name'                => $user->name,
            'email'               => $user->email,
            'role'                => $user->role,
            'must_change_password' => (bool) $user->must_change_password,
        ]);
    }
}
