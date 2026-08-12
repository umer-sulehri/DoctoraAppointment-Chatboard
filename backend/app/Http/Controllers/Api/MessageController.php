<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * Get all conversation contacts for the authenticated user
     */
    public function getConversations(Request $request)
    {
        $userId = $request->user()->id;
        $userRole = $request->user()->role;

        // Get user IDs from past/current messages
        $messagePartnerIds = Message::where('sender_id', $userId)
            ->pluck('receiver_id')
            ->merge(
                Message::where('receiver_id', $userId)->pluck('sender_id')
            )
            ->unique();

        // Also get user IDs from appointments (patient <-> doctor's user_id)
        if ($userRole === 'user') {
            $appointmentDoctorUserIds = Appointment::where('user_id', $userId)
                ->with('doctor')
                ->get()
                ->pluck('doctor.user_id')
                ->filter();
            $partnerIds = $messagePartnerIds->merge($appointmentDoctorUserIds)->unique()->values();
        } elseif ($userRole === 'doctor') {
            $doctor = Doctor::where('user_id', $userId)->first();
            $appointmentPatientUserIds = $doctor
                ? Appointment::where('doctor_id', $doctor->id)->pluck('user_id')
                : collect();
            $partnerIds = $messagePartnerIds->merge($appointmentPatientUserIds)->unique()->values();
        } else {
            // Admin can chat with any user
            $partnerIds = User::where('id', '!=', $userId)->pluck('id');
        }

        // Remove self if present
        $partnerIds = $partnerIds->reject(fn($id) => $id == $userId)->values();

        $conversations = User::whereIn('id', $partnerIds)
            ->get()
            ->map(function ($partner) use ($userId) {
                // Get last message
                $lastMessage = Message::where(function ($q) use ($userId, $partner) {
                    $q->where('sender_id', $userId)->where('receiver_id', $partner->id);
                })->orWhere(function ($q) use ($userId, $partner) {
                    $q->where('sender_id', $partner->id)->where('receiver_id', $userId);
                })
                ->orderBy('created_at', 'desc')
                ->first();

                // Get unread count from this partner
                $unreadCount = Message::where('sender_id', $partner->id)
                    ->where('receiver_id', $userId)
                    ->where('is_read', false)
                    ->count();

                // If partner is doctor, include doctor specialty info
                $specialty = null;
                if ($partner->role === 'doctor') {
                    $doc = Doctor::where('user_id', $partner->id)->with('specialty')->first();
                    $specialty = $doc ? $doc->specialty->name : null;
                }

                return [
                    'partner' => [
                        'id' => $partner->id,
                        'name' => $partner->name,
                        'email' => $partner->email,
                        'role' => $partner->role,
                        'profile_image' => $partner->profile_image,
                        'specialty' => $specialty,
                    ],
                    'last_message' => $lastMessage ? $lastMessage->message : 'No messages yet',
                    'last_message_time' => $lastMessage ? $lastMessage->created_at : null,
                    'unread_count' => $unreadCount,
                ];
            })
            ->sortByDesc(fn($c) => $c['last_message_time'] ? $c['last_message_time']->timestamp : 0)
            ->values();

        return response()->json([
            'success' => true,
            'conversations' => $conversations,
        ]);
    }

    /**
     * Get chat messages between current user and other user
     */
    public function getMessages(Request $request, $otherUserId)
    {
        $userId = $request->user()->id;

        $otherUser = User::find($otherUserId);
        if (!$otherUser) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        // Fetch trajectory
        $messages = Message::where(function ($q) use ($userId, $otherUserId) {
            $q->where('sender_id', $userId)->where('receiver_id', $otherUserId);
        })->orWhere(function ($q) use ($userId, $otherUserId) {
            $q->where('sender_id', $otherUserId)->where('receiver_id', $userId);
        })
        ->orderBy('created_at', 'asc')
        ->get();

        // Mark unread incoming messages as read
        Message::where('sender_id', $otherUserId)
            ->where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'other_user' => [
                'id' => $otherUser->id,
                'name' => $otherUser->name,
                'role' => $otherUser->role,
                'profile_image' => $otherUser->profile_image,
            ],
            'messages' => $messages,
        ]);
    }

    /**
     * Send a new message
     */
    public function sendMessage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string|max:2000',
            'appointment_id' => 'nullable|exists:appointments,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $senderId = $request->user()->id;
        $receiverId = $request->receiver_id;

        if ($senderId == $receiverId) {
            return response()->json(['success' => false, 'message' => 'You cannot send a message to yourself'], 422);
        }

        $message = Message::create([
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'appointment_id' => $request->appointment_id,
            'message' => $request->message,
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => $message,
        ], 201);
    }

    /**
     * Get total unread count for current user
     */
    public function getUnreadCount(Request $request)
    {
        $userId = $request->user()->id;

        $count = Message::where('receiver_id', $userId)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'success' => true,
            'unread_count' => $count,
        ]);
    }
}
