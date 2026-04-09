<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class ClientNotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 20);
        $perPage = in_array($perPage, [10, 20, 30, 40, 50], true) ? $perPage : 20;

        $user = $request->user();

        $query = $user->notifications()->latest();

        if ($request->boolean('unread_only')) {
            $query->whereNull('read_at');
        }

        $paginator = $query->paginate($perPage);
        $unreadCount = $user->unreadNotifications()->count();

        $paginator->through(function (DatabaseNotification $n) {
            return [
                'id' => $n->id,
                'type' => $n->type,
                'data' => $n->data,
                'read_at' => $n->read_at?->toIso8601String(),
                'created_at' => $n->created_at->toIso8601String(),
            ];
        });

        $data = [
            'notifications' => $paginator->items(),
            'unread_count' => $unreadCount,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ];

        return ApiResponse::success($data, 'Berhasil');
    }

    /**
     * Hanya jumlah notifikasi belum dibaca (untuk badge / polling ringan).
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = $request->user()->unreadNotifications()->count();

        return ApiResponse::success(['unread_count' => $count], 'Berhasil');
    }

    /**
     * Tandai satu notifikasi sebagai sudah dibaca.
     */
    public function read(Request $request, string $id): JsonResponse
    {
        $request->user()
            ->notifications()
            ->findOrFail($id)
            ->markAsRead();

        $unreadCount = $request->user()->unreadNotifications()->count();

        return ApiResponse::success(
            ['unread_count' => $unreadCount],
            'Notifikasi ditandai sudah dibaca.'
        );
    }

    /**
     * Tandai semua notifikasi belum dibaca sebagai sudah dibaca.
     */
    public function readAll(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return ApiResponse::success(
            ['unread_count' => 0],
            'Semua notifikasi ditandai sudah dibaca.'
        );
    }
}
