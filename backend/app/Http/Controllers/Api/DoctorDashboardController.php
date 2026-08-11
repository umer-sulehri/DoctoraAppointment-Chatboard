<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DoctorDashboardController extends Controller
{
    /**
     * Get doctor dashboard statistics and data
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        
        // Get doctor profile
        $doctor = Doctor::where('user_id', $user->id)->first();
        
        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $today = Carbon::today();
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        // Get today's appointments
        $todayAppointments = Appointment::where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', $today)
            ->with('user')
            ->get();

        // Get pending approvals (appointments accepted but not completed)
        $pendingAppointments = Appointment::where('doctor_id', $doctor->id)
            ->where('acceptance_status', 'pending')
            ->with('user')
            ->orderBy('appointment_date', 'asc')
            ->limit(5)
            ->get();

        // Get this week's appointments
        $weekAppointments = Appointment::where('doctor_id', $doctor->id)
            ->whereBetween('appointment_date', [$startOfWeek, $endOfWeek])
            ->get();

        // Statistics
        $totalAppointments = Appointment::where('doctor_id', $doctor->id)->count();
        $completedAppointments = Appointment::where('doctor_id', $doctor->id)
            ->where('status', 'completed')
            ->count();
        $cancelledAppointments = Appointment::where('doctor_id', $doctor->id)
            ->where('status', 'cancelled')
            ->count();
        $pendingApprovals = Appointment::where('doctor_id', $doctor->id)
            ->where('acceptance_status', 'pending')
            ->count();

        // Average rating (if ratings table exists)
        $averageRating = 0; // TODO: Implement when ratings feature is added

        return response()->json([
            'doctor' => $doctor->load('specialty', 'user'),
            'today_appointments' => $todayAppointments,
            'pending_approvals' => $pendingAppointments,
            'week_appointments' => $weekAppointments,
            'stats' => [
                'total_appointments' => $totalAppointments,
                'completed_appointments' => $completedAppointments,
                'cancelled_appointments' => $cancelledAppointments,
                'pending_approvals' => $pendingApprovals,
                'average_rating' => $averageRating,
            ]
        ]);
    }

    /**
     * Get all appointments for the doctor
     */
    public function appointments(Request $request)
    {
        $user = $request->user();
        $doctor = Doctor::where('user_id', $user->id)->first();

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $query = Appointment::where('doctor_id', $doctor->id)->with('user');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by acceptance_status if provided
        if ($request->has('acceptance_status')) {
            $query->where('acceptance_status', $request->acceptance_status);
        }

        // Sort by appointment date
        $appointments = $query->orderBy('appointment_date', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json($appointments);
    }

    /**
     * Get appointment details
     */
    public function appointmentDetail(Request $request, $appointmentId)
    {
        $user = $request->user();
        $doctor = Doctor::where('user_id', $user->id)->first();

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $appointment = Appointment::where('id', $appointmentId)
            ->where('doctor_id', $doctor->id)
            ->with('user', 'doctor')
            ->first();

        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        return response()->json($appointment);
    }

    /**
     * Accept appointment request
     */
    public function acceptAppointment(Request $request, $appointmentId)
    {
        $user = $request->user();
        $doctor = Doctor::where('user_id', $user->id)->first();

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $appointment = Appointment::where('id', $appointmentId)
            ->where('doctor_id', $doctor->id)
            ->first();

        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        // Can only accept pending approvals
        if ($appointment->acceptance_status !== 'pending') {
            return response()->json([
                'message' => 'Appointment cannot be accepted in current status'
            ], 400);
        }

        $appointment->update([
            'acceptance_status' => 'accepted',
            'accepted_at' => now(),
            'status' => 'confirmed'
        ]);

        // TODO: Send notification to patient

        return response()->json([
            'message' => 'Appointment accepted successfully',
            'appointment' => $appointment->load('user', 'doctor')
        ]);
    }

    /**
     * Reject appointment request
     */
    public function rejectAppointment(Request $request, $appointmentId)
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        $user = $request->user();
        $doctor = Doctor::where('user_id', $user->id)->first();

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $appointment = Appointment::where('id', $appointmentId)
            ->where('doctor_id', $doctor->id)
            ->first();

        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        // Can only reject pending approvals
        if ($appointment->acceptance_status !== 'pending') {
            return response()->json([
                'message' => 'Appointment cannot be rejected in current status'
            ], 400);
        }

        $appointment->update([
            'acceptance_status' => 'rejected',
            'rejected_at' => now(),
            'rejection_reason' => $request->reason,
            'status' => 'cancelled'
        ]);

        // TODO: Send notification to patient with rejection reason

        return response()->json([
            'message' => 'Appointment rejected successfully',
            'appointment' => $appointment->load('user', 'doctor')
        ]);
    }

    /**
     * Mark appointment as completed and add consultation notes
     */
    public function completeAppointment(Request $request, $appointmentId)
    {
        $request->validate([
            'consultation_notes' => 'required|string'
        ]);

        $user = $request->user();
        $doctor = Doctor::where('user_id', $user->id)->first();

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $appointment = Appointment::where('id', $appointmentId)
            ->where('doctor_id', $doctor->id)
            ->first();

        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        // Can only complete confirmed appointments
        if ($appointment->status !== 'confirmed') {
            return response()->json([
                'message' => 'Only confirmed appointments can be marked as completed'
            ], 400);
        }

        $appointment->update([
            'status' => 'completed',
            'completed_at' => now(),
            'consultation_notes' => $request->consultation_notes
        ]);

        // TODO: Send completion notification to patient

        return response()->json([
            'message' => 'Appointment marked as completed',
            'appointment' => $appointment->load('user', 'doctor')
        ]);
    }

    /**
     * Get or update doctor availability
     */
    public function availability(Request $request)
    {
        $user = $request->user();
        $doctor = Doctor::where('user_id', $user->id)->first();

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        if ($request->method() === 'POST' || $request->method() === 'PUT') {
            // Update availability
            $request->validate([
                'available_from_time' => 'required|date_format:H:i',
                'available_to_time' => 'required|date_format:H:i',
                'break_start_time' => 'nullable|date_format:H:i',
                'break_end_time' => 'nullable|date_format:H:i',
                'available_days' => 'required|array|min:1',
                'slot_duration' => 'required|integer|in:15,30,45,60'
            ]);

            $doctor->update([
                'available_from_time' => $request->available_from_time,
                'available_to_time' => $request->available_to_time,
                'break_start_time' => $request->break_start_time,
                'break_end_time' => $request->break_end_time,
                'available_days' => $request->available_days,
                'slot_duration' => $request->slot_duration,
            ]);

            return response()->json([
                'message' => 'Availability updated successfully',
                'doctor' => $doctor
            ]);
        }

        // Get availability
        return response()->json([
            'available_from_time' => $doctor->available_from_time,
            'available_to_time' => $doctor->available_to_time,
            'break_start_time' => $doctor->break_start_time,
            'break_end_time' => $doctor->break_end_time,
            'available_days' => $doctor->available_days,
            'slot_duration' => $doctor->slot_duration,
        ]);
    }

    /**
     * Get doctor's this week schedule
     */
    public function weekSchedule(Request $request)
    {
        $user = $request->user();
        $doctor = Doctor::where('user_id', $user->id)->first();

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        $appointments = Appointment::where('doctor_id', $doctor->id)
            ->whereBetween('appointment_date', [$startOfWeek, $endOfWeek])
            ->with('user')
            ->orderBy('appointment_date', 'asc')
            ->get();

        return response()->json([
            'week_start' => $startOfWeek->format('Y-m-d'),
            'week_end' => $endOfWeek->format('Y-m-d'),
            'appointments' => $appointments
        ]);
    }
}

