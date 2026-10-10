<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Picking orders (sales orders to be picked)
        Schema::create('picking_orders', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();         // e.g. "#000025"
            $table->string('customer');
            $table->string('status')->default('Pending'); // Pending / Picking / Fulfilled / Shipped
            $table->foreignId('picked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fulfilled_at')->nullable();
            $table->timestamps();
        });

        // Line items on a picking order
        Schema::create('picking_order_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('picking_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_label');
            $table->integer('qty');
            $table->integer('picked_qty')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('picking_order_lines');
        Schema::dropIfExists('picking_orders');
    }
};
