<?php

namespace App\Http\Controllers\Blogs;

use App\Http\Controllers\Controller;
use App\Models\BlogSubscriber;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogSubscriberController extends Controller
{
    public function index(Request $request)
    {
        $perPage = in_array($request->get('per_page', 20), [20, 30, 40, 50])
            ? (int) $request->get('per_page', 20) : 20;

        $subscribers = BlogSubscriber::query()
            ->when(
                $request->get('search'),
                fn($q, $search) => $q->where(function ($q) use ($search) {
                    $q->where('email', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                })
            )
            ->when(
                in_array($request->get('verified'), ['0', '1'], true),
                fn($q) => $q->where('is_verified', (bool) (int) $request->get('verified'))
            )
            ->latest()
            ->paginate($perPage);

        $summary = BlogSubscriber::query()
            ->selectRaw('
                COUNT(*) as total,
                COALESCE(SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END), 0) as verified,
                COALESCE(SUM(CASE WHEN is_verified = 0 THEN 1 ELSE 0 END), 0) as unverified
            ')
            ->first();

        return Inertia::render('blogs/subscribers/index', [
            'subscribers' => $subscribers,
            'summary' => $summary,
            'filters' => [
                'search' => $request->get('search'),
                'verified' => $request->get('verified'),
                'per_page' => $perPage,
            ],
        ]);
    }

    public function destroy(BlogSubscriber $subscriber)
    {
        $subscriber->delete();

        return back()->with('success', 'Subscriber berhasil dihapus.');
    }
}
