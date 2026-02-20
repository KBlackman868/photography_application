<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('galleries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('studio_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('cover_photo_path')->nullable();
            $table->enum('status', ['draft', 'published', 'review', 'approved', 'archived'])->default('draft');
            $table->boolean('is_public')->default(false); // for portfolio pages
            $table->string('password')->nullable(); // optional password protection
            $table->string('share_token')->nullable()->unique(); // for share links
            $table->boolean('allow_downloads')->default(false);
            $table->boolean('allow_favorites')->default(true);
            $table->boolean('allow_comments')->default(true);
            $table->integer('selection_limit')->nullable(); // max selections allowed
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->json('watermark_settings')->nullable(); // override studio defaults
            $table->integer('photo_count')->default(0); // cached count
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('galleries');
    }
};
