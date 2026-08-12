<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\User;
use App\Models\Rating;
use App\Models\ConsultationNote;
use App\Models\AdminSetting;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AppointmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $doctors = Doctor::with('user')->get();
        $patients = User::where('role', 'user')->get();

        if ($doctors->isEmpty() || $patients->isEmpty()) {
            return;
        }

        // Seed Admin Settings
        $settings = [
            'clinic_name' => 'Prescripto Health Care',
            'clinic_email' => 'contact@prescripto.pk',
            'clinic_phone' => '+92 300 0000000',
            'clinic_address' => '123 Medical Center Drive, Lahore, Pakistan',
            'default_slot_duration' => '30',
            'currency_symbol' => '$',
        ];

        foreach ($settings as $key => $value) {
            AdminSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        // Sample notes
        $notesList = [
            'Patient has mild headache and fever for 2 days.',
            'Routine health checkup and follow up on blood pressure.',
            'Skin rash inspection and allergy consultation.',
            'Child vaccination and growth tracking.',
            'Digestive discomfort after meals.',
            'Nerve pain in lower back after lifting heavy object.'
        ];

        $consultationNotes = [
            'Prescribed Paracetamol 500mg twice daily for 5 days. Rest and stay hydrated.',
            'Blood pressure is normal (120/80). Continue current diet and moderate exercise.',
            'Prescribed topical hydrocortisone cream. Avoid known allergen exposure.',
            'Growth indicators normal. Administered MMR booster vaccine.',
            'Advised dietary modifications. Recommended antacid therapy for 1 week.',
            'Recommended physical therapy twice weekly and mild pain relievers.'
        ];

        $reviews = [
            'Very compassionate and attentive doctor. Explained everything clearly!',
            'Great experience! Highly professional and punctual.',
            'Doctor was thorough and prescribed effective medication.',
            'Friendly staff and knowledgeable specialist.',
            'Helped diagnose my issue quickly. Very satisfied with the care.'
        ];

        $patientIndex = 0;
        foreach ($doctors as $dIndex => $doctor) {
            // Create 3 appointments per doctor (Past, Today, Future)
            $dates = [
                Carbon::now()->subDays(rand(1, 10))->setHour(rand(9, 16))->setMinute(0),
                Carbon::now()->setHour(rand(9, 16))->setMinute(0),
                Carbon::now()->addDays(rand(1, 14))->setHour(rand(9, 16))->setMinute(0),
            ];

            foreach ($dates as $i => $date) {
                $patient = $patients[$patientIndex % count($patients)];
                $patientIndex++;

                $status = $i === 0 ? 'completed' : ($i === 1 ? 'confirmed' : 'pending');
                $acceptanceStatus = $status === 'cancelled' ? 'rejected' : ($status === 'pending' ? 'pending' : 'accepted');

                $appointment = Appointment::create([
                    'user_id' => $patient->id,
                    'doctor_id' => $doctor->id,
                    'appointment_date' => $date,
                    'status' => $status,
                    'acceptance_status' => $acceptanceStatus,
                    'accepted_at' => $acceptanceStatus === 'accepted' ? Carbon::now() : null,
                    'completed_at' => $status === 'completed' ? $date->copy()->addMinutes(30) : null,
                    'amount' => $doctor->consultation_fee,
                    'payment_status' => $status === 'completed' ? 'paid' : 'unpaid',
                    'notes' => $notesList[array_rand($notesList)],
                    'consultation_notes' => $status === 'completed' ? $consultationNotes[$dIndex % count($consultationNotes)] : null,
                ]);

                // Create consultation note record if completed
                if ($status === 'completed') {
                    ConsultationNote::create([
                        'appointment_id' => $appointment->id,
                        'doctor_id' => $doctor->user_id,
                        'patient_id' => $patient->id,
                        'note_content' => $consultationNotes[$dIndex % count($consultationNotes)],
                        'diagnosis' => 'General health evaluation',
                        'treatment_plan' => 'Take prescribed dosage after meals.',
                    ]);

                    // Create rating
                    Rating::create([
                        'appointment_id' => $appointment->id,
                        'patient_id' => $patient->id,
                        'doctor_id' => $doctor->id,
                        'rating' => rand(4, 5),
                        'review' => $reviews[array_rand($reviews)],
                        'would_recommend' => true,
                    ]);
                }
            }
        }
    }
}
