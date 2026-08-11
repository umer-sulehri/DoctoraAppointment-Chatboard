<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientReport extends Model
{
    protected $fillable = [
        'user_id',
        'report_type',
        'title',
        'description',
        'file_path',
        'report_date',
        'notes',
        'is_shared_with_doctor',
    ];

    protected $casts = [
        'report_date' => 'date',
        'is_shared_with_doctor' => 'boolean',
    ];

    /**
     * Get the patient who uploaded this report
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

