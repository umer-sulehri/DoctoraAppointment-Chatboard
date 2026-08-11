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
        Schema::create('patient_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Patient
            $table->enum('report_type', ['lab_test', 'prescription', 'diagnosis', 'imaging', 'general', 'other'])->default('general');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path')->nullable(); // Path to uploaded file in storage
            $table->date('report_date')->nullable(); // When the report was generated
            $table->text('notes')->nullable(); // Doctor's notes about this report
            $table->boolean('is_shared_with_doctor')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_reports');
    }
};
