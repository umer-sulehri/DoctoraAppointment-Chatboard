<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public string $resetToken)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reset Your Password - Doctor Appointment System',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.password-reset',
            with: [
                'user' => $this->user,
                'resetToken' => $this->resetToken,
                'resetUrl' => config('app.frontend_url') . '/reset-password?email=' . urlencode($this->user->email),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
