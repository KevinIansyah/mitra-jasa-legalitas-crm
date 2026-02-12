<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $kevin = User::create([
            'name' => 'Kevin Iansyah',
            'email' => 'keviniansyah04@gmail.com',
            'password' => Hash::make('yayanpoe123'),
        ]);
        $kevin->assignRole('super-admin');

        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
            'password' => Hash::make('superadmin123*'),
        ]);
        $superAdmin->assignRole('super-admin');

        $staff = User::create([
            'name' => 'Staff',
            'email' => 'staff@example.com',
            'password' => Hash::make('staff123*'),
        ]);
        $staff->assignRole('staff');
    }
}
