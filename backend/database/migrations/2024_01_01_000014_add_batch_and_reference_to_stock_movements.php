<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->foreignId('batch_id')
                ->nullable()
                ->after('product_id')
                ->constrained('batches')
                ->nullOnDelete();
            // Free-text reference e.g. "PO-1041", "Order #000025"
            $table->string('reference')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropForeign(['batch_id']);
            $table->dropColumn(['batch_id', 'reference']);
        });
    }
};
