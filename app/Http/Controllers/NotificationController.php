<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate($perPage);

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
        ]);
    }

    public function read(Request $request, string $id)
    {
        $request->user()
            ->notifications()
            ->findOrFail($id)
            ->markAsRead();

        return back();
    }

    public function markAllRead(Request $request)
    {
        $request->user()
            ->unreadNotifications
            ->markAsRead();

        return back();
    }

    public function destroy(Request $request, string $id)
    {
        $request->user()
            ->notifications()
            ->findOrFail($id)
            ->delete();

        return back();
    }

    public function destroyAll(Request $request)
    {
        $request->user()
            ->notifications()
            ->delete();

        return back();
    }
}
