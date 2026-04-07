<?php

namespace App\Services;

use App\Models\Project;

class CompanyFinanceAggregator
{
    /**
     * Agregasi keuangan untuk semua project milik satu perusahaan.
     */
    public function summarize(int $companyId): array
    {
        $ids = Project::query()
            ->where('company_id', $companyId)
            ->pluck('id')
            ->all();

        return app(ProjectFinanceAggregator::class)->summarizeForProjectIds($ids);
    }
}
