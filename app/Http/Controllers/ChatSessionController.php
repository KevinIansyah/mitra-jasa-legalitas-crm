<?php

namespace App\Http\Controllers;

use App\Models\ChatSession;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatSessionController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $status = $request->get('status');

        $sessions = ChatSession::query()
            ->withCount('messages')
            ->when($search, fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            }))
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest('last_message_at')
            ->paginate($perPage);

        $summary = [
            'total' => ChatSession::count(),
            'active' => ChatSession::where('status', 'active')->count(),
            'converted' => ChatSession::where('status', 'converted')->count(),
            'closed' => ChatSession::where('status', 'closed')->count(),
        ];

        return Inertia::render('ai/chat-sessions/index', [
            'sessions' => $sessions,
            'summary' => $summary,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function show(ChatSession $chatSession)
    {
        $chatSession->load(['messages' => fn ($query) => $query->orderBy('created_at')]);

        return Inertia::render('ai/chat-sessions/show', [
            'session' => $chatSession,
        ]);
    }

    public function destroy(ChatSession $chatSession)
    {
        $chatSession->delete();

        return back()->with('success', 'Sesi chat berhasil dihapus.');
    }
}
