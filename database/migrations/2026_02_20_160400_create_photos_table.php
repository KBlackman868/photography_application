<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gallery_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('filename');
            $table->string('original_path');
            $table->string('preview_path')->nullable();
            $table->string('thumb_path')->nullable();
            $table->string('watermarked_path')->nullable();
            $table->string('mime_type')->default('image/jpeg');
            $table->unsignedBigInteger('file_size')->default(0);
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->json('exif_data')->nullable(); // camera, lens, aperture, shutter, iso, focal_length
            $table->integer('sort_order')->default(0);
            $table->unsignedTinyInteger('rating')->nullable(); // 1-5 star rating
            $table->string('color_label')->nullable(); // red, green, blue, yellow, purple
            $table->json('tags')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_hidden')->default(false);
            $table->integer('favorites_count')->default(0); // cached
            $table->integer('comments_count')->default(0); // cached
            $table->timestamps();
            $table->softDeletes();

            $table->index(['gallery_id', 'sort_order']);
            $table->index(['gallery_id', 'color_label']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('photos');
    }
};
