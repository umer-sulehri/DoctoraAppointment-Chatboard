<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OtpVerificationMail;
use App\Mail\PasswordResetMail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'user',
            'is_active' => true,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        
        if ($user->role === 'doctor' && $user->doctor) {
            $user->load('doctor.specialty');
        }

        return response()->json([
            'success' => true,
            'user' => $user,
        ]);
    }

    public function refreshToken(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();
        
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
        ]);
    }

    /**
     * Request password reset token
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        // Generate reset token (valid for 1 hour)
        $resetToken = Str::random(60);
        $user->update([
            'reset_token' => Hash::make($resetToken),
            'reset_token_expires_at' => Carbon::now()->addHour(),
        ]);

        // Send password reset email
        Mail::to($user->email)->send(new PasswordResetMail($user, $resetToken));

        return response()->json([
            'success' => true,
            'message' => 'Password reset link sent to your email',
        ]);
    }

    /**
     * Verify reset token and reset password
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        // Check if reset token exists and is not expired
        if (!$user->reset_token || !$user->reset_token_expires_at) {
            return response()->json([
                'success' => false,
                'message' => 'No reset request found for this email'
            ], 400);
        }

        if (Carbon::now()->isAfter($user->reset_token_expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Password reset token has expired. Please request a new one.'
            ], 400);
        }

        // Verify the token
        if (!Hash::check($request->token, $user->reset_token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid reset token'
            ], 400);
        }

        // Reset password
        $user->update([
            'password' => Hash::make($request->password),
            'reset_token' => null,
            'reset_token_expires_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully. You can now login with your new password.'
        ]);
    }

    /**
     * Verify reset token (without resetting password)
     */
    public function verifyResetToken(Request $request, $token)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user->reset_token || !$user->reset_token_expires_at) {
            return response()->json([
                'success' => false,
                'message' => 'No reset request found'
            ], 400);
        }

        if (Carbon::now()->isAfter($user->reset_token_expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Reset token has expired'
            ], 400);
        }

        if (!Hash::check($token, $user->reset_token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Token is valid',
            'email' => $user->email,
        ]);
    }

    /**
     * Send OTP for email verification
     */
    public function sendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if ($user->email_verified) {
            return response()->json([
                'success' => false,
                'message' => 'Email is already verified'
            ], 400);
        }

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->update([
            'otp_code' => Hash::make($otp),
            'otp_expires_at' => Carbon::now()->addMinutes(10),
        ]);

        // Send OTP verification email
        Mail::to($user->email)->send(new OtpVerificationMail($user, $otp));

        return response()->json([
            'success' => true,
            'message' => 'OTP sent to your email',
        ]);
    }

    /**
     * Verify email with OTP
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if ($user->email_verified) {
            return response()->json([
                'success' => false,
                'message' => 'Email is already verified'
            ], 400);
        }

        if (!$user->otp_code || !$user->otp_expires_at) {
            return response()->json([
                'success' => false,
                'message' => 'No OTP found. Please request a new one.'
            ], 400);
        }

        if (Carbon::now()->isAfter($user->otp_expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'OTP has expired. Please request a new one.'
            ], 400);
        }

        if (!Hash::check($request->otp, $user->otp_code)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP'
            ], 400);
        }

        // Mark email as verified
        $user->update([
            'email_verified' => true,
            'otp_code' => null,
            'otp_expires_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully'
        ]);
    }

    /**
     * Resend OTP
     */
    public function resendOtp(Request $request)
    {
        return $this->sendOtp($request);
    }
}
