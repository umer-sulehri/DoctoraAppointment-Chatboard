from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import re

# Mock/Default Doctors Database for standalone Django service
DOCTOR_DATABASE = [
    {
        "id": 1,
        "name": "Dr. John Doe",
        "specialty": "General Physician",
        "experience": "10 years",
        "fees": 50.00,
        "image": None,
        "is_available": True
    },
    {
        "id": 2,
        "name": "Dr. Sarah Jenkins",
        "specialty": "Gynecologist",
        "experience": "8 years",
        "fees": 80.00,
        "image": None,
        "is_available": True
    },
    {
        "id": 3,
        "name": "Dr. Michael Chen",
        "specialty": "Dermatologist",
        "experience": "12 years",
        "fees": 75.00,
        "image": None,
        "is_available": True
    },
    {
        "id": 4,
        "name": "Dr. Emma Watson",
        "specialty": "Pediatrician",
        "experience": "7 years",
        "fees": 60.00,
        "image": None,
        "is_available": True
    },
    {
        "id": 5,
        "name": "Dr. Alex Rivera",
        "specialty": "Neurologist",
        "experience": "15 years",
        "fees": 120.00,
        "image": None,
        "is_available": True
    },
    {
        "id": 6,
        "name": "Dr. Lisa Ray",
        "specialty": "Gastroenterologist",
        "experience": "9 years",
        "fees": 90.00,
        "image": None,
        "is_available": True
    }
]

SYMPTOM_RULES = {
    'General Physician': {
        'keywords': ['fever', 'flu', 'cold', 'cough', 'fatigue', 'weakness', 'body ache', 'viral', 'headache', 'chills'],
        'advice': 'General Physicians provide initial diagnostic evaluation, general health care, and routine checkups.'
    },
    'Dermatologist': {
        'keywords': ['skin', 'rash', 'acne', 'eczema', 'itching', 'pimples', 'allergy', 'hair fall', 'scalp', 'psoriasis'],
        'advice': 'Dermatologists specialize in skin, hair, nail conditions, and allergic skin reactions.'
    },
    'Gastroenterologist': {
        'keywords': ['stomach', 'nausea', 'vomiting', 'diarrhea', 'acid', 'acidity', 'digestion', 'bloating', 'abdominal pain', 'gastric'],
        'advice': 'Gastroenterologists treat conditions of the digestive system, stomach, liver, and intestine.'
    },
    'Gynecologist': {
        'keywords': ['pregnancy', 'period', 'menstrual', 'cramps', 'women', 'pcos', 'ovary', 'uterus'],
        'advice': 'Gynecologists specialize in women\'s reproductive health, prenatal, and postnatal care.'
    },
    'Pediatrician': {
        'keywords': ['child', 'baby', 'infant', 'kid', 'toddler', 'vaccination', 'pediatric'],
        'advice': 'Pediatricians specialize in child healthcare from infancy through adolescence.'
    },
    'Neurologist': {
        'keywords': ['migraine', 'severe headache', 'dizziness', 'seizure', 'numbness', 'nerve pain', 'memory loss'],
        'advice': 'Neurologists treat disorders of the brain, spinal cord, and nervous system.'
    }
}

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for Django service."""
    return Response({"status": "ok", "service": "Django Hospital AI Chatbot Backend"})

@api_view(['POST'])
@permission_classes([AllowAny])
def chatbot_query(request):
    """
    Handle user natural language query in Django REST Framework.
    """
    data = request.data or {}
    message = str(data.get('message') or data.get('query') or '').strip()
    lower_msg = message.lower()

    if not message:
        return Response({
            'success': True,
            'reply': "Hello! 👋 I'm your Hospital AI Assistant (Django Service). How can I assist you with your health or appointment today?",
            'intent': 'greeting',
            'chips': ['🩺 Check Symptoms', '👨‍⚕️ Find a Doctor', '📅 How to Book', '🏥 Hospital Info'],
            'doctors': []
        })

    # 1. GREETING INTENT
    if any(k in lower_msg for k in ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening']):
        return Response({
            'success': True,
            'reply': "Hello! 👋 Welcome to our Hospital Portal (Powered by Django). I can help you find doctors, match symptoms to medical specialties, guide you through appointment booking, and answer hospital inquiries. How can I help you right now?",
            'intent': 'greeting',
            'chips': ['🩺 Symptom Checker', '👨‍⚕️ Find a Doctor', '📅 Book Appointment', '🏥 Emergency Contact'],
            'doctors': []
        })

    # 2. SYMPTOMS & SPECIALTY MATCHING INTENT
    symptom_match = analyze_symptoms(lower_msg)
    if symptom_match:
        specialty_name = symptom_match['specialty']
        doctors = get_doctors_by_specialty(specialty_name)

        reply = (
            f"Based on your symptom description (*{symptom_match['matched_keyword']}*), we recommend consulting a **{specialty_name}**.\n\n"
            f"💡 *{symptom_match['advice']}*\n\n"
            f"Here are our available {specialty_name} specialists:"
        )

        return Response({
            'success': True,
            'reply': reply,
            'intent': 'symptoms',
            'matched_specialty': specialty_name,
            'chips': [f"📅 Book {specialty_name}", '🩺 Check Other Symptoms', '👨‍⚕️ All Doctors'],
            'doctors': doctors
        })

    # 3. DOCTOR SEARCH INTENT
    if any(k in lower_msg for k in ['doctor', 'physician', 'specialist', 'dermatologist', 'gynecologist', 'neurologist', 'pediatrician', 'gastroenterologist', 'cardiologist', 'orthopedic']):
        doctors = search_doctors(lower_msg)

        return Response({
            'success': True,
            'reply': "Here are available doctors matching your search query. You can select any doctor to view their full profile and book an appointment slot directly:",
            'intent': 'doctor_search',
            'chips': ['📅 Book Appointment', '🩺 Symptom Checker', '🏥 Consultation Fees'],
            'doctors': doctors
        })

    # 4. BOOKING / APPOINTMENTS GUIDANCE
    if any(k in lower_msg for k in ['book', 'appointment', 'slot', 'schedule', 'reserve', 'timing', 'time slot']):
        top_doctors = DOCTOR_DATABASE[:3]

        return Response({
            'success': True,
            'reply': (
                "Booking an appointment is fast and easy! 📌\n\n"
                "1️⃣ Choose a doctor from our **All Doctors** list or pick one below.\n"
                "2️⃣ Select your preferred date and open time slot.\n"
                "3️⃣ Add optional notes and confirm your booking.\n\n"
                "Here are some top-rated doctors ready for bookings:"
            ),
            'intent': 'booking_info',
            'chips': ['👨‍⚕️ View All Doctors', '📋 My Appointments', '💳 Payment Methods'],
            'doctors': top_doctors
        })

    # 5. HOSPITAL INFO & EMERGENCY
    if any(k in lower_msg for k in ['hospital', 'location', 'address', 'phone', 'whatsapp', 'contact', 'emergency', 'hours', 'time', 'timing', 'open', 'office', 'email']):
        return Response({
            'success': True,
            'reply': (
                "🏥 **Hospital Information & Contact**\n\n"
                "📍 **Our Office:** 123 Medical Center Drive, Lahore, Punjab, Pakistan\n"
                "📞 **Phone & WhatsApp:** +92 300 000 0000 (Mon - Sat, 9 AM to 6 PM)\n"
                "📧 **Email Address:** sulehriumer83@gmail.com / support@prescripto.pk\n"
                "🕒 **Working Hours:**\n"
                "  • Monday – Friday: 8:00 AM – 8:00 PM\n"
                "  • Saturday: 9:00 AM – 4:00 PM"
            ),
            'intent': 'hospital_info',
            'chips': ['🚨 Emergency Call', '👨‍⚕️ Find Doctor', '📅 Book Appointment'],
            'doctors': []
        })

    # 6. CANCELLATION / RESCHEDULE / FEES & PAYMENT
    if any(k in lower_msg for k in ['cancel', 'reschedule', 'pay', 'payment', 'fee', 'charge', 'price', 'cost', 'refund']):
        return Response({
            'success': True,
            'reply': (
                "💳 **Fees, Cancellation & Rescheduling**\n\n"
                "• **Consultation Fees:** Fees range between $50 - $120 depending on the doctor's specialty & experience.\n"
                "• **Payment:** We accept Credit/Debit cards online or cash at clinic reception.\n"
                "• **Cancellation & Rescheduling:** You can manage or cancel your appointment directly from your **My Appointments** page anytime before your scheduled slot."
            ),
            'intent': 'policy_info',
            'chips': ['📋 My Appointments', '👨‍⚕️ Check Doctors', '📞 Contact Support'],
            'doctors': []
        })

    # 7. DEFAULT / FALLBACK RESPONSE
    top_doctors = DOCTOR_DATABASE[:2]

    return Response({
        'success': True,
        'reply': (
            "I'm here to help!\n"
            "You can ask me about:\n"
            "• Describing symptoms to find the right specialist (e.g. *'I have a fever and cough'*)\n"
            "• Finding doctors (e.g. *'Show me top dermatologists'*)\n"
            "• Appointment booking guidance & hospital working hours\n\n"
            "What would you like to explore?"
        ),
        'intent': 'fallback',
        'chips': ['🩺 Describe Symptoms', '👨‍⚕️ List Top Doctors', '🏥 Hospital Location', '📅 Book Appointment'],
        'doctors': top_doctors
    })


def analyze_symptoms(text):
    """Scan text for medical symptom keywords."""
    for specialty, rule in SYMPTOM_RULES.items():
        for kw in rule['keywords']:
            if kw in text:
                return {
                    'specialty': specialty,
                    'matched_keyword': kw,
                    'advice': rule['advice']
                }
    return None


def get_doctors_by_specialty(specialty_name):
    """Filter doctors matching specialty."""
    matched = [d for d in DOCTOR_DATABASE if specialty_name.lower() in d['specialty'].lower()]
    return matched if matched else DOCTOR_DATABASE[:2]


def search_doctors(query_text):
    """Search doctors by keyword."""
    matched = []
    for d in DOCTOR_DATABASE:
        if any(kw in query_text for kw in [d['name'].lower(), d['specialty'].lower()]):
            matched.append(d)
    return matched if matched else DOCTOR_DATABASE[:3]
