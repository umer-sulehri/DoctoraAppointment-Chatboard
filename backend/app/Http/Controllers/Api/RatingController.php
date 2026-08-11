<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Rating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RatingController extends Controller
{
    /**
     * Get all ratings for a specific doctor
     */
    public function getDoctorRatings(Request $request, $doctorId)
    {
        $doctor = Doctor::findOrFail($doctorId);

        $sortBy = $request->query('sort', 'recent'); // recent, highest, lowest

        $query = Rating::where('doctor_id', $doctorId);

        if ($sortBy === 'highest') {
            $query->orderBy('rating', 'desc');
        } elseif ($sortBy === 'lowest') {
            $query->orderBy('rating', 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $ratings = $query->with(['patient:id,name', 'appointment:id,appointment_date'])
            ->paginate(10);

        $averageRating = $doctor->ratings()->avg('rating') ?: 0;
        $totalRatings = $doctor->ratings()->count();

        // Count ratings by star
        $ratingBreakdown = [
            '5' => $doctor->ratings()->where('rating', 5)->count(),
            '4' => $doctor->ratings()->where('rating', 4)->count(),
            '3' => $doctor->ratings()->where('rating', 3)->count(),
            '2' => $doctor->ratings()->where('rating', 2)->count(),
            '1' => $doctor->ratings()->where('rating', 1)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $ratings,
            'statistics' => [
                'average_rating' => round($averageRating, 1),
                'total_ratings' => $totalRatings,
                'rating_breakdown' => $ratingBreakdown,
                'would_recommend_count' => $doctor->ratings()->where('would_recommend', true)->count(),
            ],
        ]);
    }

    /**
     * Get ratings given by the authenticated patient
     */
    public function getMyRatings(Request $request)
    {
        $user = $request->user();

        $ratings = Rating::where('patient_id', $user->id)
            ->with(['doctor.user:id,name', 'doctor.specialty:id,name'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $ratings,
        ]);
    }

    /**
     * Create or update a rating for a doctor
     */
    public function rateDoctor(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'user') {
            return response()->json([
                'success' => false,
                'message' => 'Only patients can rate doctors'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
            'would_recommend' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $doctor = Doctor::findOrFail($request->doctor_id);

        // Check if patient already rated this doctor for this appointment
        $existingRating = Rating::where('doctor_id', $doctor->id)
            ->where('patient_id', $user->id)
            ->where('appointment_id', $request->appointment_id)
            ->first();

        if ($existingRating) {
            // Update existing rating
            $existingRating->update([
                'rating' => $request->rating,
                'review' => $request->review,
                'would_recommend' => $request->would_recommend ?? true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Rating updated successfully',
                'data' => $existingRating,
            ]);
        }

        // Create new rating
        $rating = Rating::create([
            'doctor_id' => $doctor->id,
            'patient_id' => $user->id,
            'appointment_id' => $request->appointment_id,
            'rating' => $request->rating,
            'review' => $request->review,
            'would_recommend' => $request->would_recommend ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Rating created successfully',
            'data' => $rating,
        ], 201);
    }

    /**
     * Get a specific rating
     */
    public function getRating(Rating $rating, Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $rating->load(['patient:id,name', 'doctor.user:id,name', 'doctor.specialty:id,name']),
        ]);
    }

    /**
     * Update a rating (patient only)
     */
    public function updateRating(Rating $rating, Request $request)
    {
        $user = $request->user();

        if ($user->id !== $rating->patient_id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only update your own ratings'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'sometimes|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
            'would_recommend' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $rating->update($request->only(['rating', 'review', 'would_recommend']));

        return response()->json([
            'success' => true,
            'message' => 'Rating updated successfully',
            'data' => $rating,
        ]);
    }

    /**
     * Delete a rating (patient only)
     */
    public function deleteRating(Rating $rating, Request $request)
    {
        $user = $request->user();

        if ($user->id !== $rating->patient_id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only delete your own ratings'
            ], 403);
        }

        $rating->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rating deleted successfully',
        ]);
    }
}
