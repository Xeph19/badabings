<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Discount tracking
            $table->foreignId('discount_id')->nullable()->constrained('discounts')->nullOnDelete()->after('notes');
            $table->string('discount_name')->nullable()->after('discount_id');
            $table->decimal('discount_percent', 5, 2)->default(0)->after('discount_name');

            // Financial breakdown
            $table->decimal('gross_amount', 10, 2)->default(0)->after('discount_percent');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('gross_amount');
            $table->decimal('net_amount', 10, 2)->default(0)->after('discount_amount');
            $table->decimal('refund_amount', 10, 2)->default(0)->after('net_amount');
            $table->decimal('cost_of_goods', 10, 2)->default(0)->after('refund_amount');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['discount_id']);
            $table->dropColumn([
                'discount_id', 'discount_name', 'discount_percent',
                'gross_amount', 'discount_amount', 'net_amount',
                'refund_amount', 'cost_of_goods',
            ]);
        });
    }
};
