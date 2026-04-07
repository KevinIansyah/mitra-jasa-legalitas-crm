<?php

namespace App\Http\Controllers\Contents;

use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Content\ClientCompanies\StoreRequest;
use App\Http\Requests\Content\ClientCompanies\UpdateRequest;
use App\Models\ClientCompany;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientCompanyController extends Controller
{
    public function index(Request $request)
    {
        $perPage = in_array($request->get('per_page', 20), [20, 30, 40, 50])
            ? (int) $request->get('per_page', 20) : 20;

        $search = $request->get('search');
        $published = $request->get('published');

        $clientCompanies = ClientCompany::query()
            ->when($search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($published === '1', fn ($q) => $q->where('is_published', true))
            ->when($published === '0', fn ($q) => $q->where('is_published', false))
            ->latest()
            ->paginate($perPage);

        $summaryRow = ClientCompany::query()
            ->selectRaw('
                COUNT(*) as total,
                COALESCE(SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END), 0) as published,
                COALESCE(SUM(CASE WHEN is_published = 0 THEN 1 ELSE 0 END), 0) as draft
            ')
            ->first();

        $summary = [
            'total' => (int) $summaryRow->total,
            'published' => (int) $summaryRow->published,
            'draft' => (int) $summaryRow->draft,
        ];

        return Inertia::render('contents/client-companies/index', [
            'client_companies' => $clientCompanies,
            'summary' => $summary,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'published' => $published,
            ],
        ]);
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('logo')) {
            $fileData = FileHelper::uploadToR2Public(
                $request->file('logo'),
                'content/client-companies',
            );
            $validated['logo'] = $fileData['path'];
        }

        if (! array_key_exists('is_published', $validated)) {
            $validated['is_published'] = true;
        }

        ClientCompany::create($validated);

        return back()->with('success', 'Perusahaan klien berhasil ditambahkan.');
    }

    public function update(UpdateRequest $request, ClientCompany $clientCompany)
    {
        $validated = $request->validated();

        if ($request->boolean('remove_logo') && $clientCompany->logo) {
            FileHelper::deleteFromR2($clientCompany->logo);
            $validated['logo'] = null;
        }

        if ($request->hasFile('logo')) {
            if ($clientCompany->logo) {
                FileHelper::deleteFromR2($clientCompany->logo);
            }
            $fileData = FileHelper::uploadToR2Public(
                $request->file('logo'),
                'content/client-companies',
            );
            $validated['logo'] = $fileData['path'];
        }

        $clientCompany->update($validated);

        return back()->with('success', 'Perusahaan klien berhasil diperbarui.');
    }

    public function destroy(ClientCompany $clientCompany)
    {
        if ($clientCompany->logo) {
            FileHelper::deleteFromR2($clientCompany->logo);
        }

        $clientCompany->delete();

        return back()->with('success', 'Perusahaan klien berhasil dihapus.');
    }
}
