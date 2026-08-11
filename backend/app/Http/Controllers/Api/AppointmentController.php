<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    public function myAppointments(Request $request)
    {
        $user = $request->user();

        $appointments = Appointment::where('user_id', $user->id)
            ->with('doctor.user', 'doctor.specialty')
            ->orderBy('appointment_date', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'appointments' => $appointments,
        ]);
    }

    public function book(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_date' => 'required|date_format:Y-m-d H:i',
            'notes' => 'nullable|string',
            'attached_report_ids' => 'nullable|array',
            'attached_report_ids.*' => 'integer|exists:patient_reports,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $doctor = Doctor::find($request->doctor_id);

        // Check if appointment slot is available
        $existingAppointment = Appointment::where('doctor_id', $doctor->id)
            ->where('appointment_date', $request->appointment_date)
            ->where('status', '!=', 'cancelled')
            ->first();

        if ($existingAppointment) {
            return response()->json([
                'success' => false,
                'message' => 'This slot is already booked'
            ], 422);
        }

        $appointment = Appointment::create([
            'user_id' => $user->id,
            'doctor_id' => $doctor->id,
            'appointment_date' => $request->appointment_date,
            'notes' => $request->notes,
            'status' => 'pending',
            'amount' => $doctor->consultation_fee,
            'attached_report_ids' => $request->attached_report_ids ?? [],
        ]);

        $appointment->load('doctor.user', 'doctor.specialty');

        return response()->json([
            'success' => true,
            'message' => 'Appointment booked successfully',
            'appointment' => $appointment,
        ], 201);
    }

    public function show($id)
    {
        $appointment = Appointment::with('user', 'doctor.user', 'doctor.specialty')->find($id);

        if (!$appointment) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'appointment' => $appointment,
        ]);
    }

    public function cancel($id, Request $request)
    {
        $appointment = Appointment::find($id);

        if (!$appointment) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment not found'
            ], 404);
        }

        if ($appointment->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if ($appointment->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Appointment is already cancelled'
            ], 422);
        }

        $appointment->update([
            'status' => 'cancelled',
            'cancellation_reason' => $request->reason,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Appointment cancelled successfully',
            'appointment' => $appointment,
        ]);
    }

    public function reschedule($id, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'appointment_date' => 'required|date_format:Y-m-d H:i',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $appointment = Appointment::find($id);

        if (!$appointment) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment not found'
            ], 404);
        }

        if ($appointment->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if new slot is available
        $existingAppointment = Appointment::where('doctor_id', $appointment->doctor_id)
            ->where('appointment_date', $request->appointment_date)
            ->where('status', '!=', 'cancelled')
            ->where('id', '!=', $id)
            ->first();

        if ($existingAppointment) {
            return response()->json([
                'success' => false,
                'message' => 'This slot is already booked'
            ], 422);
        }

        $appointment->update([
            'appointment_date' => $request->appointment_date,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Appointment rescheduled successfully',
            'appointment' => $appointment,
        ]);
    }

    public function updateStatus($id, Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'doctor' && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $appointment = Appointment::find($id);

        if (!$appointment) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,completed,cancelled',
            'prescription' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $appointment->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Appointment status updated',
            'appointment' => $appointment,
        ]);
    }

    /**
     * Doctor: get patient reports attached to an appointment
     */
    public function getAttachedReports($id, Request $request)
    {
        $user = $request->user();
        $appointment = Appointment::with('user')->find($id);

        if (!$appointment) {
            return response()->json(['success' => false, 'message' => 'Appointment not found'], 404);
        }

        // Must be the doctor of this appointment or admin
        if ($user->role === 'doctor') {
            $doctor = \App\Models\Doctor::where('user_id', $user->id)->first();
            if (!$doctor || $appointment->doctor_id !== $doctor->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }
        } elseif ($user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $reportIds = $appointment->attached_report_ids ?? [];

        if (empty($reportIds)) {
            return response()->json([
                'success' => true,
                'reports' => [],
                'patient_name' => $appointment->user->name ?? 'Patient',
            ]);
        }

        $reports = \App\Models\PatientReport::whereIn('id', $reportIds)
            ->where('user_id', $appointment->user_id)
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'title' => $r->title,
                    'report_type' => $r->report_type,
                    'description' => $r->description,
                    'report_date' => $r->report_date,
                    'file_url' => $r->file_path ? asset('storage/' . $r->file_path) : null,
                    'created_at' => $r->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'reports' => $reports,
            'patient_name' => $appointment->user->name ?? 'Patient',
        ]);
    }
}
