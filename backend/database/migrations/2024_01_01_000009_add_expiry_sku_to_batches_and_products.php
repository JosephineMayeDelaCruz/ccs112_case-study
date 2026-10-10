<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add expiry_date to batches for FIFO logic
        Schema::table('batches', function (Blueprint $table) {
            $table->date('expiry_date')->nullable()->after('received_date');
        });

        // Add SKU to products
        Schema::table('products', function (Blueprint $table) {
            $table->string('sku')->nullable()->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('batches', function (Blueprint $table) {
            $table->dropColumn('expiry_date');
        });
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('sku');
        });
    }
};
