<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\ProjectInvoice;
use App\Support\ApiFileUrls;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClientInvoiceController extends Controller
{
    public function index(Request $request)
    {
        $customer = Auth::user()->customer;

        if (! $customer) {
            return ApiResponse::success([], 'Berhasil');
        }

        $invoices = ProjectInvoice::query()
            ->where(function ($q) use ($customer) {
                $q->where('customer_id', $customer->id)
                    ->orWhereHas('project', fn ($p) => $p->where('customer_id', $customer->id));
            })
            ->where('status', '!=', 'draft')
            ->with([
                'project:id,name,status',
            ])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->latest('invoice_date')
            ->latest('id')
            ->get();

        return ApiResponse::success($invoices, 'Berhasil');
    }

    public function show(ProjectInvoice $invoice)
    {
        $invoice->load([
            'items',
            'payments' => fn ($q) => $q->latest(),
            'project:id,name,status,customer_id',
            'customer:id,name,email',
        ]);

        $invoice->append([
            'total_paid',
            'remaining_amount',
            'formatted_type',
        ]);

        ApiFileUrls::invoice($invoice);
        ApiFileUrls::payments($invoice->payments);

        return ApiResponse::success($invoice, 'Berhasil');
    }
}
