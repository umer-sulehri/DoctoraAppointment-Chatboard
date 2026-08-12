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
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('specialty_id')->constrained('specialties')->onDelete('restrict');
            $table->string('license_number')->unique();
            $table->text('experience')->nullable();
            $table->decimal('consultation_fee', 8, 2);
            $table->integer('years_of_experience')->default(0);
            $table->boolean('is_available')->default(true);
            $table->text('qualifications')->nullable();
            $table->integer('appointment_duration')->default(30); // in minutes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
