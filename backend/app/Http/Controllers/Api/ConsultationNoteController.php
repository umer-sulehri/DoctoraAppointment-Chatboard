<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\ConsultationNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ConsultationNoteController extends Controller
{
    /**
     * Get all consultation notes for an appointment (doctor or patient only)
     */
    public function getAppointmentNotes(Appointment $appointment, Request $request)
    {
        $user = $request->user();

        // Check authorization: doctor of appointment or the patient
        $isDoctor = $user->role === 'doctor' && $user->doctor && $appointment->doctor_id === $user->doctor->id;
        $isPatient = $user->id === $appointment->user_id;

        if (!$isDoctor && !$isPatient) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view these notes'
            ], 403);
        }

        $notes = ConsultationNote::where('appointment_id', $appointment->id)
            ->with(['doctor', 'patient'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notes,
        ]);
    }

    /**
     * Get all notes for the authenticated patient
     */
    public function getMyNotes(Request $request)
    {
        $user = $request->user();

        $notes = ConsultationNote::where('patient_id', $user->id)
            ->with(['doctor:id,name,email', 'appointment'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notes,
        ]);
    }

    /**
     * Get all notes created by the authenticated doctor
     */
    public function getDoctorNotes(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'doctor') {
            return response()->json([
                'success' => false,
                'message' => 'Only doctors can create consultation notes'
            ], 403);
        }

        $notes = ConsultationNote::where('doctor_id', $user->id)
            ->with(['patient:id,name,email', 'appointment'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notes,
        ]);
    }

    /**
     * Create a new consultation note (doctor only)
     */
    public function createNote(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'doctor') {
            return response()->json([
                'success' => false,
                'message' => 'Only doctors can create consultation notes'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'appointment_id' => 'required|exists:appointments,id',
            'note_content' => 'required|string',
            'diagnosis' => 'nullable|string',
            'treatment_plan' => 'nullable|string',
            'medicines_prescribed' => 'nullable|array',
            'medicines_prescribed.*.name' => 'required|string',
            'medicines_prescribed.*.dosage' => 'required|string',
            'medicines_prescribed.*.frequency' => 'required|string',
            'medicines_prescribed.*.duration' => 'required|string',
            'follow_up_date' => 'nullable|date',
            'follow_up_type' => 'nullable|in:before,after,as_needed,none',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $appointment = Appointment::findOrFail($request->appointment_id);

        // Verify doctor is assigned to this appointment
        if ($appointment->doctor_id !== $user->doctor->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not assigned to this appointment'
            ], 403);
        }

        $note = ConsultationNote::create([
            'appointment_id' => $appointment->id,
            'doctor_id' => $user->id,
            'patient_id' => $appointment->user_id,
            'note_content' => $request->note_content,
            'diagnosis' => $request->diagnosis,
            'treatment_plan' => $request->treatment_plan,
            'medicines_prescribed' => $request->medicines_prescribed,
            'follow_up_date' => $request->follow_up_date,
            'follow_up_type' => $request->follow_up_type ?? 'none',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Consultation note created successfully',
            'data' => $note->load(['doctor', 'patient']),
        ], 201);
    }

    /**
     * Update a consultation note (doctor only)
     */
    public function updateNote(ConsultationNote $note, Request $request)
    {
        $user = $request->user();

        // Only the doctor who created the note can update it
        if ($user->id !== $note->doctor_id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only update your own notes'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'note_content' => 'sometimes|string',
            'diagnosis' => 'nullable|string',
            'treatment_plan' => 'nullable|string',
            'medicines_prescribed' => 'nullable|array',
            'medicines_prescribed.*.name' => 'required|string',
            'medicines_prescribed.*.dosage' => 'required|string',
            'medicines_prescribed.*.frequency' => 'required|string',
            'medicines_prescribed.*.duration' => 'required|string',
            'follow_up_date' => 'nullable|date',
            'follow_up_type' => 'nullable|in:before,after,as_needed,none',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $note->update($request->only([
            'note_content',
            'diagnosis',
            'treatment_plan',
            'medicines_prescribed',
            'follow_up_date',
            'follow_up_type',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Consultation note updated successfully',
            'data' => $note,
        ]);
    }

    /**
     * Delete a consultation note (doctor only)
     */
    public function deleteNote(ConsultationNote $note, Request $request)
    {
        $user = $request->user();

        // Only the doctor who created the note can delete it
        if ($user->id !== $note->doctor_id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only delete your own notes'
            ], 403);
        }

        $note->delete();

        return response()->json([
            'success' => true,
            'message' => 'Consultation note deleted successfully',
        ]);
    }

    /**
     * Get a specific note
     */
    public function getNote(ConsultationNote $note, Request $request)
    {
        $user = $request->user();

        // Patient can view their own notes
        if ($user->id === $note->patient_id) {
            return response()->json([
                'success' => true,
                'data' => $note->load(['doctor:id,name,email', 'appointment']),
            ]);
        }

        // Doctor can view their own notes
        if ($user->id === $note->doctor_id) {
            return response()->json([
                'success' => true,
                'data' => $note->load(['patient:id,name,email', 'appointment']),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthorized to view this note'
        ], 403);
    }
}
