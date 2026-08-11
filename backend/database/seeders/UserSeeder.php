<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Doctor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Admin User
        User::create([
            'name' => 'System Admin',
            'email' => 'admin@doctorappt.com',
            'password' => Hash::make('password'),
            'phone' => '+92 300 1112233',
            'role' => 'admin',
            'is_active' => true,
        ]);

        // 2. Create Sample Patients
        $patientsData = [
            ['name' => 'John Doe', 'email' => 'patient@doctorappt.com', 'phone' => '+92 300 4445566', 'gender' => 'male', 'dob' => '1995-05-15'],
            ['name' => 'Jane Smith', 'email' => 'jane@doctorappt.com', 'phone' => '+92 300 7778899', 'gender' => 'female', 'dob' => '1992-08-20'],
            ['name' => 'Robert Johnson', 'email' => 'robert@doctorappt.com', 'phone' => '+92 300 1234567', 'gender' => 'male', 'dob' => '1988-11-03'],
            ['name' => 'Emily Williams', 'email' => 'emily.user@doctorappt.com', 'phone' => '+92 300 7654321', 'gender' => 'female', 'dob' => '1998-02-14'],
        ];

        foreach ($patientsData as $pData) {
            User::create([
                'name' => $pData['name'],
                'email' => $pData['email'],
                'password' => Hash::make('password'),
                'phone' => $pData['phone'],
                'gender' => $pData['gender'],
                'dob' => $pData['dob'],
                'role' => 'user',
                'is_active' => true,
            ]);
        }

        // 3. Create Sample Doctors
        $doctors = [
            [
                'name' => 'Dr. Sarah Johnson',
                'email' => 'dr.sarah@doctorappt.com',
                'phone' => '+92 300 9991111',
                'specialty_id' => 1,
                'license_number' => 'LIC001',
                'consultation_fee' => 50.00,
                'years_of_experience' => 8,
                'qualifications' => 'MBBS, MD (General Medicine)',
                'bio' => 'Dr. Sarah is a highly dedicated General Physician committed to delivering comprehensive medical care, early diagnosis, and preventive treatment.',
            ],
            [
                'name' => 'Dr. Michael Smith',
                'email' => 'dr.michael@doctorappt.com',
                'phone' => '+92 300 9992222',
                'specialty_id' => 2,
                'license_number' => 'LIC002',
                'consultation_fee' => 60.00,
                'years_of_experience' => 10,
                'qualifications' => 'MBBS, FCPS (Gynecology)',
                'bio' => 'Specializing in women\'s reproductive health, prenatal care, and fertility treatment with over a decade of clinical experience.',
            ],
            [
                'name' => 'Dr. Emily Davis',
                'email' => 'dr.emily@doctorappt.com',
                'phone' => '+92 300 9993333',
                'specialty_id' => 3,
                'license_number' => 'LIC003',
                'consultation_fee' => 55.00,
                'years_of_experience' => 6,
                'qualifications' => 'MBBS, Diploma in Dermatology',
                'bio' => 'Expert in cosmetic dermatology, skin disease management, laser treatments, and advanced acne protocols.',
            ],
            [
                'name' => 'Dr. James Wilson',
                'email' => 'dr.james@doctorappt.com',
                'phone' => '+92 300 9994444',
                'specialty_id' => 4,
                'license_number' => 'LIC004',
                'consultation_fee' => 45.00,
                'years_of_experience' => 5,
                'qualifications' => 'MBBS, DCH (Pediatrics)',
                'bio' => 'Compassionate pediatrician focusing on infant care, childhood growth milestones, and pediatric immunization programs.',
            ],
            [
                'name' => 'Dr. Robert Brown',
                'email' => 'dr.robert@doctorappt.com',
                'phone' => '+92 300 9995555',
                'specialty_id' => 5,
                'license_number' => 'LIC005',
                'consultation_fee' => 70.00,
                'years_of_experience' => 12,
                'qualifications' => 'MBBS, MD (Neurology), Fellowship in Epilepsy',
                'bio' => 'Senior Neurologist specializing in brain health, stroke prevention, migraine management, and neurological disorders.',
            ],
            [
                'name' => 'Dr. Lisa Anderson',
                'email' => 'dr.lisa@doctorappt.com',
                'phone' => '+92 300 9996666',
                'specialty_id' => 6,
                'license_number' => 'LIC006',
                'consultation_fee' => 65.00,
                'years_of_experience' => 9,
                'qualifications' => 'MBBS, FCPS (Gastroenterology)',
                'bio' => 'Digestive disease specialist skilled in endoscopy, stomach disorders, liver healthcare, and nutrition management.',
            ],
        ];

        foreach ($doctors as $doctorData) {
            $specialtyId = $doctorData['specialty_id'];
            $qualifications = $doctorData['qualifications'];
            $bio = $doctorData['bio'];

            unset($doctorData['specialty_id'], $doctorData['qualifications'], $doctorData['bio']);

            $user = User::create([
                'name' => $doctorData['name'],
                'email' => $doctorData['email'],
                'password' => Hash::make('password'),
                'phone' => $doctorData['phone'],
                'bio' => $bio,
                'role' => 'doctor',
                'is_active' => true,
            ]);

            Doctor::create([
                'user_id' => $user->id,
                'specialty_id' => $specialtyId,
                'license_number' => $doctorData['license_number'],
                'consultation_fee' => $doctorData['consultation_fee'],
                'years_of_experience' => $doctorData['years_of_experience'],
                'qualifications' => $qualifications,
                'is_available' => true,
                'available_from_time' => '09:00',
                'available_to_time' => '17:00',
                'available_days' => [1, 2, 3, 4, 5],
                'slot_duration' => 30,
                'approval_status' => 'approved',
            ]);
        }
    }
}
