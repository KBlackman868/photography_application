<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('studios', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('website')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->json('branding')->nullable(); // primary_color, secondary_color, font, etc.
            $table->json('watermark_settings')->nullable(); // path, position, opacity
            $table->json('payment_settings')->nullable(); // stripe_key, paypal, etc.
            $table->string('timezone')->default('UTC');
            $table->timestamps();
            $table->softDeletes();
        });

        // Add studio_id to users table
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('studio_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->string('phone')->nullable()->after('email');
            $table->string('avatar_path')->nullable()->after('phone');
            $table->enum('role', ['admin', 'photographer', 'editor', 'client'])->default('client')->after('avatar_path');
            $table->text('bio')->nullable()->after('role');
            $table->boolean('is_active')->default(true)->after('bio');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['studio_id']);
            $table->dropColumn(['studio_id', 'phone', 'avatar_path', 'role', 'bio', 'is_active']);
        });
        Schema::dropIfExists('studios');
    }
};
