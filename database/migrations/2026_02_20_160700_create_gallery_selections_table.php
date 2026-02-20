<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gallery_selections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gallery_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // who submitted
            $table->enum('status', ['draft', 'submitted', 'approved', 'revision_requested'])->default('draft');
            $table->boolean('is_locked')->default(false);
            $table->text('notes')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['gallery_id', 'user_id']);
        });

        // Pivot table for which photos are in a selection
        Schema::create('gallery_selection_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gallery_selection_id')->constrained()->cascadeOnDelete();
            $table->foreignId('photo_id')->constrained()->cascadeOnDelete();
            $table->text('retouching_notes')->nullable();
            $table->string('color_label_override')->nullable();
            $table->timestamps();

            $table->unique(['gallery_selection_id', 'photo_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_selection_photos');
        Schema::dropIfExists('gallery_selections');
    }
};
