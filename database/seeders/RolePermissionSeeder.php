<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Permission::query()->delete();

        $permissions = [
            'view-roles',
            'create-roles',
            'edit-roles',
            'delete-roles',
            'edit-permissions',

            'view-contact-companies',
            'create-contact-companies',
            'edit-contact-companies',
            'delete-contact-companies',

            'view-contact-customers',
            'create-contact-customers',
            'edit-contact-customers',
            'delete-contact-customers',

            'view-services',
            'create-services',
            'edit-services',
            'delete-services',

            'view-service-city-pages',
            'create-service-city-pages',
            'edit-service-city-pages',
            'delete-service-city-pages',

            'view-service-categories',
            'create-service-categories',
            'edit-service-categories',
            'delete-service-categories',

            'view-projects',
            'create-projects',
            'edit-projects',
            'delete-projects',

            'view-project-templates',
            'create-project-templates',
            'edit-project-templates',
            'delete-project-templates',

            'view-project-members',
            'create-project-members',
            'edit-project-members',
            'delete-project-members',

            'view-project-tasks',
            'create-project-tasks',
            'edit-project-tasks',
            'delete-project-tasks',

            'view-project-milestones',
            'create-project-milestones',
            'edit-project-milestones',
            'delete-project-milestones',

            'view-project-documents',
            'create-project-documents',
            'edit-project-documents',
            'delete-project-documents',

            'view-project-deliverables',
            'create-project-deliverables',
            'edit-project-deliverables',
            'delete-project-deliverables',

            'view-project-discussions',
            'create-project-discussions',
            'edit-project-discussions',
            'delete-project-discussions',

            'view-staff',
            'create-staff',
            'edit-staff',
            'delete-staff',

            'view-staff-my-task',

            'view-staff-my-project',

            'view-finance-quotes',
            'edit-finance-quotes',
            'delete-finance-quotes',

            'view-finance-proposals',
            'create-finance-proposals',
            'edit-finance-proposals',
            'delete-finance-proposals',

            'view-finance-estimates',
            'create-finance-estimates',
            'edit-finance-estimates',
            'delete-finance-estimates',

            'view-finance-invoices',
            'create-finance-invoices',
            'edit-finance-invoices',
            'delete-finance-invoices',

            'view-finance-payments',
            'create-finance-payments',
            'edit-finance-payments',
            'delete-finance-payments',

            'view-finance-expenses',
            'create-finance-expenses',
            'edit-finance-expenses',
            'delete-finance-expenses',

            'view-finance-vendors',
            'create-finance-vendors',
            'edit-finance-vendors',
            'delete-finance-vendors',

            'view-finance-accounts',
            'create-finance-accounts',
            'edit-finance-accounts',
            'delete-finance-accounts',

            'view-finance-opening-balances',
            'create-finance-opening-balances',
            'edit-finance-opening-balances',

            'view-finance-journals',
            'create-finance-journals',
            'edit-finance-journals',
            'delete-finance-journals',

            'view-finance-reports',

            'view-master-cities',
            'create-master-cities',
            'edit-master-cities',
            'delete-master-cities',

            'view-site-settings',
            'edit-site-settings',

            'create-ai-generate',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name'       => $permission,
                'guard_name' => 'web',
            ]);
        }

        $roleAdmin = Role::firstOrCreate([
            'name'       => 'super-admin',
            'guard_name' => 'web',
        ]);

        $roleAdmin->syncPermissions(Permission::all());

        $roleStaff = Role::firstOrCreate([
            'name'       => 'staff',
            'guard_name' => 'web',
        ]);

        $roleStaff->syncPermissions([
            'view-contact-companies',
            'create-contact-companies',
            'edit-contact-companies',
            'delete-contact-companies',
        ]);

        Role::firstOrCreate([
            'name'       => 'user',
            'guard_name' => 'web',
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
