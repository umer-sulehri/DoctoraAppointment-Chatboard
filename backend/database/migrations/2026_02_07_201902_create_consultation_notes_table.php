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
        Schema::create('consultation_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained('appointments')->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade'); // Doctor who created notes
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade'); // Patient
            $table->text('note_content'); // Main consultation notes
            $table->text('diagnosis')->nullable();
            $table->text('treatment_plan')->nullable();
            $table->json('medicines_prescribed')->nullable(); // Array of medicines
            $table->date('follow_up_date')->nullable(); // Recommended follow-up date
            $table->enum('follow_up_type', ['before', 'after', 'as_needed', 'none'])->default('none');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultation_notes');
    }
};
