<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\ChatSession;
use App\Models\Company;
use App\Models\ContactMessage;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'companies' => Company::query()->count(),
            'services' => Service::query()->count(),
            'blogs_published' => Blog::query()->where('is_published', true)->count(),
            'users' => User::query()->count(),
            'contact_messages' => ContactMessage::query()->count(),
            'contact_unread' => ContactMessage::query()->unread()->count(),
            'chat_sessions' => ChatSession::query()->count(),
        ];

        $activity = collect(range(6, 0))->map(function (int $daysAgo) {
            $day = Carbon::now()->subDays($daysAgo)->startOfDay();
            $end = $day->copy()->endOfDay();

            return [
                'date' => $day->toDateString(),
                'chats' => (int) ChatSession::query()->whereBetween('created_at', [$day, $end])->count(),
                'contacts' => (int) ContactMessage::query()->whereBetween('created_at', [$day, $end])->count(),
            ];
        })->values()->all();

        $statusLabels = [
            'active' => 'Aktif',
            'closed' => 'Ditutup',
            'converted' => 'Dikonversi',
        ];

        $chatByStatus = ChatSession::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => [
                'status' => $row->status,
                'label' => $statusLabels[$row->status] ?? $row->status,
                'count' => (int) $row->total,
            ])
            ->values()
            ->all();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'activity' => $activity,
            'chatByStatus' => $chatByStatus,
        ]);
    }
}
