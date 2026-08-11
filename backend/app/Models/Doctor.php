<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'specialty_id',
        'license_number',
        'experience',
        'consultation_fee',
        'years_of_experience',
        'is_available',
        'qualifications',
        'appointment_duration',
        'available_from_time',
        'available_to_time',
        'break_start_time',
        'break_end_time',
        'available_days',
        'slot_duration',
        'approval_status',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'accepts_online_payment',
    ];

    protected function casts(): array
    {
        return [
            'is_available' => 'boolean',
            'consultation_fee' => 'decimal:2',
            'available_days' => 'json',
            'approved_at' => 'datetime',
            'accepts_online_payment' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function specialty()
    {
        return $this->belongsTo(Specialty::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    /**
     * Get average rating for this doctor
     */
    public function getAverageRatingAttribute()
    {
        return $this->ratings()->avg('rating') ?? 0;
    }

    /**
     * Get total number of ratings
     */
    public function getRatingCountAttribute()
    {
        return $this->ratings()->count();
    }
}
