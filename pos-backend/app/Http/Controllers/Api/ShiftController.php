<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    public function current()
    {
        $shift = Shift::whereNull('closed_at')->latest()->first();
        return response()->json($shift);
    }

    public function open(Request $request)
    {
        // Close any lingering open shifts first
        Shift::whereNull('closed_at')->update(['closed_at' => Carbon::now()]);

        $data = $request->validate([
            'opening_cash' => 'required|numeric|min:0',
        ]);

        $shift = Shift::create([
            'opening_cash' => $data['opening_cash'],
            'opened_at'    => Carbon::now(),
        ]);

        return response()->json($shift, 201);
    }

    public function close(Request $request)
    {
        $shift = Shift::whereNull('closed_at')->latest()->firstOrFail();

        $data = $request->validate([
            'closing_cash' => 'required|numeric|min:0',
        ]);

        $shift->update([
            'closing_cash' => $data['closing_cash'],
            'closed_at'    => Carbon::now(),
        ]);

        return response()->json($shift);
    }

    public function index()
    {
        return response()->json(
            Shift::orderByDesc('opened_at')->paginate(15)
        );
    }
}
