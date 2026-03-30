<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\ChatSession;
use App\Models\Company;
use App\Models\ContactMessage;
use App\Models\Project;
use App\Models\Service;
use App\Models\User;
use App\Services\FinancialReportService;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'companies' => Company::query()->count(),
            'services' => Service::query()->count(),
            'projects' => Project::query()->count(),
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

        $revenueTotal = FinancialReportService::totalRevenueLifetime();
        $monthlyRevenueExpense = FinancialReportService::revenueExpenseByMonthLast(12);

        $revenueThisMonth = 0.0;
        $revenuePrevMonth = 0.0;
        $revenueMomPercent = null;
        if (count($monthlyRevenueExpense) >= 1) {
            $revenueThisMonth = (float) $monthlyRevenueExpense[count($monthlyRevenueExpense) - 1]['revenue'];
        }
        if (count($monthlyRevenueExpense) >= 2) {
            $revenuePrevMonth = (float) $monthlyRevenueExpense[count($monthlyRevenueExpense) - 2]['revenue'];
            if ($revenuePrevMonth > 0) {
                $revenueMomPercent = round((($revenueThisMonth - $revenuePrevMonth) / $revenuePrevMonth) * 100, 1);
            } elseif ($revenueThisMonth > 0) {
                $revenueMomPercent = 100.0;
            }
        }

        $contactsLast7 = (int) ContactMessage::query()->where('created_at', '>=', Carbon::now()->subDays(7))->count();
        $contactsPrev7 = (int) ContactMessage::query()
            ->whereBetween('created_at', [Carbon::now()->subDays(14), Carbon::now()->subDays(7)])
            ->count();

        $chatsLast7 = (int) ChatSession::query()->where('created_at', '>=', Carbon::now()->subDays(7))->count();
        $chatsPrev7 = (int) ChatSession::query()
            ->whereBetween('created_at', [Carbon::now()->subDays(14), Carbon::now()->subDays(7)])
            ->count();

        $companiesNew30 = (int) Company::query()->where('created_at', '>=', Carbon::now()->subDays(30))->count();
        $companiesPrev30 = (int) Company::query()
            ->whereBetween('created_at', [Carbon::now()->subDays(60), Carbon::now()->subDays(30)])
            ->count();

        $thisMonthStart = Carbon::now()->startOfMonth();
        $lastMonthStart = Carbon::now()->subMonthNoOverflow()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonthNoOverflow()->endOfMonth();
        $now = Carbon::now();

        $projectsThisMonth = (int) Project::query()->whereBetween('created_at', [$thisMonthStart, $now])->count();
        $projectsLastMonth = (int) Project::query()->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();

        $blogsThisMonth = (int) Blog::query()
            ->where('is_published', true)
            ->whereNotNull('published_at')
            ->whereBetween('published_at', [$thisMonthStart, $now])
            ->count();
        $blogsLastMonth = (int) Blog::query()
            ->where('is_published', true)
            ->whereNotNull('published_at')
            ->whereBetween('published_at', [$lastMonthStart, $lastMonthEnd])
            ->count();

        $usersThisMonth = (int) User::query()->whereBetween('created_at', [$thisMonthStart, $now])->count();
        $usersLastMonth = (int) User::query()->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();

        $kpiTrends = [
            'revenue_month' => [
                'value' => $revenueThisMonth,
                'delta_percent' => $revenueMomPercent,
                'footer' => 'Pendapatan bulan berjalan (jurnal). Kumulatif tercatat di bawah.',
            ],
            'contacts_week' => [
                'value' => $contactsLast7,
                'delta_percent' => self::deltaPercentFloat($contactsLast7, $contactsPrev7),
                'footer' => 'Dibanding 7 hari sebelumnya - Total pesan: '.number_format($stats['contact_messages']),
            ],
            'chats_week' => [
                'value' => $chatsLast7,
                'delta_percent' => self::deltaPercentFloat($chatsLast7, $chatsPrev7),
                'footer' => 'Dibanding 7 hari sebelumnya - Total sesi: '.number_format($stats['chat_sessions']),
            ],
            'companies' => [
                'value' => $stats['companies'],
                'delta_percent' => self::deltaPercentFloat($companiesNew30, $companiesPrev30),
                'footer' => 'Pendaftaran baru (30 hari): '.$companiesNew30.' vs sebelumnya: '.$companiesPrev30,
            ],
            'projects' => [
                'value' => $stats['projects'],
                'delta_percent' => self::deltaPercentFloat($projectsThisMonth, $projectsLastMonth),
                'footer' => 'Baru bulan ini: '.$projectsThisMonth.' vs bulan lalu: '.$projectsLastMonth.' - Total proyek: '.number_format($stats['projects']),
            ],
            'blogs' => [
                'value' => $stats['blogs_published'],
                'delta_percent' => self::deltaPercentFloat($blogsThisMonth, $blogsLastMonth),
                'footer' => 'Terbit bulan ini: '.$blogsThisMonth.' vs bulan lalu: '.$blogsLastMonth.' - Total terbit: '.number_format($stats['blogs_published']),
            ],
            'users' => [
                'value' => $stats['users'],
                'delta_percent' => self::deltaPercentFloat($usersThisMonth, $usersLastMonth),
                'footer' => 'Baru bulan ini: '.$usersThisMonth.' vs bulan lalu: '.$usersLastMonth.' - Total akun: '.number_format($stats['users']),
            ],
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'activity' => $activity,
            'chatByStatus' => $chatByStatus,
            'revenueTotal' => $revenueTotal,
            'monthlyRevenueExpense' => $monthlyRevenueExpense,
            'kpiTrends' => $kpiTrends,
        ]);
    }

    private static function deltaPercentFloat(float|int $current, float|int $previous): ?float
    {
        if ($previous > 0) {
            return round((($current - $previous) / $previous) * 100, 1);
        }
        if ($current > 0) {
            return 100.0;
        }

        if ($current === 0 && $previous === 0) {
            return null;
        }

        return null;
    }
}
