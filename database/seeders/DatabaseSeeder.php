<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\ClientProfile;
use App\Models\Contract;
use App\Models\Gallery;
use App\Models\GallerySelection;
use App\Models\Invoice;
use App\Models\Package;
use App\Models\Photo;
use App\Models\PhotoComment;
use App\Models\PhotoFavorite;
use App\Models\Portfolio;
use App\Models\PortfolioPhoto;
use App\Models\Project;
use App\Models\Studio;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * DatabaseSeeder — Populates the app with realistic sample data so you can see
 * how everything looks and works right after installation.
 *
 * What gets created:
 *   - 1 studio (the photography business itself, with branding & settings)
 *   - 1 admin, 1 editor, and 5 client users
 *   - 4 service packages (Mini Session → Wedding Premium)
 *   - 4 projects with galleries full of placeholder photos
 *   - Client favorites, threaded comments, internal editor notes
 *   - Photo selections (clients picking their favorite shots)
 *   - 3 portfolios (Weddings, Portraits, Events) for the public site
 *   - 1 booking with a contract and invoice
 *   - Spatie roles & permissions for access control
 *
 * Run with: php artisan db:seed
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Generate a placeholder image locally using GD.
     * (Creates a colored rectangle with a dimensions label — stands in for real photos.)
     */
    private function generatePlaceholder(string $storagePath, int $width, int $height, int $seed): string
    {
        // Deterministic color from seed
        mt_srand($seed);
        $hue = mt_rand(0, 360);
        $sat = mt_rand(30, 70);
        $light = mt_rand(40, 65);
        [$r, $g, $b] = $this->hslToRgb($hue, $sat, $light);

        $img = imagecreatetruecolor($width, $height);
        $bg = imagecolorallocate($img, $r, $g, $b);
        imagefill($img, 0, 0, $bg);

        // Add a subtle gradient overlay
        for ($y = 0; $y < $height; $y++) {
            $alpha = (int) (80 * ($y / $height));
            $overlay = imagecolorallocatealpha($img, 0, 0, 0, 127 - $alpha);
            imageline($img, 0, $y, $width, $y, $overlay);
        }

        // Add text label
        $white = imagecolorallocate($img, 255, 255, 255);
        $text = "{$width}x{$height}";
        $fontSize = 4;
        $textWidth = imagefontwidth($fontSize) * strlen($text);
        $textHeight = imagefontheight($fontSize);
        imagestring($img, $fontSize, (int)(($width - $textWidth) / 2), (int)(($height - $textHeight) / 2), $text, $white);

        $fullDir = dirname($storagePath);
        Storage::disk('public')->makeDirectory($fullDir);

        $absolutePath = Storage::disk('public')->path($storagePath);
        imagejpeg($img, $absolutePath, 80);
        imagedestroy($img);

        return $storagePath;
    }

    private function hslToRgb(int $h, int $s, int $l): array
    {
        $s /= 100;
        $l /= 100;
        $c = (1 - abs(2 * $l - 1)) * $s;
        $x = $c * (1 - abs(fmod($h / 60, 2) - 1));
        $m = $l - $c / 2;

        if ($h < 60) { [$r, $g, $b] = [$c, $x, 0]; }
        elseif ($h < 120) { [$r, $g, $b] = [$x, $c, 0]; }
        elseif ($h < 180) { [$r, $g, $b] = [0, $c, $x]; }
        elseif ($h < 240) { [$r, $g, $b] = [0, $x, $c]; }
        elseif ($h < 300) { [$r, $g, $b] = [$x, 0, $c]; }
        else { [$r, $g, $b] = [$c, 0, $x]; }

        return [
            (int)(($r + $m) * 255),
            (int)(($g + $m) * 255),
            (int)(($b + $m) * 255),
        ];
    }

    /** The main seeder — creates everything the app needs to demo properly. */
    public function run(): void
    {
        // Start fresh — remove any old placeholder images from previous seeds
        Storage::disk('public')->deleteDirectory('galleries');
        Storage::disk('public')->deleteDirectory('portfolios');

        // Create the studio (your photography business)
        $studio = Studio::create([
            'name' => 'Kyle Blackman Photography',
            'slug' => 'kyle-blackman-photography',
            'description' => 'Capturing life\'s most precious moments with artistry and heart.',
            'email' => 'kyle@kyleblackmanphoto.com',
            'phone' => '(805) 555-0142',
            'website' => 'https://luminastudios.com',
            'timezone' => 'America/Los_Angeles',
            'branding' => [
                'primary_color' => '#197fe6',
                'secondary_color' => '#111921',
                'font' => 'Spline Sans',
            ],
            'watermark_settings' => [
                'position' => 'bottom-right',
                'opacity' => 30,
            ],
        ]);

        // Create the studio owner / main photographer — this is the primary admin account
        $admin = User::factory()->create([
            'name' => 'Kyle Blackman',
            'email' => 'kjrblackman@gmail.com',
            'password' => bcrypt('Ebenezer@2026'),
            'studio_id' => $studio->id,
            'role' => 'admin',
            'phone' => '(805) 555-0142',
            'bio' => 'Professional photographer specializing in family, wedding, and portrait photography.',
        ]);

        // Create a photo editor — a team member who helps with retouching and leaves internal notes
        $editor = User::factory()->create([
            'name' => 'Marcus Rivera',
            'email' => 'marcus@kyleblackmanphoto.com',
            'password' => bcrypt('password'),
            'studio_id' => $studio->id,
            'role' => 'editor',
            'bio' => 'Photo editor specializing in color grading and retouching.',
        ]);

        // Create five sample clients — each with a profile that stores their preferences and notes
        $clients = [];
        $clientData = [
            ['name' => 'Emily Miller', 'email' => 'emily@millers.com', 'company' => null, 'notes' => 'Prefers warm tones. Family of four - two kids under 10.'],
            ['name' => 'David & Jessica Park', 'email' => 'parks@email.com', 'company' => null, 'notes' => 'Wedding couple. Met at Stanford. Prefer natural/candid shots.'],
            ['name' => 'Amanda Torres', 'email' => 'amanda.torres@email.com', 'company' => 'Torres & Co Realty', 'notes' => 'Business headshots and property photos. Quick turnaround needed.'],
            ['name' => 'The Johnson Family', 'email' => 'johnsons@email.com', 'company' => null, 'notes' => 'Annual family portrait session. Grandparents join for holiday shoot.'],
            ['name' => 'Rachel Kim', 'email' => 'rachel.kim@email.com', 'company' => 'Bloom Wedding Planning', 'notes' => 'Wedding planner referral partner. Sends 5-6 clients per year.'],
        ];

        foreach ($clientData as $cd) {
            $client = User::factory()->create([
                'name' => $cd['name'],
                'email' => $cd['email'],
                'password' => bcrypt('password'),
                'studio_id' => $studio->id,
                'role' => 'client',
            ]);

            ClientProfile::create([
                'user_id' => $client->id,
                'studio_id' => $studio->id,
                'company' => $cd['company'],
                'notes' => $cd['notes'],
                'referral_source' => fake()->randomElement(['Instagram', 'Google', 'Referral', 'Wedding Wire', 'Word of Mouth']),
                'preferences' => ['edit_style' => fake()->randomElement(['warm', 'neutral', 'moody', 'bright_airy'])],
            ]);

            $clients[] = $client;
        }

        // Create service packages — these are the pricing tiers clients choose from when booking
        $packageData = [
            ['name' => 'Mini Session', 'price' => 350, 'type' => 'mini_session', 'description' => '20 minutes, 1 location, 15 edited images', 'includes' => ['minutes' => 20, 'locations' => 1, 'edited_images' => 15]],
            ['name' => 'Portrait Collection', 'price' => 750, 'type' => 'portrait', 'description' => '60 minutes, 2 locations, 40 edited images, online gallery', 'includes' => ['minutes' => 60, 'locations' => 2, 'edited_images' => 40, 'online_gallery' => true]],
            ['name' => 'Wedding Essential', 'price' => 3500, 'type' => 'wedding', 'description' => '8 hours coverage, 2 photographers, 500+ edited images, engagement session', 'includes' => ['hours' => 8, 'photographers' => 2, 'edited_images' => 500, 'engagement_session' => true]],
            ['name' => 'Wedding Premium', 'price' => 5500, 'type' => 'wedding', 'description' => '10 hours, 2 photographers, 800+ images, album, engagement session, rehearsal coverage', 'includes' => ['hours' => 10, 'photographers' => 2, 'edited_images' => 800, 'album' => true, 'engagement_session' => true, 'rehearsal' => true]],
        ];

        foreach ($packageData as $i => $pd) {
            Package::create([
                'studio_id' => $studio->id,
                'name' => $pd['name'],
                'description' => $pd['description'],
                'price' => $pd['price'],
                'type' => $pd['type'],
                'includes' => $pd['includes'],
                'sort_order' => $i,
            ]);
        }

        // Create sample projects — each represents a real photography job with its own gallery of photos
        $projectData = [
            [
                'name' => 'The Miller Family Session',
                'type' => 'portrait',
                'status' => 'delivered',
                'client' => $clients[0],
                'shoot_date' => '2023-10-14',
                'location' => 'Santa Barbara, CA',
                'gallery_name' => 'Miller Family - Fall 2023',
                'gallery_status' => 'review',
                'photo_count' => 42,
            ],
            [
                'name' => 'Park Wedding',
                'type' => 'wedding',
                'status' => 'in_progress',
                'client' => $clients[1],
                'shoot_date' => '2023-11-18',
                'location' => 'Ojai Valley Inn, CA',
                'gallery_name' => 'Park Wedding - Full Gallery',
                'gallery_status' => 'published',
                'photo_count' => 85,
            ],
            [
                'name' => 'Torres Headshots',
                'type' => 'commercial',
                'status' => 'completed',
                'client' => $clients[2],
                'shoot_date' => '2023-09-20',
                'location' => 'Studio',
                'gallery_name' => 'Torres & Co Team Headshots',
                'gallery_status' => 'approved',
                'photo_count' => 24,
            ],
            [
                'name' => 'Johnson Holiday Portraits',
                'type' => 'portrait',
                'status' => 'booked',
                'client' => $clients[3],
                'shoot_date' => '2023-12-10',
                'location' => 'Griffith Observatory, LA',
                'gallery_name' => 'Johnson Family Holiday 2023',
                'gallery_status' => 'draft',
                'photo_count' => 0,
            ],
        ];

        // Sample placeholder photos (using picsum for varied seed images)
        $sampleFilenames = [
            'IMG_0842.JPG', 'IMG_0843.JPG', 'IMG_0845.JPG', 'IMG_0850.JPG',
            'IMG_0862.JPG', 'IMG_0877.JPG', 'IMG_0881.JPG', 'IMG_0890.JPG',
            'IMG_0895.JPG', 'IMG_0901.JPG', 'IMG_0912.JPG', 'IMG_0918.JPG',
            'IMG_0925.JPG', 'IMG_0933.JPG', 'IMG_0941.JPG', 'IMG_0947.JPG',
            'IMG_0955.JPG', 'IMG_0962.JPG', 'IMG_0971.JPG', 'IMG_0980.JPG',
            'IMG_0988.JPG', 'IMG_0995.JPG', 'IMG_1002.JPG', 'IMG_1010.JPG',
            'IMG_1018.JPG', 'IMG_1025.JPG', 'IMG_1033.JPG', 'IMG_1041.JPG',
            'IMG_1050.JPG', 'IMG_1058.JPG', 'IMG_1065.JPG', 'IMG_1072.JPG',
            'IMG_1080.JPG', 'IMG_1088.JPG', 'IMG_1095.JPG', 'IMG_1103.JPG',
            'IMG_1110.JPG', 'IMG_1118.JPG', 'IMG_1125.JPG', 'IMG_1133.JPG',
            'IMG_1140.JPG', 'IMG_1148.JPG', 'IMG_1155.JPG', 'IMG_1163.JPG',
        ];

        $picsumSeedStart = 100;
        $colorLabels = [null, null, null, null, 'red', 'green', 'blue', 'yellow', 'purple'];
        $cameras = ['Canon EOS R5', 'Canon EOS R6', 'Sony A7IV', 'Nikon Z6 II'];
        $lenses = ['85mm f/1.4', '35mm f/1.8', '70-200mm f/2.8', '24-70mm f/2.8', '50mm f/1.2'];

        foreach ($projectData as $pd) {
            $project = Project::create([
                'studio_id' => $studio->id,
                'client_user_id' => $pd['client']->id,
                'name' => $pd['name'],
                'slug' => Str::slug($pd['name']).'-'.Str::random(6),
                'type' => $pd['type'],
                'status' => $pd['status'],
                'shoot_date' => $pd['shoot_date'],
                'location' => $pd['location'],
            ]);

            $gallery = Gallery::create([
                'project_id' => $project->id,
                'studio_id' => $studio->id,
                'name' => $pd['gallery_name'],
                'slug' => Str::slug($pd['gallery_name']).'-'.Str::random(6),
                'description' => "Photo gallery for {$pd['name']}. Select your favorites for final retouching and delivery.",
                'status' => $pd['gallery_status'],
                'allow_downloads' => $pd['gallery_status'] === 'approved',
                'allow_favorites' => true,
                'allow_comments' => true,
                'selection_limit' => $pd['photo_count'] > 0 ? (int) ($pd['photo_count'] * 0.6) : 50,
                'share_token' => Str::random(32),
                'published_at' => in_array($pd['gallery_status'], ['published', 'review', 'approved']) ? now() : null,
                'photo_count' => $pd['photo_count'],
            ]);

            // Create photos
            $photos = [];
            for ($i = 0; $i < $pd['photo_count']; $i++) {
                $filename = $sampleFilenames[$i % count($sampleFilenames)];
                $seed = $picsumSeedStart + ($gallery->id * 100) + $i;
                $baseName = pathinfo($filename, PATHINFO_FILENAME) . "_{$i}";
                $originalPath = $this->generatePlaceholder("galleries/{$gallery->id}/originals/{$baseName}.jpg", 1600, 1200, $seed);
                $previewPath = $this->generatePlaceholder("galleries/{$gallery->id}/previews/{$baseName}.jpg", 800, 600, $seed);
                $thumbPath = $this->generatePlaceholder("galleries/{$gallery->id}/thumbnails/{$baseName}.jpg", 400, 300, $seed);
                $photo = Photo::create([
                    'gallery_id' => $gallery->id,
                    'uploaded_by' => $admin->id,
                    'filename' => $filename,
                    'original_path' => $originalPath,
                    'preview_path' => $previewPath,
                    'thumb_path' => $thumbPath,
                    'mime_type' => 'image/jpeg',
                    'file_size' => fake()->numberBetween(2000000, 15000000),
                    'width' => fake()->randomElement([5472, 6720, 4032, 8256]),
                    'height' => fake()->randomElement([3648, 4480, 3024, 5504]),
                    'exif_data' => [
                        'camera' => fake()->randomElement($cameras),
                        'lens' => fake()->randomElement($lenses),
                        'aperture' => fake()->randomFloat(1, 1.4, 8.0),
                        'shutter_speed' => fake()->randomElement(['1/125', '1/250', '1/500', '1/1000', '1/60', '1/200']),
                        'iso' => fake()->randomElement([100, 200, 400, 800, 1600]),
                        'focal_length' => fake()->randomElement([35, 50, 85, 135, 200]),
                        'date_taken' => $pd['shoot_date'],
                    ],
                    'sort_order' => $i,
                    'rating' => fake()->optional(0.4)->numberBetween(3, 5),
                    'color_label' => fake()->randomElement($colorLabels),
                    'tags' => fake()->optional(0.3)->randomElements(
                        ['family', 'candid', 'portrait', 'landscape', 'detail', 'couple', 'kids', 'ceremony', 'reception', 'golden_hour'],
                        fake()->numberBetween(1, 3)
                    ),
                    'is_featured' => fake()->boolean(10),
                ]);
                $photos[] = $photo;
            }

            // Set cover photo for gallery from first photo
            if (count($photos) > 0) {
                $gallery->update([
                    'cover_photo_path' => $photos[0]->preview_path,
                ]);
            }

            // Add favorites (from client)
            if (count($photos) > 0) {
                $favCount = min((int) (count($photos) * 0.3), count($photos));
                $favPhotos = fake()->randomElements($photos, $favCount);
                foreach ($favPhotos as $fp) {
                    PhotoFavorite::create([
                        'photo_id' => $fp->id,
                        'user_id' => $pd['client']->id,
                    ]);
                    $fp->increment('favorites_count');
                }
            }

            // Add comments (mix of client and admin/editor)
            if (count($photos) > 0) {
                $commentedPhotos = fake()->randomElements($photos, min(8, count($photos)));
                $commentBodies = [
                    'Love this one! Can we brighten the shadows slightly?',
                    'This is beautiful. Can you crop a bit tighter?',
                    'Can we remove the trash can in the background?',
                    'Perfect expressions here! This is a definite keeper.',
                    'Could you warm up the tones a bit on this one?',
                    'The kids look so natural here. Great capture!',
                    'Can we try a black & white version of this?',
                    'Slight skin smoothing needed on the close-up.',
                    'This would be great for the album cover.',
                    'Can you straighten the horizon?',
                ];

                $internalNotes = [
                    'Need to fix the white balance - shot was a bit cool.',
                    'Clone out the power lines in post.',
                    'Client loves this one - prioritize for editing.',
                    'Apply the warm preset from the Torres set.',
                    'Bracket this with the next two frames for HDR merge.',
                ];

                $replyBodies = [
                    'Absolutely, I\'ll adjust that in the next round.',
                    'Great catch - I\'ll take care of it.',
                    'Done! Updated version will be in the next delivery.',
                    'Good idea, I\'ll include both versions.',
                    'Noted! Will prioritize this one.',
                ];

                foreach ($commentedPhotos as $ci => $cp) {
                    // Client comment
                    $comment = PhotoComment::create([
                        'photo_id' => $cp->id,
                        'user_id' => $pd['client']->id,
                        'body' => $commentBodies[$ci % count($commentBodies)],
                        'is_internal' => false,
                        'resolved_at' => fake()->boolean(40) ? now() : null,
                        'resolved_by' => fake()->boolean(40) ? $admin->id : null,
                    ]);

                    // Admin reply
                    if (fake()->boolean(60)) {
                        PhotoComment::create([
                            'photo_id' => $cp->id,
                            'user_id' => $admin->id,
                            'parent_id' => $comment->id,
                            'body' => $replyBodies[$ci % count($replyBodies)],
                            'is_internal' => false,
                        ]);
                    }

                    // Internal note from editor
                    if (fake()->boolean(30)) {
                        PhotoComment::create([
                            'photo_id' => $cp->id,
                            'user_id' => $editor->id,
                            'body' => $internalNotes[$ci % count($internalNotes)],
                            'is_internal' => true,
                        ]);
                    }

                    $cp->update(['comments_count' => $cp->comments()->count()]);
                }
            }

            // Create selection for the review gallery
            if ($pd['gallery_status'] === 'review' && count($photos) > 0) {
                $selection = GallerySelection::create([
                    'gallery_id' => $gallery->id,
                    'user_id' => $pd['client']->id,
                    'status' => 'draft',
                ]);

                $selectedPhotos = fake()->randomElements($photos, min(12, count($photos)));
                foreach ($selectedPhotos as $sp) {
                    $selection->photos()->attach($sp->id, [
                        'retouching_notes' => fake()->optional(0.3)->sentence(),
                    ]);
                }
            }
        }

        // Create public portfolios — these showcase the best work on the public website
        $portfolioData = [
            ['title' => 'Weddings', 'category' => 'wedding', 'description' => 'Timeless love stories captured with elegance and emotion.'],
            ['title' => 'Portraits', 'category' => 'portrait', 'description' => 'Authentic portraits that celebrate individuality and connection.'],
            ['title' => 'Events', 'category' => 'event', 'description' => 'Corporate events, galas, and celebrations documented with artistry.'],
        ];

        foreach ($portfolioData as $i => $ppd) {
            $portfolio = Portfolio::create([
                'studio_id' => $studio->id,
                'title' => $ppd['title'],
                'slug' => Str::slug($ppd['title']).'-'.Str::random(6),
                'description' => $ppd['description'],
                'category' => $ppd['category'],
                'is_published' => true,
                'sort_order' => $i,
            ]);

            // Add portfolio photos with local placeholder images
            for ($j = 0; $j < 6; $j++) {
                $seed = 500 + ($portfolio->id * 10) + $j;
                $photoPath = $this->generatePlaceholder("portfolios/{$portfolio->id}/photo_{$j}.jpg", 800, 600, $seed);
                PortfolioPhoto::create([
                    'portfolio_id' => $portfolio->id,
                    'photo_path' => $photoPath,
                    'caption' => fake()->optional(0.5)->sentence(4),
                    'sort_order' => $j,
                ]);
            }

            // Set cover photo for portfolio
            $firstPhoto = $portfolio->portfolioPhotos()->orderBy('sort_order')->first();
            if ($firstPhoto) {
                $portfolio->update(['cover_photo_path' => $firstPhoto->photo_path]);
            }
        }

        // Create a sample booking with a signed contract and paid invoice (to demonstrate the full workflow)
        $booking = Booking::create([
            'studio_id' => $studio->id,
            'project_id' => Project::first()->id,
            'client_user_id' => $clients[0]->id,
            'package_id' => Package::where('type', 'portrait')->first()->id,
            'status' => 'completed',
            'session_date' => '2023-10-14 10:00:00',
            'location' => 'Santa Barbara, CA',
            'total_amount' => 750,
            'deposit_amount' => 250,
            'confirmed_at' => now()->subDays(60),
        ]);

        Contract::create([
            'booking_id' => $booking->id,
            'title' => 'Portrait Photography Agreement',
            'content' => '<h1>Photography Service Agreement</h1><p>This agreement outlines the terms of the portrait photography session...</p>',
            'signer_name' => 'Emily Miller',
            'signed_at' => now()->subDays(55),
        ]);

        Invoice::create([
            'studio_id' => $studio->id,
            'booking_id' => $booking->id,
            'client_user_id' => $clients[0]->id,
            'invoice_number' => 'INV-2023-001',
            'status' => 'paid',
            'subtotal' => 750,
            'tax' => 61.88,
            'total' => 811.88,
            'amount_paid' => 811.88,
            'due_date' => '2023-10-01',
            'paid_at' => now()->subDays(50),
            'line_items' => [
                ['description' => 'Portrait Collection Package', 'amount' => 750],
            ],
        ]);

        // Set up the role-based permission system — admins can do everything, editors can manage photos, clients can view/comment
        $this->createRolesAndPermissions();

        echo "Seeded successfully!\n";
        echo "Admin login: kjrblackman@gmail.com / Ebenezer@2026\n";
        echo "Editor login: marcus@kyleblackmanphoto.com / password\n";
        echo "Client login: emily@millers.com / password\n";
    }

    /**
     * Set up Spatie roles and permissions.
     * This defines WHO can do WHAT in the application:
     *   - Admin: full access to everything
     *   - Editor: manage photos, comments, exports (but not clients or settings)
     *   - Client: view galleries, comment on photos, favorite, submit selections
     */
    private function createRolesAndPermissions(): void
    {
        $roles = ['admin', 'photographer', 'editor', 'client'];

        foreach ($roles as $role) {
            \Spatie\Permission\Models\Role::firstOrCreate(['name' => $role]);
        }

        $permissions = [
            'manage galleries', 'manage photos', 'manage clients', 'manage projects',
            'manage portfolios', 'manage settings', 'manage exports',
            'view galleries', 'comment on photos', 'favorite photos', 'submit selections',
            'resolve comments', 'approve selections',
        ];

        foreach ($permissions as $permission) {
            \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign permissions to roles
        $adminRole = \Spatie\Permission\Models\Role::findByName('admin');
        $adminRole->syncPermissions($permissions);

        $editorRole = \Spatie\Permission\Models\Role::findByName('editor');
        $editorRole->syncPermissions([
            'view galleries', 'manage photos', 'comment on photos', 'favorite photos',
            'resolve comments', 'manage exports',
        ]);

        $clientRole = \Spatie\Permission\Models\Role::findByName('client');
        $clientRole->syncPermissions([
            'view galleries', 'comment on photos', 'favorite photos', 'submit selections',
        ]);

        // Assign roles to users
        User::where('role', 'admin')->get()->each(fn ($u) => $u->assignRole('admin'));
        User::where('role', 'editor')->get()->each(fn ($u) => $u->assignRole('editor'));
        User::where('role', 'client')->get()->each(fn ($u) => $u->assignRole('client'));
    }
}
