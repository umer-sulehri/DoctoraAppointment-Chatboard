<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Specialty;
use Illuminate\Http\Request;

class SpecialtyController extends Controller
{
    public function index()
    {
        $specialties = Specialty::where('is_active', true)->get();

        return response()->json([
            'success' => true,
            'specialties' => $specialties,
        ]);
    }

    public function show($id)
    {
        $specialty = Specialty::find($id);

        if (!$specialty) {
            return response()->json([
                'success' => false,
                'message' => 'Specialty not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'specialty' => $specialty,
        ]);
    }
}
