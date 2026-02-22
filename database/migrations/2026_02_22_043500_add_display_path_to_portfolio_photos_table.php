<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('portfolio_photos', function (Blueprint $table) {
            $table->string('display_path')->nullable()->after('photo_path');
        });
    }

    public function down(): void
    {
        Schema::table('portfolio_photos', function (Blueprint $table) {
            $table->dropColumn('display_path');
        });
    }
};
