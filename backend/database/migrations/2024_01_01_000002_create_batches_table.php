<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->string('code'); // e.g. "B-101"
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_label'); // display fallback, e.g. "Replacement filter"
            $table->date('received_date');
            $table->integer('qty')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};
