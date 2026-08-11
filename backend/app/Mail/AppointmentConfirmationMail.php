<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Appointment $appointment, public string $status = 'confirmed')
    {
    }

    public function envelope(): Envelope
    {
        $subject = match($this->status) {
            'confirmed' => 'Your Appointment is Confirmed',
            'cancelled' => 'Your Appointment has been Cancelled',
            'rescheduled' => 'Your Appointment has been Rescheduled',
            default => 'Appointment Notification',
        };

        return new Envelope(
            subject: $subject . ' - Doctor Appointment System',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment-notification',
            with: [
                'appointment' => $this->appointment,
                'status' => $this->status,
                'patient' => $this->appointment->user,
                'doctor' => $this->appointment->doctor->user ?? null,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
