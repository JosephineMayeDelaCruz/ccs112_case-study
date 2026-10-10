<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Stores the plain-text temporary password set by the admin.
            // Cleared to null once the user logs in for the first time.
            $table->string('temp_password')->nullable()->after('password');
            // Track whether the user must change their password on first login
            $table->boolean('must_change_password')->default(false)->after('temp_password');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['temp_password', 'must_change_password']);
        });
    }
};
