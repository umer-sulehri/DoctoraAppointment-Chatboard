<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Doctor;
use App\Models\Specialty;
use Illuminate\Support\Str;

class ChatbotController extends Controller
{
    /**
     * Handle query from AI Chatbot
     */
    public function handleQuery(Request $request)
    {
        $message = trim($request->input('message') ?? $request->input('query') ?? '');
        $lower = Str::lower($message);

        if (empty($message)) {
            return response()->json([
                'success' => true,
                'reply' => "Hello! 👋 I'm your Hospital AI Assistant. How can I assist you with your health or appointment today?",
                'intent' => 'greeting',
                'chips' => ['🩺 Check Symptoms', '👨‍⚕️ Find a Doctor', '📅 How to Book', '🏥 Hospital Info'],
                'doctors' => [],
            ]);
        }

        // 1. GREETING INTENT
        if (Str::contains($lower, ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'])) {
            return response()->json([
                'success' => true,
                'reply' => "Hello! 👋 Welcome to our Hospital Portal. I can help you find doctors, match symptoms to medical specialties, guide you through appointment booking, and answer hospital inquiries. How can I help you right now?",
                'intent' => 'greeting',
                'chips' => ['🩺 Symptom Checker', '👨‍⚕️ Find a Doctor', '📅 Book Appointment', '🏥 Emergency Contact'],
                'doctors' => [],
            ]);
        }

        // 2. SYMPTOMS & SPECIALTY MATCHING INTENT
        $symptomMatch = $this->analyzeSymptoms($lower);
        if ($symptomMatch) {
            $specialtyName = $symptomMatch['specialty'];
            $doctors = $this->getDoctorsBySpecialtyKeyword($specialtyName);

            $reply = "Based on your symptom description (*{$symptomMatch['matched_keyword']}*), we recommend consulting a **{$specialtyName}**.\n\n" .
                     "💡 *{$symptomMatch['advice']}*\n\n" .
                     "Here are our available {$specialtyName} specialists:";

            return response()->json([
                'success' => true,
                'reply' => $reply,
                'intent' => 'symptoms',
                'matched_specialty' => $specialtyName,
                'chips' => ["📅 Book {$specialtyName}", '🩺 Check Other Symptoms', '👨‍⚕️ All Doctors'],
                'doctors' => $doctors,
            ]);
        }

        // 3. DOCTOR SEARCH INTENT
        if (Str::contains($lower, ['doctor', 'physician', 'specialist', 'dermatologist', 'gynecologist', 'neurologist', 'pediatrician', 'gastroenterologist', 'cardiologist', 'orthopedic'])) {
            $doctors = $this->searchDoctorsByQuery($lower);
            
            if (count($doctors) > 0) {
                return response()->json([
                    'success' => true,
                    'reply' => "Here are available doctors matching your search query. You can select any doctor to view their full profile and book an appointment slot directly:",
                    'intent' => 'doctor_search',
                    'chips' => ['📅 Book Appointment', '🩺 Symptom Checker', '🏥 Consultation Fees'],
                    'doctors' => $doctors,
                ]);
            }
        }

        // 4. BOOKING / APPOINTMENTS GUIDANCE
        if (Str::contains($lower, ['book', 'appointment', 'slot', 'schedule', 'reserve', 'timing', 'time slot'])) {
            $topDoctors = $this->getTopDoctors();

            return response()->json([
                'success' => true,
                'reply' => "Booking an appointment is fast and easy! 📌\n\n" .
                         "1️⃣ Choose a doctor from our **All Doctors** list or pick one below.\n" .
                         "2️⃣ Select your preferred date and open time slot.\n" .
                         "3️⃣ Add optional notes and confirm your booking.\n\n" .
                         "Here are some top-rated doctors ready for bookings:",
                'intent' => 'booking_info',
                'chips' => ['👨‍⚕️ View All Doctors', '📋 My Appointments', '💳 Payment Methods'],
                'doctors' => $topDoctors,
            ]);
        }

        // 5. HOSPITAL INFO & EMERGENCY
        if (Str::contains($lower, ['hospital', 'location', 'address', 'phone', 'whatsapp', 'contact', 'emergency', 'hours', 'time', 'timing', 'open', 'office', 'email'])) {
            return response()->json([
                'success' => true,
                'reply' => "🏥 **Hospital Information & Contact**\n\n" .
                         "📍 **Our Office:** 123 Medical Center Drive, Lahore, Punjab, Pakistan\n" .
                         "📞 **Phone & WhatsApp:** +92 300 000 0000 (Mon - Sat, 9 AM to 6 PM)\n" .
                         "📧 **Email Address:** sulehriumer83@gmail.com / support@prescripto.pk\n" .
                         "🕒 **Working Hours:**\n" .
                         "  • Monday – Friday: 8:00 AM – 8:00 PM\n" .
                         "  • Saturday: 9:00 AM – 4:00 PM",
                'intent' => 'hospital_info',
                'chips' => ['🚨 Emergency Call', '👨‍⚕️ Find Doctor', '📅 Book Appointment'],
                'doctors' => [],
            ]);
        }

        // 6. CANCELLATION / RESCHEDULE / FEES & PAYMENT
        if (Str::contains($lower, ['cancel', 'reschedule', 'pay', 'payment', 'fee', 'charge', 'price', 'cost', 'refund'])) {
            return response()->json([
                'success' => true,
                'reply' => "💳 **Fees, Cancellation & Rescheduling**\n\n" .
                         "• **Consultation Fees:** Fees range between $50 - $150 depending on the doctor's specialty & experience.\n" .
                         "• **Payment:** We accept Credit/Debit cards online or cash at clinic reception.\n" .
                         "• **Cancellation & Rescheduling:** You can manage or cancel your appointment directly from your **My Appointments** page anytime before your scheduled slot.",
                'intent' => 'policy_info',
                'chips' => ['📋 My Appointments', '👨‍⚕️ Check Doctors', '📞 Contact Support'],
                'doctors' => [],
            ]);
        }

        // 7. DEFAULT / FALLBACK RESPONSE
        $topDoctors = $this->getTopDoctors(2);

        return response()->json([
            'success' => true,
            'reply' => "I'm here to help! You can ask me about:\n" .
                     "• Describing symptoms to find the right specialist (e.g. *'I have a fever and cough'*)\n" .
                     "• Finding doctors (e.g. *'Show me top dermatologists'*)\n" .
                     "• Appointment booking guidance & hospital working hours\n\n" .
                     "What would you like to explore?",
            'intent' => 'fallback',
            'chips' => ['🩺 Describe Symptoms', '👨‍⚕️ List Top Doctors', '🏥 Hospital Location', '📅 Book Appointment'],
            'doctors' => $topDoctors,
        ]);
    }

    /**
     * Analyze symptoms text to map to specialty
     */
    private function analyzeSymptoms(string $text): ?array
    {
        $symptomRules = [
            'General Physician' => [
                'keywords' => ['fever', 'flu', 'cold', 'cough', 'fatigue', 'weakness', 'body ache', 'viral', 'headache', 'chills'],
                'advice' => 'General Physicians provide initial diagnostic evaluation, general health care, and routine checkups.',
            ],
            'Dermatologist' => [
                'keywords' => ['skin', 'rash', 'acne', 'eczema', 'itching', 'pimples', 'allergy', 'hair fall', 'scalp', 'psoriasis'],
                'advice' => 'Dermatologists specialize in skin, hair, nail conditions, and allergic skin reactions.',
            ],
            'Gastroenterologist' => [
                'keywords' => ['stomach', 'nausea', 'vomiting', 'diarrhea', 'acid', 'acidity', 'digestion', 'bloating', 'abdominal pain', 'gastric'],
                'advice' => 'Gastroenterologists treat conditions of the digestive system, stomach, liver, and intestine.',
            ],
            'Gynecologist' => [
                'keywords' => ['pregnancy', 'period', 'menstrual', 'cramps', 'women', 'pcos', 'ovary', 'uterus'],
                'advice' => 'Gynecologists specialize in women\'s reproductive health, prenatal, and postnatal care.',
            ],
            'Pediatrician' => [
                'keywords' => ['child', 'baby', 'infant', 'kid', 'toddler', 'vaccination', 'pediatric'],
                'advice' => 'Pediatricians specialize in child healthcare from infancy through adolescence.',
            ],
            'Neurologist' => [
                'keywords' => ['migraine', 'severe headache', 'dizziness', 'seizure', 'numbness', 'nerve pain', 'memory loss'],
                'advice' => 'Neurologists treat disorders of the brain, spinal cord, and nervous system.',
            ],
        ];

        foreach ($symptomRules as $specialty => $rule) {
            foreach ($rule['keywords'] as $kw) {
                if (Str::contains($text, $kw)) {
                    return [
                        'specialty' => $specialty,
                        'matched_keyword' => $kw,
                        'advice' => $rule['advice'],
                    ];
                }
            }
        }

        return null;
    }

    /**
     * Retrieve doctors by specialty keyword
     */
    private function getDoctorsBySpecialtyKeyword(string $specialtyName): array
    {
        $specialty = Specialty::where('name', 'LIKE', "%{$specialtyName}%")->first();
        $query = Doctor::with(['user', 'specialty'])->where('is_available', true);

        if ($specialty) {
            $query->where('specialty_id', $specialty->id);
        }

        $doctors = $query->take(3)->get();

        if ($doctors->isEmpty()) {
            $doctors = Doctor::with(['user', 'specialty'])->where('is_available', true)->take(3)->get();
        }

        return $this->formatDoctors($doctors);
    }

    /**
     * Search doctors by general query
     */
    private function searchDoctorsByQuery(string $queryStr): array
    {
        $doctors = Doctor::with(['user', 'specialty'])
            ->where('is_available', true)
            ->where(function ($q) use ($queryStr) {
                $q->whereHas('user', function ($uq) use ($queryStr) {
                    $uq->where('name', 'LIKE', "%{$queryStr}%");
                })->orWhereHas('specialty', function ($sq) use ($queryStr) {
                    $sq->where('name', 'LIKE', "%{$queryStr}%");
                });
            })
            ->take(3)
            ->get();

        if ($doctors->isEmpty()) {
            $doctors = Doctor::with(['user', 'specialty'])->where('is_available', true)->take(3)->get();
        }

        return $this->formatDoctors($doctors);
    }

    /**
     * Get top featured doctors
     */
    private function getTopDoctors(int $limit = 3): array
    {
        $doctors = Doctor::with(['user', 'specialty'])
            ->where('is_available', true)
            ->take($limit)
            ->get();

        return $this->formatDoctors($doctors);
    }

    /**
     * Format doctor models into clean array objects for frontend render
     */
    private function formatDoctors($doctors): array
    {
        return $doctors->map(function ($doc) {
            return [
                'id' => $doc->id,
                'name' => $doc->user ? $doc->user->name : 'Doctor',
                'specialty' => $doc->specialty ? $doc->specialty->name : 'Specialist',
                'experience' => $doc->experience ?? "{$doc->years_of_experience} years",
                'fees' => $doc->consultation_fee,
                'image' => $doc->user ? $doc->user->profile_image : null,
                'is_available' => $doc->is_available,
            ];
        })->toArray();
    }
}
