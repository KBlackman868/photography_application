<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('studio_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['wedding', 'portrait', 'event', 'commercial', 'newborn', 'engagement', 'other'])->default('portrait');
            $table->enum('status', ['inquiry', 'booked', 'in_progress', 'delivered', 'completed', 'archived'])->default('inquiry');
            $table->date('shoot_date')->nullable();
            $table->string('location')->nullable();
            $table->json('metadata')->nullable(); // additional project details
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
