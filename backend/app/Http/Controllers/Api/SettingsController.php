<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    private const KNOWN_KEYS = [
        'lowStockAlerts',
        'expiryAlerts',
        'smsNotifications',
        'autoGeneratePO',
    ];

    private const DEFAULTS = [
        'lowStockAlerts'  => 'true',
        'expiryAlerts'    => 'true',
        'smsNotifications' => 'false',
        'autoGeneratePO'  => 'false',
    ];

    // GET /api/settings — admin only
    public function index(Request $request)
    {
        $this->requireRole($request, ['admin']);

        $stored = Setting::allAsMap();
        $result = [];
        foreach (self::KNOWN_KEYS as $key) {
            $raw = $stored[$key] ?? self::DEFAULTS[$key];
            $result[$key] = filter_var($raw, FILTER_VALIDATE_BOOLEAN);
        }

        return response()->json($result);
    }

    // PUT /api/settings — admin only
    // Body: { lowStockAlerts: bool, expiryAlerts: bool, ... }
    public function update(Request $request)
    {
        $this->requireRole($request, ['admin']);

        $validated = $request->validate([
            'lowStockAlerts'   => 'sometimes|boolean',
            'expiryAlerts'     => 'sometimes|boolean',
            'smsNotifications' => 'sometimes|boolean',
            'autoGeneratePO'   => 'sometimes|boolean',
        ]);

        foreach ($validated as $key => $value) {
            if (in_array($key, self::KNOWN_KEYS, true)) {
                Setting::set($key, $value ? 'true' : 'false');
            }
        }

        AuditLog::record($request->user(), 'Updated system settings');

        return response()->json(['message' => 'Settings saved.']);
    }

    private function requireRole(Request $request, array $roles): void
    {
        if (! in_array($request->user()->role, $roles, true)) {
            abort(403, 'Forbidden.');
        }
    }
}
