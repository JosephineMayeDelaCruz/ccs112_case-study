<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    // GET /api/audit-logs — admin only
    public function index(Request $request)
    {
        $this->requireRole($request, ['admin']);

        return AuditLog::latest()
            ->limit(200)
            ->get()
            ->map(fn ($a) => [
                'user'   => $a->user_label,
                'action' => $a->action,
                'time'   => $a->created_at->setTimezone('Asia/Manila')->format('M j, Y g:i A'),
            ]);
    }

    private function requireRole(Request $request, array $roles): void
    {
        if (! in_array($request->user()->role, $roles, true)) {
            abort(403, 'Forbidden.');
        }
    }
}
