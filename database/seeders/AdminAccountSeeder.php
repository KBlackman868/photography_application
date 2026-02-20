<?php

namespace Database\Seeders;

use App\Models\Studio;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminAccountSeeder extends Seeder
{
    public function run(): void
    {
        $studio = Studio::first();

        if (!$studio) {
            $this->command->error('No studio found. Run DatabaseSeeder first.');
            return;
        }

        $user = User::updateOrCreate(
            ['email' => 'kjrblackman@gmail.com'],
            [
                'name' => 'Kyle Blackman',
                'password' => bcrypt('Ebenezer@2026'),
                'studio_id' => $studio->id,
                'role' => 'admin',
                'phone' => '(805) 555-0142',
                'bio' => 'Professional photographer specializing in family, wedding, and portrait photography.',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $user->assignRole('admin');

        echo "Admin account created/updated!\n";
        echo "Login: kjrblackman@gmail.com / Ebenezer@2026\n";
    }
}
