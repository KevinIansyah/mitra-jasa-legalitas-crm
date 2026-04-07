<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Project;
use App\Models\ProjectInvoice;

/**
 * Agregasi keuangan untuk sekumpulan project (logika mengikuti accessor Project).
 */
class ProjectFinanceAggregator
{
    private const CONTRACT_TYPES = ['dp', 'progress', 'final'];

    private const ACTIVE_STATUSES = ['sent', 'paid', 'overdue'];

    /**
     * @param  array<int>  $projectIds
     */
    public function summarizeForProjectIds(array $projectIds): array
    {
        if ($projectIds === []) {
            return $this->emptySummary();
        }

        $ids = array_values($projectIds);

        $totalBudget = (float) Project::query()->whereIn('id', $ids)->sum('budget');

        $totalContractInvoiced = $this->sumInvoiceSubtotal($ids, function ($q) {
            $q->whereIn('type', self::CONTRACT_TYPES)->whereIn('status', self::ACTIVE_STATUSES);
        });

        $totalContractInvoicedWithTax = $this->sumInvoiceTotalAmount($ids, function ($q) {
            $q->whereIn('type', self::CONTRACT_TYPES)->whereIn('status', self::ACTIVE_STATUSES);
        });

        $totalContractPaid = $this->sumInvoiceSubtotal($ids, function ($q) {
            $q->whereIn('type', self::CONTRACT_TYPES)->where('status', 'paid');
        });

        $totalContractPaidWithTax = $this->sumInvoiceTotalAmount($ids, function ($q) {
            $q->whereIn('type', self::CONTRACT_TYPES)->where('status', 'paid');
        });

        $totalAdditionalInvoiced = $this->sumInvoiceSubtotal($ids, function ($q) {
            $q->where('type', 'additional')->whereIn('status', self::ACTIVE_STATUSES);
        });

        $totalAdditionalInvoicedWithTax = $this->sumInvoiceTotalAmount($ids, function ($q) {
            $q->where('type', 'additional')->whereIn('status', self::ACTIVE_STATUSES);
        });

        $totalAdditionalPaid = $this->sumInvoiceSubtotal($ids, function ($q) {
            $q->where('type', 'additional')->where('status', 'paid');
        });

        $totalAdditionalPaidWithTax = $this->sumInvoiceTotalAmount($ids, function ($q) {
            $q->where('type', 'additional')->where('status', 'paid');
        });

        $totalExpenses = (float) Expense::query()->whereIn('project_id', $ids)->sum('amount');
        $totalBillableExpenses = (float) Expense::query()->whereIn('project_id', $ids)->where('is_billable', true)->sum('amount');

        $totalInvoiced = $totalContractInvoiced + $totalAdditionalInvoiced;
        $totalInvoicedWithTax = $totalContractInvoicedWithTax + $totalAdditionalInvoicedWithTax;
        $totalPaid = $totalContractPaid + $totalAdditionalPaid;
        $totalPaidWithTax = $totalContractPaidWithTax + $totalAdditionalPaidWithTax;
        $outstandingAmount = $totalInvoicedWithTax - $totalPaidWithTax;
        $remainingBill = $totalBudget - $totalContractPaid;
        $nonBillableExpenses = $totalExpenses - $totalBillableExpenses;

        return [
            'projects_count' => count($ids),
            'total_budget' => $totalBudget,
            'total_contract_invoiced' => $totalContractInvoiced,
            'total_contract_invoiced_with_tax' => $totalContractInvoicedWithTax,
            'total_contract_paid' => $totalContractPaid,
            'total_contract_paid_with_tax' => $totalContractPaidWithTax,
            'total_additional_invoiced' => $totalAdditionalInvoiced,
            'total_additional_invoiced_with_tax' => $totalAdditionalInvoicedWithTax,
            'total_additional_paid' => $totalAdditionalPaid,
            'total_additional_paid_with_tax' => $totalAdditionalPaidWithTax,
            'total_invoiced' => $totalInvoiced,
            'total_invoiced_with_tax' => $totalInvoicedWithTax,
            'total_paid' => $totalPaid,
            'total_paid_with_tax' => $totalPaidWithTax,
            'outstanding_amount' => $outstandingAmount,
            'remaining_bill' => $remainingBill,
            'total_expenses' => $totalExpenses,
            'total_billable_expenses' => $totalBillableExpenses,
            'non_billable_expenses' => $nonBillableExpenses,
            'contract_profit' => $totalBudget,
            'actual_profit' => $totalPaid - $totalExpenses,
        ];
    }

    private function emptySummary(): array
    {
        return [
            'projects_count' => 0,
            'total_budget' => 0.0,
            'total_contract_invoiced' => 0.0,
            'total_contract_invoiced_with_tax' => 0.0,
            'total_contract_paid' => 0.0,
            'total_contract_paid_with_tax' => 0.0,
            'total_additional_invoiced' => 0.0,
            'total_additional_invoiced_with_tax' => 0.0,
            'total_additional_paid' => 0.0,
            'total_additional_paid_with_tax' => 0.0,
            'total_invoiced' => 0.0,
            'total_invoiced_with_tax' => 0.0,
            'total_paid' => 0.0,
            'total_paid_with_tax' => 0.0,
            'outstanding_amount' => 0.0,
            'remaining_bill' => 0.0,
            'total_expenses' => 0.0,
            'total_billable_expenses' => 0.0,
            'non_billable_expenses' => 0.0,
            'contract_profit' => 0.0,
            'actual_profit' => 0.0,
        ];
    }

    /**
     * @param  callable(\Illuminate\Database\Eloquent\Builder<ProjectInvoice>):void  $constraint
     */
    private function sumInvoiceSubtotal(array $projectIds, callable $constraint): float
    {
        $q = ProjectInvoice::query()->whereIn('project_id', $projectIds);
        $constraint($q);

        return (float) $q->sum('subtotal');
    }

    /**
     * @param  callable(\Illuminate\Database\Eloquent\Builder<ProjectInvoice>):void  $constraint
     */
    private function sumInvoiceTotalAmount(array $projectIds, callable $constraint): float
    {
        $q = ProjectInvoice::query()->whereIn('project_id', $projectIds);
        $constraint($q);

        return (float) $q->sum('total_amount');
    }
}
