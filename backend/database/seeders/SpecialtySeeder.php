<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SpecialtySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $specialties = [
            [
                'name' => 'General Physician',
                'description' => 'General medical consultations',
                'icon' => 'General_physician.svg',
                'is_active' => true,
            ],
            [
                'name' => 'Gynecologist',
                'description' => 'Women health specialist',
                'icon' => 'Gynecologist.svg',
                'is_active' => true,
            ],
            [
                'name' => 'Dermatologist',
                'description' => 'Skin specialist',
                'icon' => 'Dermatologist.svg',
                'is_active' => true,
            ],
            [
                'name' => 'Pediatricians',
                'description' => 'Child care specialist',
                'icon' => 'Pediatricians.svg',
                'is_active' => true,
            ],
            [
                'name' => 'Neurologist',
                'description' => 'Brain and nervous system specialist',
                'icon' => 'Neurologist.svg',
                'is_active' => true,
            ],
            [
                'name' => 'Gastroenterologist',
                'description' => 'Digestive system specialist',
                'icon' => 'Gastroenterologist.svg',
                'is_active' => true,
            ],
        ];

        foreach ($specialties as $specialty) {
            \App\Models\Specialty::create($specialty);
        }
    }
}
