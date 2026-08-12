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
        Schema::table('doctors', function (Blueprint $table) {
            $table->time('available_from_time')->default('09:00')->after('appointment_duration');
            $table->time('available_to_time')->default('17:00')->after('available_from_time');
            $table->time('break_start_time')->nullable()->after('available_to_time');
            $table->time('break_end_time')->nullable()->after('break_start_time');
            $table->json('available_days')->nullable()->after('break_end_time');
            $table->integer('slot_duration')->default(30)->after('available_days');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->dropColumn(['available_from_time', 'available_to_time', 'break_start_time', 'break_end_time', 'available_days', 'slot_duration']);
        });
    }
};
