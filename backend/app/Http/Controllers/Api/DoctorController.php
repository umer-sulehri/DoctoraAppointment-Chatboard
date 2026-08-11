<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index(Request $request)
    {
        $query = Doctor::with('user', 'specialty')
            ->whereHas('user', function ($q) {
                $q->where('is_active', true);
            })
            ->where('is_available', true);

        if ($request->has('specialty_id')) {
            $query->where('specialty_id', $request->specialty_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%$search%");
            });
        }

        $doctors = $query->paginate(12);

        return response()->json([
            'success' => true,
            'doctors' => $doctors,
        ]);
    }

    public function topDoctors(Request $request)
    {
        $limit = $request->get('limit', 10);

        $doctors = Doctor::with('user', 'specialty')
            ->whereHas('user', function ($q) {
                $q->where('is_active', true);
            })
            ->where('is_available', true)
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'doctors' => $doctors,
        ]);
    }

    public function show($id)
    {
        $doctor = Doctor::with('user', 'specialty', 'appointments')
            ->find($id);

        if (!$doctor) {
            return response()->json([
                'success' => false,
                'message' => 'Doctor not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'doctor' => $doctor,
        ]);
    }

    public function bySpecialty($specialtyId)
    {
        $doctors = Doctor::with('user', 'specialty')
            ->where('specialty_id', $specialtyId)
            ->whereHas('user', function ($q) {
                $q->where('is_active', true);
            })
            ->where('is_available', true)
            ->paginate(12);

        return response()->json([
            'success' => true,
            'doctors' => $doctors,
        ]);
    }

    public function availableSlots($id, Request $request)
    {
        $doctor = Doctor::find($id);

        if (!$doctor) {
            return response()->json([
                'success' => false,
                'message' => 'Doctor not found'
            ], 404);
        }

        $date = $request->date ?? now()->format('Y-m-d');
        
        // Generate time slots (9 AM to 5 PM, 30-minute intervals)
        $slots = [];
        $startTime = \Carbon\Carbon::createFromFormat('Y-m-d H:i', "$date 09:00");
        $endTime = \Carbon\Carbon::createFromFormat('Y-m-d H:i', "$date 17:00");

        while ($startTime < $endTime) {
            $slotTime = $startTime->copy();
            $isBooked = $doctor->appointments()
                ->where('appointment_date', '>=', $slotTime->startOfMinute())
                ->where('appointment_date', '<', $slotTime->addMinutes($doctor->appointment_duration)->startOfMinute())
                ->where('status', '!=', 'cancelled')
                ->exists();

            $slots[] = [
                'time' => $slotTime->subMinutes($doctor->appointment_duration)->format('H:i'),
                'available' => !$isBooked,
            ];

            $startTime->addMinutes($doctor->appointment_duration);
        }

        return response()->json([
            'success' => true,
            'slots' => $slots,
        ]);
    }
}
