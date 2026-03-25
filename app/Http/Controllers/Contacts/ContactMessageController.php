<?php

namespace App\Http\Controllers\Contacts;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactMessageController extends Controller
{
    public function index(Request $request)
    {
        $perPage = in_array($request->get('per_page', 20), [20, 30, 40, 50])
            ? $request->get('per_page', 20) : 20;

        $messages = ContactMessage::query()
            ->when(
                $request->get('search'),
                fn ($q, $search) => $q->where('name', 'like', "%{$search}%")
                    ->orWhere('whatsapp_number', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
            )
            ->when(
                $request->get('status'),
                fn ($q, $status) => $q->where('status', $status)
            )
            ->latest()
            ->paginate($perPage);

        $summary = ContactMessage::query()
            ->selectRaw("
                COUNT(*) as total,
                COALESCE(SUM(CASE WHEN status = 'unread'    THEN 1 ELSE 0 END), 0) as unread,
                COALESCE(SUM(CASE WHEN status = 'read'      THEN 1 ELSE 0 END), 0) as `read`,
                COALESCE(SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END), 0) as contacted
            ")
            ->first();

        return Inertia::render('contacts/messages/index', [
            'messages' => $messages,
            'summary' => $summary,
            'filters' => [
                'search' => $request->get('search'),
                'status' => $request->get('status'),
                'per_page' => $perPage,
            ],
        ]);
    }

    public function updateStatus(Request $request, ContactMessage $message)
    {
        $request->validate([
            'status' => 'required|in:unread,read,contacted',
        ], [
            'status.required' => 'Status wajib diisi.',
            'status.in' => 'Status tidak valid, pilih antara unread, read, atau contacted.',
        ]);

        $message->update(['status' => $request->status]);

        return back()->with('success', 'Status pesan berhasil diperbarui.');
    }

    public function destroy(ContactMessage $message)
    {
        $message->delete();

        return back()->with('success', 'Pesan berhasil dihapus.');
    }
}
