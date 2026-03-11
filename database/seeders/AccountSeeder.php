<?php

namespace Database\Seeders;

use App\Models\Account;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            // Asset
            [
                'code'           => '1-001',
                'name'           => 'Kas',
                'type'           => 'asset',
                'category'       => 'cash',
                'normal_balance' => 'debit',
                'is_system'      => true,
                'status'         => 'active',
            ],
            [
                'code'           => '1-002',
                'name'           => 'Bank',
                'type'           => 'asset',
                'category'       => 'bank',
                'normal_balance' => 'debit',
                'is_system'      => true,
                'status'         => 'active',
            ],
            [
                'code'           => '1-003',
                'name'           => 'Piutang Usaha',
                'type'           => 'asset',
                'category'       => 'receivable',
                'normal_balance' => 'debit',
                'is_system'      => true,
                'status'         => 'active',
            ],
            [
                'code'           => '1-004',
                'name'           => 'Piutang Reimbursement',
                'type'           => 'asset',
                'category'       => 'reimbursement',
                'normal_balance' => 'debit',
                'is_system'      => true,
                'status'         => 'active',
            ],

            // Liability
            [
                'code'           => '2-001',
                'name'           => 'Hutang Pajak',
                'type'           => 'liability',
                'category'       => 'tax',
                'normal_balance' => 'credit',
                'is_system'      => true,
                'status'         => 'active',
            ],
            [
                'code'           => '2-002',
                'name'           => 'Hutang Usaha',
                'type'           => 'liability',
                'category'       => 'payable',
                'normal_balance' => 'credit',
                'is_system'      => false,
                'status'         => 'active',
            ],

            // Equity
            [
                'code'           => '3-001',
                'name'           => 'Modal',
                'type'           => 'equity',
                'category'       => 'equity',
                'normal_balance' => 'credit',
                'is_system'      => true,
                'status'         => 'active',
            ],
            [
                'code'           => '3-002',
                'name'           => 'Laba Ditahan',
                'type'           => 'equity',
                'category'       => 'equity',
                'normal_balance' => 'credit',
                'is_system'      => false,
                'status'         => 'active',
            ],

            // Revenue
            [
                'code'           => '4-001',
                'name'           => 'Pendapatan Jasa',
                'type'           => 'revenue',
                'category'       => 'revenue',
                'normal_balance' => 'credit',
                'is_system'      => true,
                'status'         => 'active',
            ],

            // Expense
            [
                'code'           => '5-001',
                'name'           => 'Beban Operasional',
                'type'           => 'expense',
                'category'       => 'expense',
                'normal_balance' => 'debit',
                'is_system'      => true,
                'status'         => 'active',
            ],
        ];

        foreach ($accounts as $account) {
            Account::firstOrCreate(
                ['code' => $account['code']],
                $account
            );
        }
    }
}
