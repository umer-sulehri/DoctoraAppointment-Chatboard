<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PatientReport;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PatientReportController extends Controller
{
    /**
     * Get all reports for the authenticated patient
     */
    public function getMyReports(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'user') {
            return response()->json([
                'success' => false,
                'message' => 'Only patients can access reports'
            ], 403);
        }

        $reports = PatientReport::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($r) {
                return $this->formatReport($r);
            });

        return response()->json([
            'success' => true,
            'reports' => $reports,
        ]);
    }

    /**
     * Upload a new patient report
     * Supports both simple (file only) and detailed (with title, type) uploads
     */
    public function uploadReport(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'user') {
            return response()->json([
                'success' => false,
                'message' => 'Only patients can upload reports'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'file' => 'nullable|file|max:10240|mimes:pdf,jpg,jpeg,png',
            'report_file' => 'nullable|file|max:10240|mimes:pdf,jpg,jpeg,png',
            'title' => 'nullable|string|max:255',
            'report_type' => 'nullable|in:lab_test,prescription,diagnosis,imaging,general,other',
            'description' => 'nullable|string',
            'report_date' => 'nullable|date',
            'file_name' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $filePath = null;
        $originalName = null;

        // Support both 'file' and 'report_file' field names
        $uploadedFile = $request->file('file') ?? $request->file('report_file');

        if ($uploadedFile) {
            $filePath = $uploadedFile->store('patient-reports', 'public');
            $originalName = $uploadedFile->getClientOriginalName();
        }

        $title = $request->title ?? $request->file_name ?? ($originalName ?? 'Medical Report');
        $reportType = $request->report_type ?? 'general';

        $report = PatientReport::create([
            'user_id' => $user->id,
            'report_type' => $reportType,
            'title' => $title,
            'description' => $request->description,
            'file_path' => $filePath,
            'report_date' => $request->report_date ?? now()->toDateString(),
            'is_shared_with_doctor' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Report uploaded successfully',
            'report' => $this->formatReport($report),
        ], 201);
    }

    /**
     * Get a specific report
     */
    public function getReport(PatientReport $report, Request $request)
    {
        $user = $request->user();

        // Patient can view their own reports
        if ($user->id === $report->user_id && $user->role === 'user') {
            return response()->json([
                'success' => true,
                'data' => $this->formatReport($report),
            ]);
        }

        // Doctor can view if patient shared it
        if ($user->role === 'doctor' && $report->is_shared_with_doctor) {
            return response()->json([
                'success' => true,
                'data' => $this->formatReport($report),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthorized to view this report'
        ], 403);
    }

    /**
     * Update a report
     */
    public function updateReport(PatientReport $report, Request $request)
    {
        $user = $request->user();

        // Only the patient who uploaded the report can update it
        if ($user->id !== $report->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this report'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'report_type' => 'sometimes|in:lab_test,prescription,diagnosis,imaging,general,other',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'report_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $report->update($request->only([
            'report_type',
            'title',
            'description',
            'report_date',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Report updated successfully',
            'data' => $this->formatReport($report),
        ]);
    }

    /**
     * Delete a report
     */
    public function deleteReport(PatientReport $report, Request $request)
    {
        $user = $request->user();

        // Only the patient who uploaded the report can delete it
        if ($user->id !== $report->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this report'
            ], 403);
        }

        // Delete file if exists
        if ($report->file_path) {
            Storage::disk('public')->delete($report->file_path);
        }

        $report->delete();

        return response()->json([
            'success' => true,
            'message' => 'Report deleted successfully',
        ]);
    }

    /**
     * Share/unshare a report with doctor
     */
    public function toggleShareWithDoctor(PatientReport $report, Request $request)
    {
        $user = $request->user();

        // Only the patient can control sharing
        if ($user->id !== $report->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $report->update([
            'is_shared_with_doctor' => !$report->is_shared_with_doctor,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Report sharing updated',
            'data' => $this->formatReport($report),
        ]);
    }

    /**
     * Helper: format report with file URL
     */
    private function formatReport(PatientReport $report): array
    {
        return [
            'id' => $report->id,
            'user_id' => $report->user_id,
            'title' => $report->title,
            'report_type' => $report->report_type,
            'description' => $report->description,
            'report_date' => $report->report_date,
            'is_shared_with_doctor' => $report->is_shared_with_doctor,
            'file_path' => $report->file_path,
            'file_url' => $report->file_path ? asset('storage/' . $report->file_path) : null,
            'created_at' => $report->created_at,
            'updated_at' => $report->updated_at,
        ];
    }
}
