<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rating extends Model
{
    protected $fillable = [
        'doctor_id',
        'patient_id',
        'appointment_id',
        'rating',
        'review',
        'would_recommend',
    ];

    protected $casts = [
        'rating' => 'integer',
        'would_recommend' => 'boolean',
    ];

    /**
     * Get the doctor being rated
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * Get the patient who gave the rating
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Get the appointment associated with the rating
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}

