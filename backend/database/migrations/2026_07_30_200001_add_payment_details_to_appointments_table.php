<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('transaction_id')->nullable()->after('amount');
            $table->string('payment_gateway')->nullable()->after('transaction_id'); // jazzcash, easypaisa, bank_transfer, card
            $table->string('payment_reference')->nullable()->after('payment_gateway');
            $table->timestamp('payment_at')->nullable()->after('payment_reference');
            $table->enum('payment_verification_status', ['pending', 'verified', 'rejected'])->nullable()->after('payment_at');
            $table->text('payment_notes')->nullable()->after('payment_verification_status');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn([
                'transaction_id',
                'payment_gateway',
                'payment_reference',
                'payment_at',
                'payment_verification_status',
                'payment_notes',
            ]);
        });
    }
};
