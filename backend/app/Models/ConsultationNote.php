<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsultationNote extends Model
{
    protected $fillable = [
        'appointment_id',
        'doctor_id',
        'patient_id',
        'note_content',
        'diagnosis',
        'treatment_plan',
        'medicines_prescribed',
        'follow_up_date',
        'follow_up_type',
    ];

    protected $casts = [
        'medicines_prescribed' => 'array',
        'follow_up_date' => 'date',
    ];

    /**
     * Get the appointment associated with this note
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    /**
     * Get the doctor who created this note
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Get the patient for this note
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }
}

