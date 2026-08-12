<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'doctor_id',
        'appointment_date',
        'status',
        'notes',
        'prescription',
        'slot_duration',
        'is_paid',
        'payment_method',
        'payment_status',
        'amount',
        'cancellation_reason',
        'consultation_notes',
        'rejection_reason',
        'acceptance_status',
        'accepted_at',
        'rejected_at',
        'completed_at',
        'attached_report_ids',
        'transaction_id',
        'payment_gateway',
        'payment_reference',
        'payment_at',
        'payment_verification_status',
        'payment_notes',
    ];

    protected function casts(): array
    {
        return [
            'appointment_date' => 'datetime',
            'is_paid' => 'boolean',
            'amount' => 'decimal:2',
            'accepted_at' => 'datetime',
            'rejected_at' => 'datetime',
            'completed_at' => 'datetime',
            'attached_report_ids' => 'array',
            'payment_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }
}
