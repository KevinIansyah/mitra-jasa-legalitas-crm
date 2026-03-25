<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $status = $request->get('status');

        $users = User::query()
            ->whereHas('roles', fn ($q) => $q->where('name', 'user'))
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            }))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->latest()
            ->paginate($perPage);

        $summary = [
            'total' => User::whereHas('roles', fn ($q) => $q->where('name', 'user'))->count(),
            'active' => User::whereHas('roles', fn ($q) => $q->where('name', 'user'))->where('status', 'active')->count(),
            'inactive' => User::whereHas('roles', fn ($q) => $q->where('name', 'user'))->where('status', 'inactive')->count(),
            'suspended' => User::whereHas('roles', fn ($q) => $q->where('name', 'user'))->where('status', 'suspended')->count(),
        ];

        return Inertia::render('master-data/users/index', [
            'users' => $users,
            'summary' => $summary,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'status' => $status,
            ],
        ]);
    }

    public function updateStatus(Request $request, User $user)
    {
        $request->validate([
            'status' => 'required|in:active,inactive,suspended',
        ], [
            'status.required' => 'Status wajib dipilih.',
            'status.in' => 'Status yang dipilih tidak valid. Pilih salah satu: aktif, tidak aktif, atau ditangguhkan.',
        ]);

        if (! $user->hasRole('user')) {
            return back()->withErrors(['error' => 'Hanya akun user yang dapat diubah statusnya di sini.']);
        }

        $user->update(['status' => $request->status]);

        $messages = [
            'active' => 'Akun user berhasil diaktifkan.',
            'inactive' => 'Akun user berhasil dinonaktifkan.',
            'suspended' => 'Akun user berhasil ditangguhkan.',
        ];

        return back()->with('success', $messages[$request->status]);
    }
}
