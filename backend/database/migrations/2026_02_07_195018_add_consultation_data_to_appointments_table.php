<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->longText('consultation_notes')->nullable()->after('notes');
            $table->string('rejection_reason')->nullable()->after('consultation_notes');
            $table->enum('acceptance_status', ['pending', 'accepted', 'rejected'])->default('pending')->after('rejection_reason');
            $table->timestamp('accepted_at')->nullable()->after('acceptance_status');
            $table->timestamp('rejected_at')->nullable()->after('accepted_at');
            $table->timestamp('completed_at')->nullable()->after('rejected_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['consultation_notes', 'rejection_reason', 'acceptance_status', 'accepted_at', 'rejected_at', 'completed_at']);
        });
    }
};
