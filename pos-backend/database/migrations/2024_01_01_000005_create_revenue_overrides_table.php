<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('revenue_overrides', function (Blueprint $table) {
            $table->id();
            $table->date('period_date'); // for daily: the specific date; for monthly: first day of month
            $table->enum('period_type', ['daily', 'monthly']);
            $table->decimal('override_amount', 12, 2);
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['period_date', 'period_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revenue_overrides');
    }
};
