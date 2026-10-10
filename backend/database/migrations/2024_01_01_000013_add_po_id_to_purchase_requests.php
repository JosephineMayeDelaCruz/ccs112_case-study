<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_requests', function (Blueprint $table) {
            // Links the PR to the PO it was converted to (prevents double-convert)
            $table->foreignId('converted_po_id')
                ->nullable()
                ->after('status')
                ->constrained('purchase_orders')
                ->nullOnDelete();
        });

        // Add Approved/Received statuses to purchase_orders
        // (status column is already a string, no schema change needed)
        // Add po_id to purchase requests for receiving link
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->string('notes')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('purchase_requests', function (Blueprint $table) {
            $table->dropForeign(['converted_po_id']);
            $table->dropColumn('converted_po_id');
        });
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropColumn('notes');
        });
    }
};
