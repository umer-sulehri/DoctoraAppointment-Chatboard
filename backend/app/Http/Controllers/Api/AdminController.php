<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Specialty;
use App\Models\User;
use App\Models\AdminSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    public function dashboard()
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $stats = [
            'total_users' => User::where('role', 'user')->count(),
            'total_doctors' => User::where('role', 'doctor')->count(),
            'total_appointments' => Appointment::count(),
            'pending_appointments' => Appointment::where('status', 'pending')->count(),
            'completed_appointments' => Appointment::where('status', 'completed')->count(),
            'total_specialties' => Specialty::where('is_active', true)->count(),
            'revenue' => Appointment::where('payment_status', 'paid')->sum('amount'),
        ];

        return response()->json([
            'success' => true,
            'stats' => $stats,
        ]);
    }

    public function users(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $query = User::where('role', 'user');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        $users = $query->paginate(15);

        return response()->json([
            'success' => true,
            'users' => $users,
        ]);
    }

    public function deleteUser($id)
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $targetUser = User::find($id);
        if (!$targetUser) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $targetUser->delete();
        return response()->json(['success' => true, 'message' => 'User deleted successfully']);
    }

    public function doctors(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $query = Doctor::with('user', 'specialty');

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        if ($request->has('specialty_id')) {
            $query->where('specialty_id', $request->specialty_id);
        }

        $doctors = $query->paginate(15);

        return response()->json([
            'success' => true,
            'doctors' => $doctors,
        ]);
    }

    public function createDoctor(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'specialty_id' => 'required|exists:specialties,id',
            'license_number' => 'required|unique:doctors',
            'consultation_fee' => 'required|numeric|min:0',
            'years_of_experience' => 'nullable|integer|min:0',
            'qualifications' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'doctor',
            'is_active' => true,
        ]);

        $doctor = Doctor::create([
            'user_id' => $user->id,
            'specialty_id' => $request->specialty_id,
            'license_number' => $request->license_number,
            'consultation_fee' => $request->consultation_fee,
            'years_of_experience' => $request->years_of_experience ?? 0,
            'qualifications' => $request->qualifications,
            'is_available' => true,
        ]);

        $doctor->load('user', 'specialty');

        return response()->json([
            'success' => true,
            'message' => 'Doctor created successfully',
            'doctor' => $doctor,
        ], 201);
    }

    public function updateDoctor($id, Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $doctor = Doctor::with('user')->find($id);

        if (!$doctor) {
            return response()->json([
                'success' => false,
                'message' => 'Doctor not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $doctor->user_id,
            'phone' => 'nullable|string|max:20',
            'specialty_id' => 'sometimes|exists:specialties,id',
            'consultation_fee' => 'sometimes|numeric|min:0',
            'years_of_experience' => 'nullable|integer|min:0',
            'qualifications' => 'nullable|string',
            'is_available' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userData = array_filter($request->only(['name', 'email', 'phone']));
        if (!empty($userData)) {
            $doctor->user->update($userData);
        }

        $doctorData = array_filter($request->only(['specialty_id', 'consultation_fee', 'years_of_experience', 'qualifications', 'is_available']));
        if (!empty($doctorData)) {
            $doctor->update($doctorData);
        }

        $doctor->load('user', 'specialty');

        return response()->json([
            'success' => true,
            'message' => 'Doctor updated successfully',
            'doctor' => $doctor,
        ]);
    }

    public function deleteDoctor($id)
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $doctor = Doctor::find($id);
        if (!$doctor) {
            return response()->json(['success' => false, 'message' => 'Doctor not found'], 404);
        }

        $userAccount = User::find($doctor->user_id);
        $doctor->delete();
        if ($userAccount) {
            $userAccount->delete();
        }

        return response()->json(['success' => true, 'message' => 'Doctor deleted successfully']);
    }

    public function deactivateUser($id)
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $targetUser = User::find($id);

        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $targetUser->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'User deactivated successfully',
        ]);
    }

    public function activateUser($id)
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $targetUser = User::find($id);

        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $targetUser->update(['is_active' => true]);

        return response()->json([
            'success' => true,
            'message' => 'User activated successfully',
        ]);
    }

    public function appointments(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $query = Appointment::with('user', 'doctor.user', 'doctor.specialty');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $appointments = $query->orderBy('appointment_date', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'appointments' => $appointments,
        ]);
    }

    public function deleteAppointment($id)
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $appointment = Appointment::find($id);
        if (!$appointment) {
            return response()->json(['success' => false, 'message' => 'Appointment not found'], 404);
        }

        $appointment->delete();
        return response()->json(['success' => true, 'message' => 'Appointment deleted successfully']);
    }

    public function createSpecialty(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:specialties',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $specialty = Specialty::create($validator->validated() + ['is_active' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Specialty created successfully',
            'specialty' => $specialty,
        ], 201);
    }

    public function updateSpecialty($id, Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $specialty = Specialty::find($id);
        if (!$specialty) {
            return response()->json(['success' => false, 'message' => 'Specialty not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|unique:specialties,name,' . $id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $specialty->update($validator->validated());
        return response()->json(['success' => true, 'message' => 'Specialty updated successfully', 'specialty' => $specialty]);
    }

    public function deleteSpecialty($id)
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $specialty = Specialty::find($id);
        if (!$specialty) {
            return response()->json(['success' => false, 'message' => 'Specialty not found'], 404);
        }

        $specialty->delete();
        return response()->json(['success' => true, 'message' => 'Specialty deleted successfully']);
    }

    public function settings(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if ($request->method() === 'GET') {
            $settings = AdminSetting::all();
            return response()->json([
                'success' => true,
                'settings' => $settings,
            ]);
        }

        $validator = Validator::make($request->all(), [
            'key' => 'required|string',
            'value' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $setting = AdminSetting::updateOrCreate(
            ['key' => $request->key],
            ['value' => $request->value]
        );

        return response()->json([
            'success' => true,
            'message' => 'Setting updated successfully',
            'setting' => $setting,
        ]);
    }
}
