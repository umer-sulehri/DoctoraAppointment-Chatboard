<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminSetting;
use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    /**
     * Get public payment configuration (for patients during booking)
     */
    public function getPaymentConfig()
    {
        $settings = AdminSetting::whereIn('key', [
            'payment_enabled',
            'jazzcash_number',
            'jazzcash_name',
            'easypaisa_number',
            'easypaisa_name',
            'bank_name',
            'bank_account_number',
            'bank_account_name',
            'bank_iban',
            'payment_instructions',
        ])->pluck('value', 'key');

        return response()->json([
            'success' => true,
            'config' => [
                'payment_enabled' => ($settings['payment_enabled'] ?? 'false') === 'true',
                'jazzcash_number' => $settings['jazzcash_number'] ?? null,
                'jazzcash_name' => $settings['jazzcash_name'] ?? null,
                'easypaisa_number' => $settings['easypaisa_number'] ?? null,
                'easypaisa_name' => $settings['easypaisa_name'] ?? null,
                'bank_name' => $settings['bank_name'] ?? null,
                'bank_account_number' => $settings['bank_account_number'] ?? null,
                'bank_account_name' => $settings['bank_account_name'] ?? null,
                'bank_iban' => $settings['bank_iban'] ?? null,
                'payment_instructions' => $settings['payment_instructions'] ?? 'Please transfer the consultation fee before your appointment.',
            ],
        ]);
    }

    /**
     * Submit payment proof for an appointment
     */
    public function submitPayment(Request $request, $appointmentId)
    {
        $user = auth()->user();

        $appointment = Appointment::where('id', $appointmentId)
            ->where('user_id', $user->id)
            ->first();

        if (!$appointment) {
            return response()->json(['success' => false, 'message' => 'Appointment not found'], 404);
        }

        if ($appointment->payment_status === 'paid') {
            return response()->json(['success' => false, 'message' => 'Payment already submitted'], 400);
        }

        $validator = Validator::make($request->all(), [
            'payment_gateway' => 'required|in:jazzcash,easypaisa,bank_transfer,card',
            'transaction_id'  => 'required|string|max:100',
            'payment_reference' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $appointment->update([
            'payment_gateway' => $request->payment_gateway,
            'transaction_id' => $request->transaction_id,
            'payment_reference' => $request->payment_reference,
            'payment_status' => 'pending_verification',
            'payment_verification_status' => 'pending',
            'payment_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment submitted successfully. Awaiting verification.',
            'appointment' => $appointment->fresh(),
        ]);
    }

    /**
     * Doctor/Admin verifies or rejects payment
     */
    public function verifyPayment(Request $request, $appointmentId)
    {
        $user = auth()->user();

        $appointment = Appointment::with('doctor.user')->findOrFail($appointmentId);

        // Check authorization: must be the appointment's doctor or admin
        $isDoctor = $user->role === 'doctor' &&
            $appointment->doctor &&
            $appointment->doctor->user_id === $user->id;
        $isAdmin = $user->role === 'admin';

        if (!$isDoctor && !$isAdmin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'action' => 'required|in:verify,reject',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->action === 'verify') {
            $appointment->update([
                'payment_status' => 'paid',
                'is_paid' => true,
                'payment_verification_status' => 'verified',
                'payment_notes' => $request->notes,
            ]);
            $message = 'Payment verified successfully.';
        } else {
            $appointment->update([
                'payment_status' => 'unpaid',
                'payment_verification_status' => 'rejected',
                'payment_notes' => $request->notes,
                'transaction_id' => null,
                'payment_gateway' => null,
            ]);
            $message = 'Payment rejected.';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'appointment' => $appointment->fresh(),
        ]);
    }

    /**
     * Toggle doctor's online payment acceptance
     */
    public function toggleDoctorPayment(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'doctor') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $doctor = Doctor::where('user_id', $user->id)->first();

        if (!$doctor) {
            return response()->json(['success' => false, 'message' => 'Doctor profile not found'], 404);
        }

        $doctor->update([
            'accepts_online_payment' => !$doctor->accepts_online_payment,
        ]);

        return response()->json([
            'success' => true,
            'message' => $doctor->accepts_online_payment
                ? 'You are now accepting online payments.'
                : 'Online payment disabled. Patients will pay at clinic.',
            'accepts_online_payment' => $doctor->accepts_online_payment,
        ]);
    }

    /**
     * Get payment status for an appointment
     */
    public function getPaymentStatus($appointmentId)
    {
        $user = auth()->user();
        $appointment = Appointment::with('doctor.user')->findOrFail($appointmentId);

        // Authorization: patient, doctor, or admin
        $isPatient = $appointment->user_id === $user->id;
        $isDoctor = $user->role === 'doctor' &&
            $appointment->doctor &&
            $appointment->doctor->user_id === $user->id;
        $isAdmin = $user->role === 'admin';

        if (!$isPatient && !$isDoctor && !$isAdmin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'success' => true,
            'payment' => [
                'status' => $appointment->payment_status,
                'is_paid' => $appointment->is_paid,
                'gateway' => $appointment->payment_gateway,
                'transaction_id' => $appointment->transaction_id,
                'payment_reference' => $appointment->payment_reference,
                'payment_at' => $appointment->payment_at,
                'verification_status' => $appointment->payment_verification_status,
                'notes' => $appointment->payment_notes,
                'amount' => $appointment->amount,
            ],
        ]);
    }
}
