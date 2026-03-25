<?php

namespace App\Http\Controllers\Settings;

use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateAnalyticsRequest;
use App\Http\Requests\Settings\UpdateBankRequest;
use App\Http\Requests\Settings\UpdateChatbotRequest;
use App\Http\Requests\Settings\UpdateCompanyRequest;
use App\Http\Requests\Settings\UpdateDocumentRequest;
use App\Http\Requests\Settings\UpdateLegalRequest;
use App\Http\Requests\Settings\UpdateMaintenanceRequest;
use App\Http\Requests\Settings\UpdateMetaRequest;
use App\Http\Requests\Settings\UpdateOperationalRequest;
use App\Http\Requests\Settings\UpdateOrganizationRequest;
use App\Http\Requests\Settings\UpdateSignerRequest;
use App\Http\Requests\Settings\UpdateSocialRequest;
use App\Http\Requests\Settings\UpdateStatsRequest;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class SiteController extends Controller
{
    public function company()
    {
        return Inertia::render('settings/sites/company', [
            'settings' => SiteSetting::get(),
        ]);
    }

    public function operational()
    {
        return Inertia::render('settings/sites/operational', [
            'settings' => SiteSetting::get(),
        ]);
    }

    public function meta()
    {
        return Inertia::render('settings/sites/meta', [
            'settings' => SiteSetting::get(),
        ]);
    }

    public function organization()
    {
        return Inertia::render('settings/sites/organization', [
            'settings' => SiteSetting::get(),
        ]);
    }

    public function stats()
    {
        return Inertia::render('settings/sites/stats', [
            'settings' => SiteSetting::get(),
        ]);
    }

    public function legal()
    {
        return Inertia::render('settings/sites/legal', [
            'settings' => SiteSetting::get(),
        ]);
    }

    public function bank()
    {
        return Inertia::render('settings/sites/bank', [
            'settings' => SiteSetting::get(),
        ]);
    }

    public function signer()
    {
        return Inertia::render('settings/sites/signer', [
            'settings' => SiteSetting::get(),
        ]);
    }

    public function document()
    {
        return Inertia::render('settings/sites/document', [
            'settings' => SiteSetting::get(),
        ]);
    }

    public function analytics()
    {
        return Inertia::render('settings/sites/analytics', [
            'settings' => SiteSetting::get(),
        ]);
    }

    public function social()
    {
        return Inertia::render('settings/sites/social', [
            'settings' => SiteSetting::get(),
        ]);
    }

    public function maintenance()
    {
        return Inertia::render('settings/sites/maintenance', [
            'settings' => SiteSetting::get(),
        ]);
    }

    public function chatbot()
    {
        return Inertia::render('settings/sites/chatbot', [
            'settings' => SiteSetting::get(),
        ]);
    }

    public function updateCompany(UpdateCompanyRequest $request)
    {
        $settings = SiteSetting::get();
        $validated = $request->validated();

        if ($request->boolean('remove_logo') && $settings->company_logo) {
            FileHelper::deleteFromR2($settings->company_logo, isPublic: true);
            $validated['company_logo'] = null;
        }

        if ($request->hasFile('company_logo')) {
            if ($settings->company_logo) {
                FileHelper::deleteFromR2($settings->company_logo, isPublic: true);
            }
            $file = FileHelper::uploadToR2Public($request->file('company_logo'), 'settings');
            $validated['company_logo'] = $file['path'];
        }

        if ($request->boolean('remove_favicon') && $settings->company_favicon) {
            FileHelper::deleteFromR2($settings->company_favicon, isPublic: true);
            $validated['company_favicon'] = null;
        }

        if ($request->hasFile('company_favicon')) {
            if ($settings->company_favicon) {
                FileHelper::deleteFromR2($settings->company_favicon, isPublic: true);
            }
            $file = FileHelper::uploadToR2Public($request->file('company_favicon'), 'settings');
            $validated['company_favicon'] = $file['path'];
        }

        $settings->update($validated);

        return back()->with('success', 'Identitas perusahaan berhasil diperbarui.');
    }

    public function updateOperational(UpdateOperationalRequest $request)
    {
        SiteSetting::get()->update($request->validated());

        return back()->with('success', 'Informasi operasional berhasil diperbarui.');
    }

    public function updateMeta(UpdateMetaRequest $request)
    {
        $settings = SiteSetting::get();
        $validated = $request->validated();

        if ($request->boolean('remove_og_image') && $settings->default_og_image) {
            FileHelper::deleteFromR2($settings->default_og_image, isPublic: true);
            $validated['default_og_image'] = null;
        }

        if ($request->hasFile('default_og_image')) {
            if ($settings->default_og_image) {
                FileHelper::deleteFromR2($settings->default_og_image, isPublic: true);
            }
            $file = FileHelper::uploadToR2Public($request->file('default_og_image'), 'settings');
            $validated['default_og_image'] = $file['path'];
        }

        $settings->update($validated);

        return back()->with('success', 'Default meta tags berhasil diperbarui.');
    }

    public function updateOrganization(UpdateOrganizationRequest $request)
    {
        SiteSetting::get()->update($request->validated());

        return back()->with('success', 'Konfigurasi Schema.org berhasil diperbarui.');
    }

    public function updateStats(UpdateStatsRequest $request)
    {
        SiteSetting::get()->update($request->validated());

        return back()->with('success', 'Statistik berhasil diperbarui.');
    }

    public function updateLegal(UpdateLegalRequest $request)
    {
        SiteSetting::get()->update($request->validated());

        return back()->with('success', 'Informasi legal berhasil diperbarui.');
    }

    public function updateBank(UpdateBankRequest $request)
    {
        SiteSetting::get()->update($request->validated());

        return back()->with('success', 'Informasi bank berhasil diperbarui.');
    }

    public function updateSigner(UpdateSignerRequest $request)
    {
        $settings = SiteSetting::get();
        $validated = $request->validated();

        foreach (['signature_image', 'stamp_image'] as $field) {
            if ($request->boolean("remove_{$field}") && $settings->$field) {
                FileHelper::deleteFromR2($settings->$field, isPublic: true);
                $validated[$field] = null;
            }

            if ($request->hasFile($field)) {
                if ($settings->$field) {
                    FileHelper::deleteFromR2($settings->$field, isPublic: true);
                }
                $file = FileHelper::uploadToR2Public($request->file($field), 'settings/signatures');
                $validated[$field] = $file['path'];
            }
        }

        $settings->update($validated);

        return back()->with('success', 'Tanda tangan & stempel berhasil diperbarui.');
    }

    public function updateDocument(UpdateDocumentRequest $request)
    {
        SiteSetting::get()->update($request->validated());

        return back()->with('success', 'Kustomisasi dokumen berhasil diperbarui.');
    }

    public function updateAnalytics(UpdateAnalyticsRequest $request)
    {
        SiteSetting::get()->update($request->validated());

        return back()->with('success', 'Analytics & tracking berhasil diperbarui.');
    }

    public function updateSocial(UpdateSocialRequest $request)
    {
        SiteSetting::get()->update($request->validated());

        return back()->with('success', 'Social media berhasil diperbarui.');
    }

    public function updateMaintenance(UpdateMaintenanceRequest $request)
    {
        SiteSetting::get()->update($request->validated());

        return back()->with('success', 'Mode maintenance berhasil diperbarui.');
    }

    public function updateChatbot(UpdateChatbotRequest $request)
    {
        SiteSetting::get()->update($request->validated());

        Cache::forget('chatbot_system_prompt');

        return back()->with('success', 'Pengaturan chatbot berhasil diperbarui.');
    }
}
