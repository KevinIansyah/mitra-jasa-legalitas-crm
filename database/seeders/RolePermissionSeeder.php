<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

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
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        $roleAdmin = Role::create(['name' => 'super-admin']);
        $roleAdmin->givePermissionTo(Permission::all());

        $roleEditor = Role::create(['name' => 'staff']);
        $roleEditor->givePermissionTo(['view-contact-companies', 'create-contact-companies', 'edit-contact-companies', 'delete-contact-companies']);

        $roleUser = Role::create(['name' => 'user']);
    }
}
