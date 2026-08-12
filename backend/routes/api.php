<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\SpecialtyController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\DoctorDashboardController;
use App\Http\Controllers\Api\PatientReportController;
use App\Http\Controllers\Api\ConsultationNoteController;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ChatbotController;

Route::post('chatbot/query', [ChatbotController::class, 'handleQuery'])->middleware('throttle:30,1');

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:sanctum');
    Route::post('refresh-token', [AuthController::class, 'refreshToken'])->middleware('auth:sanctum');
    
    // Password reset routes
    Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1');
    Route::post('reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');
    Route::get('verify-reset-token/{token}', [AuthController::class, 'verifyResetToken'])->middleware('throttle:10,1');
    
    // Email verification routes
    Route::post('send-otp', [AuthController::class, 'sendOtp'])->middleware('throttle:3,1');
    Route::post('verify-otp', [AuthController::class, 'verifyOtp'])->middleware('throttle:5,1');
    Route::post('resend-otp', [AuthController::class, 'resendOtp'])->middleware('throttle:3,1');
});

Route::prefix('users')->middleware('auth:sanctum')->group(function () {
    Route::get('profile', [UserController::class, 'profile']);
    Route::put('profile', [UserController::class, 'updateProfile']);
    Route::post('change-password', [UserController::class, 'changePassword']);
    Route::post('upload-profile-image', [UserController::class, 'uploadProfileImage']);
});

Route::prefix('doctors')->group(function () {
    Route::get('/', [DoctorController::class, 'index']);
    Route::get('top', [DoctorController::class, 'topDoctors']);
    Route::get('{id}', [DoctorController::class, 'show']);
    Route::get('specialty/{specialtyId}', [DoctorController::class, 'bySpecialty']);
    Route::get('{id}/available-slots', [DoctorController::class, 'availableSlots']);
});

Route::prefix('specialties')->group(function () {
    Route::get('/', [SpecialtyController::class, 'index']);
    Route::get('{id}', [SpecialtyController::class, 'show']);
});

Route::prefix('appointments')->middleware('auth:sanctum')->group(function () {
    Route::get('my', [AppointmentController::class, 'myAppointments']);
    Route::post('book', [AppointmentController::class, 'book']);
    Route::get('{id}', [AppointmentController::class, 'show']);
    Route::post('{id}/cancel', [AppointmentController::class, 'cancel']);
    Route::post('{id}/reschedule', [AppointmentController::class, 'reschedule']);
    Route::put('{id}/status', [AppointmentController::class, 'updateStatus']);
    Route::get('{id}/reports', [AppointmentController::class, 'getAttachedReports']);
});

Route::prefix('reports')->middleware('auth:sanctum')->group(function () {
    Route::get('my', [PatientReportController::class, 'getMyReports']);
    Route::post('upload', [PatientReportController::class, 'uploadReport']);
    Route::get('{report}', [PatientReportController::class, 'getReport']);
    Route::put('{report}', [PatientReportController::class, 'updateReport']);
    Route::delete('{report}', [PatientReportController::class, 'deleteReport']);
    Route::post('{report}/share', [PatientReportController::class, 'toggleShareWithDoctor']);
});

Route::prefix('notes')->middleware('auth:sanctum')->group(function () {
    Route::get('my', [ConsultationNoteController::class, 'getMyNotes']);
    Route::get('doctor', [ConsultationNoteController::class, 'getDoctorNotes']);
    Route::post('create', [ConsultationNoteController::class, 'createNote']);
    Route::get('{note}', [ConsultationNoteController::class, 'getNote']);
    Route::put('{note}', [ConsultationNoteController::class, 'updateNote']);
    Route::delete('{note}', [ConsultationNoteController::class, 'deleteNote']);
    Route::get('appointment/{appointment}', [ConsultationNoteController::class, 'getAppointmentNotes']);
});

Route::prefix('doctor')->middleware(['auth:sanctum'])->group(function () {
    Route::get('dashboard', [DoctorDashboardController::class, 'dashboard']);
    Route::get('appointments', [DoctorDashboardController::class, 'appointments']);
    Route::get('appointments/{id}', [DoctorDashboardController::class, 'appointmentDetail']);
    Route::post('appointments/{id}/accept', [DoctorDashboardController::class, 'acceptAppointment']);
    Route::post('appointments/{id}/reject', [DoctorDashboardController::class, 'rejectAppointment']);
    Route::post('appointments/{id}/complete', [DoctorDashboardController::class, 'completeAppointment']);
    Route::match(['get', 'post', 'put'], 'availability', [DoctorDashboardController::class, 'availability']);
    Route::get('schedule/week', [DoctorDashboardController::class, 'weekSchedule']);
});

Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
    Route::get('dashboard', [AdminController::class, 'dashboard']);
    Route::get('users', [AdminController::class, 'users']);
    Route::delete('users/{id}', [AdminController::class, 'deleteUser']);
    Route::get('doctors', [AdminController::class, 'doctors']);
    Route::post('doctors', [AdminController::class, 'createDoctor']);
    Route::put('doctors/{id}', [AdminController::class, 'updateDoctor']);
    Route::delete('doctors/{id}', [AdminController::class, 'deleteDoctor']);
    Route::post('users/{id}/deactivate', [AdminController::class, 'deactivateUser']);
    Route::post('users/{id}/activate', [AdminController::class, 'activateUser']);
    Route::get('appointments', [AdminController::class, 'appointments']);
    Route::delete('appointments/{id}', [AdminController::class, 'deleteAppointment']);
    Route::post('specialties', [AdminController::class, 'createSpecialty']);
    Route::put('specialties/{id}', [AdminController::class, 'updateSpecialty']);
    Route::delete('specialties/{id}', [AdminController::class, 'deleteSpecialty']);
    Route::match(['get', 'post'], 'settings', [AdminController::class, 'settings']);
});

Route::prefix('ratings')->group(function () {
    Route::get('doctor/{doctorId}', [RatingController::class, 'getDoctorRatings'])->middleware('throttle:60,1');
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('my', [RatingController::class, 'getMyRatings'])->middleware('throttle:60,1');
        Route::post('rate', [RatingController::class, 'rateDoctor'])->middleware('throttle:10,1');
        Route::get('{rating}', [RatingController::class, 'getRating'])->middleware('throttle:60,1');
        Route::put('{rating}', [RatingController::class, 'updateRating'])->middleware('throttle:10,1');
        Route::delete('{rating}', [RatingController::class, 'deleteRating'])->middleware('throttle:10,1');
    });
});

Route::prefix('messages')->middleware('auth:sanctum')->group(function () {
    Route::get('conversations', [MessageController::class, 'getConversations']);
    Route::get('unread-count', [MessageController::class, 'getUnreadCount']);
    Route::get('{otherUserId}', [MessageController::class, 'getMessages']);
    Route::post('send', [MessageController::class, 'sendMessage']);
});

// Payment routes
Route::get('payment/config', [PaymentController::class, 'getPaymentConfig']);
Route::prefix('payment')->middleware('auth:sanctum')->group(function () {
    Route::post('appointments/{appointmentId}/submit', [PaymentController::class, 'submitPayment']);
    Route::post('appointments/{appointmentId}/verify', [PaymentController::class, 'verifyPayment']);
    Route::get('appointments/{appointmentId}/status', [PaymentController::class, 'getPaymentStatus']);
    Route::post('doctor/toggle', [PaymentController::class, 'toggleDoctorPayment']);
});
