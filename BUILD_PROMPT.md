# Reusable Application Build Prompt

> **How to use this prompt:** Copy everything below the line into your AI assistant.
> Replace every instance of `[BUSINESS_TYPE]`, `[BUSINESS_NAME]`, `[OWNER_NAME]`, and
> the sample data sections with your own values. The architecture, features, and
> tech stack remain identical — only the *purpose* changes.

---

## THE PROMPT

You are building a **full-stack client portal and public-facing website** for a
**[BUSINESS_TYPE]** business called **[BUSINESS_NAME]**, owned by **[OWNER_NAME]**.

The application has TWO audiences:
1. **The public** — visitors who land on the website, browse work, book sessions, and check booking status.
2. **The admin/owner** — who manages everything from a private dashboard behind a login.

---

### TECH STACK (do not change)

| Layer | Technology |
|-------|-----------|
| Backend framework | **Laravel 12** (PHP 8.3) |
| Frontend framework | **React 18** with **TypeScript** via **Inertia.js v2** (server-driven SPA — no separate API) |
| CSS | **Tailwind CSS 3** with dark-mode support (`dark:` classes) |
| Build tool | **Vite** via `laravel-vite-plugin` |
| Database | **SQLite** for dev (MySQL/Postgres ready) |
| Auth scaffolding | **Laravel Breeze** (Inertia + React + TypeScript stack) |
| Image processing | **Spatie Media Library v11** for media collections & conversions + **Intervention Image v3** as a fallback service |
| Permissions | **Spatie Laravel Permission v7** (roles: admin, editor, client) |
| Activity logging | **Spatie Activity Log v4** (tracks changes on key models) |
| API tokens | **Laravel Sanctum v4** |
| Route helpers | **Ziggy v2** (exposes Laravel named routes to JS) |
| Charts | **Recharts** (React charting library for the dashboard) |
| Icons | **Lucide React** + **Google Material Symbols** (via CDN) + **Heroicons React** |
| UI utilities | **Headless UI React** (for accessible dropdowns/modals) |

### PHP Packages (composer.json require)
```
inertiajs/inertia-laravel ^2.0
intervention/image ^3.11
intervention/image-laravel ^1.5
laravel/framework ^12.0
laravel/sanctum ^4.0
laravel/tinker ^2.10
spatie/laravel-activitylog ^4.11
spatie/laravel-medialibrary ^11.21
spatie/laravel-permission ^7.2
tightenco/ziggy ^2.0
```

### JS Packages (package.json)
```
devDependencies:
  @headlessui/react, @inertiajs/react, @tailwindcss/forms, @tailwindcss/vite,
  @types/node, @types/react, @types/react-dom, @vitejs/plugin-react,
  autoprefixer, axios, concurrently, laravel-vite-plugin, postcss,
  react, react-dom, tailwindcss, typescript, vite

dependencies:
  @heroicons/react, lucide-react, react-is, recharts
```

---

### DATABASE SCHEMA — 17 tables + Laravel defaults

Build these tables via Laravel migrations. Every model that stores important data
should use `SoftDeletes`. Use JSON columns for flexible data (`metadata`,
`preferences`, `includes`, `line_items`, etc.).

#### 1. `studios` — The [BUSINESS_TYPE] business itself
- id, name, slug, description, logo_path, photographer_photo_path, website, email, phone
- branding (JSON — primary_color, secondary_color, font)
- watermark_settings (JSON — position, opacity)
- payment_settings (JSON)
- hero_images (JSON array of file paths)
- social_links (JSON — instagram, facebook, etc.)
- availability_hours (JSON — per-day open/close times)
- timezone
- SoftDeletes, timestamps

#### 2. `users` — Admins, editors, AND clients share one table
- id, name, email, password, studio_id (FK), phone, avatar_path, role (admin|editor|client), bio, is_active (boolean)
- email_verified_at, remember_token, timestamps

#### 3. `client_profiles` — Extra info for client-role users
- id, user_id (FK), studio_id (FK), company, address, city, state, zip, country, notes, referral_source, preferences (JSON)
- timestamps

#### 4. `projects` — Groups of work for a client (e.g. "The Smith Wedding", "Torres Headshots")
- id, studio_id (FK), client_user_id (FK → users), name, slug, description, type (enum: wedding, portrait, event, commercial, newborn, engagement, other), status (enum: inquiry, booked, in_progress, delivered, completed, archived)
- shoot_date, location, metadata (JSON)
- SoftDeletes, timestamps

#### 5. `galleries` — Collections of photos within a project
- id, project_id (FK), studio_id (FK), name, slug, description, cover_photo_path, status (draft|published|review|approved|archived)
- is_public (bool), password (hidden), share_token, allow_downloads (bool), allow_favorites (bool), allow_comments (bool), selection_limit (int), expires_at, published_at
- watermark_settings (JSON), photo_count (int)
- SoftDeletes, timestamps

#### 6. `photos` — Individual images inside a gallery
- id, gallery_id (FK), uploaded_by (FK → users), filename, original_path, preview_path, thumb_path, watermarked_path
- mime_type, file_size, width, height, exif_data (JSON), sort_order, rating, color_label, tags (JSON), is_featured (bool), is_hidden (bool), favorites_count, comments_count
- SoftDeletes, timestamps

#### 7. `photo_comments` — Threaded comments on photos (client feedback + internal notes)
- id, photo_id (FK), user_id (FK), parent_id (self-referencing FK for replies), body
- is_internal (bool — hidden from clients), resolved_at, resolved_by (FK → users), pin_position (JSON — x,y coords for pin-point feedback)
- SoftDeletes, timestamps

#### 8. `photo_favorites` — Which photos a user hearted/liked
- id, photo_id (FK), user_id (FK), timestamps

#### 9. `gallery_selections` — A client's curated selection of photos from a gallery
- id, gallery_id (FK), user_id (FK), status (draft|submitted|revision_requested|approved), is_locked (bool), notes, submitted_at, approved_at, approved_by (FK → users)
- timestamps
- **Pivot table** `gallery_selection_photos`: selection_id, photo_id, retouching_notes, color_label_override, timestamps

#### 10. `export_jobs` — Tracks zip/download exports
- id, gallery_id (FK), user_id (FK), type, status (pending|processing|completed|failed), file_path, file_size, photo_count, error_message, started_at, completed_at, expires_at
- timestamps

#### 11. `portfolios` — Public-facing showcase categories (e.g. "Weddings", "Portraits")
- id, studio_id (FK), title, slug, description, cover_photo_path, category (enum: wedding, portrait, event, commercial, newborn, landscape, other), is_published (bool), sort_order
- SoftDeletes, timestamps

#### 12. `portfolio_photos` — Photos inside a portfolio
- id, portfolio_id (FK), photo_path, display_path, thumb_path, caption, sort_order
- timestamps
- **Uses Spatie Media Library** for image conversions (WebP display + thumb)

#### 13. `packages` — Service packages/pricing tiers
- id, studio_id (FK), name, description, price (decimal), type, includes (JSON), is_active (bool), sort_order
- SoftDeletes, timestamps

#### 14. `bookings` — Appointment/session requests
- id, studio_id (FK), project_id (FK nullable), client_user_id (FK nullable), package_id (FK nullable), reference_number (auto-generated like "KB-00001")
- status (inquiry|quoted|confirmed|deposit_paid|completed|cancelled), session_date, location, notes, total_amount (decimal), deposit_amount (decimal), confirmed_at
- SoftDeletes, timestamps
- **Auto-generates reference_number** on creation using a `booted()` hook

#### 15. `contracts` — Contracts attached to bookings
- id, booking_id (FK), title, content, signature_path, signer_name, signer_ip, signed_at
- timestamps

#### 16. `invoices` — Financial documents for bookings
- id, studio_id (FK), booking_id (FK), client_user_id (FK), invoice_number, status (draft|sent|paid|overdue|cancelled)
- subtotal (decimal), tax (decimal), total (decimal), amount_paid (decimal), due_date, paid_at, notes, line_items (JSON)
- SoftDeletes, timestamps

#### 17. `testimonials` — Client reviews displayed on the public site
- id, studio_id (FK), client_name, client_role, content, rating (1-5), photo_path, is_featured (bool), is_active (bool), sort_order
- timestamps
- **Uses Spatie Media Library** for client photo (thumbnail conversion)

Also include the standard Spatie tables:
- `permissions`, `roles`, `model_has_permissions`, `model_has_roles`, `role_has_permissions` (via spatie/laravel-permission migration)
- `activity_log` (via spatie/laravel-activitylog migration)
- `media` (via spatie/laravel-medialibrary migration)
- Laravel defaults: `users`, `password_reset_tokens`, `sessions`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`

---

### MODELS — What each one does

Create an Eloquent model for each table. Here's the behavior each model needs:

1. **User** — `HasApiTokens, HasFactory, HasRoles, LogsActivity, Notifiable`. Belongs to Studio. Has one ClientProfile. Has many Projects, Comments, Favorites, Selections, Bookings, Invoices. Helper methods: `isAdmin()`, `isClient()`, `isEditor()`.

2. **Studio** — `HasFactory, SoftDeletes, InteractsWithMedia (Spatie)`. JSON casts for branding, watermark_settings, payment_settings, hero_images, social_links, availability_hours. Spatie media collections: `logo` (single), `hero-images` (multiple), `photographer-photo` (single) with WebP conversions. Accessors: `logo_url`, `photographer_photo_url`, `hero_image_urls`. Has many Users, Projects, Galleries, Portfolios, Packages, Bookings, Invoices, ClientProfiles, Testimonials.

3. **ClientProfile** — Belongs to User and Studio. JSON cast for preferences.

4. **Project** — `LogsActivity, SoftDeletes`. Belongs to Studio and Client (User). Has many Galleries and Bookings. Date cast for shoot_date.

5. **Gallery** — `LogsActivity, SoftDeletes`. Belongs to Project and Studio. Has many Photos, Selections, ExportJobs. Scopes: `published`, `forClient`. Helpers: `isExpired()`, `progressStats()`.

6. **Photo** — `SoftDeletes`. Belongs to Gallery and Uploader (User). Has many Comments, rootComments, Favorites. URL helpers: `getSignedPreviewUrl()`, `getSignedThumbUrl()`. Scopes: `visible`, `favorited`, `withUnresolvedComments`, `withColorLabel`.

7. **PhotoComment** — `LogsActivity, SoftDeletes`. Belongs to Photo, User, Parent (self). Has many Replies (self-referencing). Belongs to Resolver (User). Helpers: `isResolved()`, `isReply()`, `resolve()`, `unresolve()`. Scopes: `public`, `internal`, `unresolved`, `resolved`, `rootLevel`.

8. **PhotoFavorite** — `LogsActivity`. Belongs to Photo and User.

9. **GallerySelection** — `LogsActivity`. Belongs to Gallery, User, Approver. BelongsToMany Photos (pivot: retouching_notes, color_label_override). Helpers: `approve()`, `isEditable()`.

10. **ExportJob** — Belongs to Gallery and User. Helpers: `markProcessing()`, `markCompleted()`, `markFailed()`.

11. **Portfolio** — `SoftDeletes`. Belongs to Studio. Has many PortfolioPhotos. Scope: `published`.

12. **PortfolioPhoto** — `InteractsWithMedia (Spatie)`. Spatie collection: `photo` (single, accepts jpeg/png/webp/tiff). Conversions: `display` (1800px wide, WebP, 85% quality) and `thumb` (500x500, WebP, 80% quality). Accessors: `display_url`, `thumb_url`, `original_url` — each falls back through Spatie conversion → Spatie original → disk path. Belongs to Portfolio.

13. **Package** — `SoftDeletes`. Belongs to Studio. Has many Bookings. JSON cast for includes, decimal cast for price.

14. **Contract** — Belongs to Booking. Helper: `isSigned()`.

15. **Invoice** — `LogsActivity, SoftDeletes`. Belongs to Studio, Booking, Client. Decimal casts. Helpers: `balanceDue()`, `isPaid()`.

16. **Booking** — `LogsActivity, SoftDeletes`. Auto-generates reference_number on creation. Belongs to Studio, Project, Client, Package. Has one Contract. Has many Invoices.

17. **Testimonial** — `InteractsWithMedia (Spatie)`. Spatie collection: `photo` (single). Conversion: `thumb` (200x200, WebP). Accessor: `photo_url`. Belongs to Studio. Scopes: `active`, `featured`.

---

### CONTROLLERS & ROUTES

#### Public Routes (no auth required)
| Method | URI | Controller@method | Purpose |
|--------|-----|-------------------|---------|
| GET | `/` | WelcomeController (invokable) | Landing page — hero, portfolio grid, testimonials, contact info |
| GET | `/portfolio` | PortfolioController@publicIndex | Public portfolio gallery page |
| GET | `/portfolio/{portfolio:slug}` | PortfolioController@show | Single portfolio with all its photos |
| GET | `/book` | BookingController@create | Public booking request form |
| POST | `/book` | BookingController@store | Submit a new booking request (sends confirmation + notification emails) |
| GET | `/booking-status` | BookingController@statusLookup | Page where clients check their booking status |
| POST | `/booking-status` | BookingController@statusCheck | Verify reference number + email → return status |
| GET | `/api/availability` | BookingController@availability | JSON endpoint returning booked dates for calendar |

#### Auth Routes (Laravel Breeze defaults)
- Register, Login, Forgot Password, Reset Password, Verify Email, Confirm Password, Logout

#### Authenticated Routes (auth + verified middleware)
| Method | URI | Controller@method | Purpose |
|--------|-----|-------------------|---------|
| GET | `/dashboard` | DashboardController@index | Admin sees stats/charts/activity; clients see their galleries |
| GET/PATCH/DELETE | `/profile` | ProfileController | Edit profile info, upload avatar, delete account |
| RESOURCE | `/galleries` | GalleryController | CRUD for photo galleries |
| GET | `/galleries/{gallery}/review` | GalleryReviewController@show | Full review panel with thumbnails, preview, comments, filters |
| RESOURCE | `/projects` | ProjectController (except show, edit) | CRUD for projects |
| RESOURCE | `/clients` | ClientController (except edit, destroy) | CRUD for client accounts |
| RESOURCE | `/portfolios` | PortfolioController (except show) | Admin portfolio management |
| POST | `/portfolios/{portfolio}/photos` | PortfolioController@uploadPhotos | Upload photos to portfolio |
| DELETE | `/portfolios/{portfolio}/photos/{photo}` | PortfolioController@deletePhoto | Remove a portfolio photo |
| POST | `/portfolios/{portfolio}/cover` | PortfolioController@setCover | Set portfolio cover photo |
| PATCH | `/portfolios/{portfolio}/photos/{photo}/caption` | PortfolioController@updatePhotoCaption | Edit photo caption |
| GET | `/bookings` | BookingController@index | Admin booking list |
| GET | `/bookings/calendar` | BookingController@calendar | Calendar view of bookings |
| PUT | `/bookings/{booking}` | BookingController@update | Update booking status (sends email) |
| POST | `/bookings/{booking}/reply` | BookingController@reply | Send reply email to client |
| GET | `/settings` | SettingsController@index | Studio settings page |
| PUT | `/settings/studio` | SettingsController@updateStudio | Update studio info, branding, social links, availability |
| POST/DELETE | `/settings/logo` | SettingsController | Upload/remove studio logo |
| POST/DELETE | `/settings/hero-images` | SettingsController | Upload/remove hero images |
| POST/DELETE | `/settings/photographer-photo` | SettingsController | Upload/remove photographer photo |
| POST/PUT/DELETE | `/settings/packages/*` | SettingsController | CRUD for service packages |
| GET | `/testimonials` | TestimonialController@index | Manage testimonials |
| POST/PUT/DELETE | `/testimonials` | TestimonialController | CRUD for testimonials |
| POST | `/testimonials/{testimonial}/photo` | TestimonialController@uploadPhoto | Upload testimonial client photo |

---

### SERVICES LAYER

Create these service classes in `app/Services/`:

1. **ImageService** — `process(UploadedFile, folder)` → stores original, generates display (1800px WebP) and thumb (500px WebP) using Intervention Image. Returns array of paths.

2. **PhotoIngestService** — `ingest(UploadedFile, Gallery, User)` → stores original, creates Photo record, dispatches jobs for thumbnails/preview/EXIF extraction. `ingestBatch()` for multiple files.

3. **GalleryProgressService** — `calculate(Gallery)` → returns stats (total photos, total/resolved/unresolved comments, percent resolved, total favorites). `selectionProgress(Gallery, userId)` → returns selection count vs limit.

4. **SelectionLockService** — `getOrCreateSelection()`, `submit()`, `approve()`, `requestRevision()`, `overrideLock()`, `togglePhoto()` with limit checking.

5. **ExportService** — `createExport(Gallery, User, type)` → creates ExportJob, dispatches zip builder. `getActiveExports()`.

6. **SignedUrlService** — `previewUrl()`, `thumbUrl()`, `originalUrl()`, `watermarkedUrl()` — generates public URLs for local storage or temporary URLs for cloud storage.

---

### API RESOURCES

Create three JSON resources in `app/Http/Resources/`:

1. **GalleryResource** — Formats gallery data including cover URL, project/client info, dates.
2. **PhotoResource** — Formats photo data including preview/thumb/original URLs, EXIF, tags, favorites, comments count, `is_favorited` flag.
3. **CommentResource** — Formats threaded comments with user info, resolution status, pin position, nested replies.

---

### EMAIL / MAIL

Create four Mailable classes in `app/Mail/`:

1. **BookingConfirmation** — Sent to client after they submit a booking. Subject: "Booking Confirmation - [Studio Name]"
2. **BookingNotification** — Sent to studio owner when a new booking comes in. Subject: "New Booking Request from [Client Name]"
3. **BookingResponse** — Sent when admin replies to a booking. Subject: "Message from [Studio Name] - Booking [Reference]"
4. **BookingStatusUpdate** — Sent when admin changes booking status. Subject: "Booking Update - [Studio Name]"

Each uses a Blade email template in `resources/views/emails/`.

---

### FRONTEND PAGES (React + Inertia + TypeScript)

All pages live in `resources/js/Pages/`. Use Inertia's `<Head>` for page titles and `<Link>` for navigation (no full page reloads).

#### Layouts
1. **AuthenticatedLayout** — Sticky top nav with studio logo, navigation links (Dashboard, Galleries, Projects, Clients, Portfolios, Bookings, Testimonials, Settings for admins; Dashboard, Galleries for clients), dark mode toggle, user dropdown. Responsive hamburger menu.
2. **GuestLayout** — Simple centered card layout for auth pages.

#### Public Pages
1. **Welcome.tsx** — Full landing page with:
   - Animated hero section with studio name (text scramble animation), hero images, and CTA buttons
   - Portfolio grid with category filter tabs and lightbox
   - About/photographer section
   - Testimonials carousel
   - Contact info with social links
   - Smooth scroll-reveal animations throughout
   - Custom React hooks: `useScrollReveal`, `useTextScramble`, `useCursorFloat`

2. **Portfolios/Public.tsx** — Grid of all published portfolios with photos
3. **Portfolios/Show.tsx** — Single portfolio with photo grid and lightbox
4. **Bookings/Create.tsx** — Booking form with package selection, date picker with availability checking (fetches `/api/availability`), time picker, contact fields
5. **Bookings/StatusLookup.tsx** — Reference number + email lookup form showing booking status

#### Authenticated Pages
6. **Dashboard.tsx** — Admin: stat cards (animated count-up numbers), area chart (uploads over time via Recharts), pie chart (gallery statuses), recent bookings table, upcoming sessions, activity feed. Client: list of their galleries.

7. **Galleries/Index.tsx** — Grid of gallery cards with status badges, photo counts, project info
8. **Galleries/Create.tsx** — Form to create a new gallery (select project, settings)
9. **Galleries/Show.tsx** — Gallery detail with photo grid, upload area, bulk actions

10. **Galleries/ReviewPanel.tsx** — THE core review experience:
    - Three-column layout: thumbnail sidebar (left), photo preview stage (center), comments sidebar (right)
    - Thumbnail sidebar with search, filter chips (favorites, has comments, unresolved, rating, color label)
    - Large photo preview with keyboard navigation
    - Comments panel with threaded replies, internal notes toggle, resolve/unresolve
    - Progress header showing review completion percentage
    - Photo selection with limit tracking
    - Split into sub-components: `ThumbnailSidebar`, `PhotoPreviewStage`, `CommentsSidebar`, `ProgressHeader`

11. **Projects/Index.tsx** — Project list with status badges, quick-create form
12. **Clients/Index.tsx** — Client list with profile info, project counts
13. **Clients/Show.tsx** — Client detail with projects, bookings, invoices

14. **Portfolios/Index.tsx** — Admin portfolio list with photo counts, publish toggle
15. **Portfolios/Edit.tsx** — Portfolio editor with drag-and-drop photo reorder, upload, caption editing, cover selection

16. **Bookings/Index.tsx** — Booking list with status management, email reply
17. **Bookings/Calendar.tsx** — Monthly calendar view of sessions

18. **Testimonials/Index.tsx** — Manage client testimonials with rating, featured toggle, photo upload

19. **Settings/Index.tsx** — Studio settings: name, description, contact, branding colors, logo upload, hero images upload, photographer photo, social links, availability hours, service packages CRUD

20. **Profile/Edit.tsx** — User profile with avatar upload, info update, password change, account deletion

#### Auth Pages (Breeze defaults)
21. Login, Register, ForgotPassword, ResetPassword, VerifyEmail, ConfirmPassword

---

### CUSTOM REACT HOOKS

Create in `resources/js/hooks/`:

1. **useScrollReveal** — IntersectionObserver hook that adds `.visible` class when element enters viewport (for CSS animations). Fires once then disconnects.
2. **useTextScramble** — Animated text effect that starts with random characters and resolves left-to-right to the final text over a duration.
3. **useCountUp** — Animated counter from 0 to target using requestAnimationFrame with ease-out cubic easing.
4. **useTheme** — Dark mode toggle that persists to localStorage and toggles `dark` class on `<html>`.
5. **useCursorFloat** — Custom cursor follower effect for the landing page.
6. **useKeyboardShortcuts** — Keyboard shortcut handler for the review panel.
7. **usePrefetch** — Inertia link prefetching on hover for faster navigation.

---

### DESIGN SYSTEM

- **Color scheme**: Primary blue (`#197fe6`), dark backgrounds (`#111921`), with warm accent colors. Full dark mode support.
- **Typography**: `font-display` (Spline Sans or similar clean sans-serif via Google Fonts CDN)
- **Icons**: Mix of Lucide React icons, Google Material Symbols, and Heroicons
- **Animations**: Scroll-reveal (translate-y + opacity), text scramble, count-up numbers, smooth transitions on hover states
- **Components**: Cards with subtle shadows, rounded-lg corners, backdrop-blur nav, pill-shaped filter chips, status badges with color coding

---

### DATABASE SEEDER

Create a `DatabaseSeeder` that:
1. Creates the studio with full branding/settings
2. Creates admin, editor, and client users
3. Creates sample packages (4 tiers from mini to premium)
4. Creates 4 projects with galleries, each containing photos (with GD-generated placeholder images — colored rectangles with dimensions text)
5. Adds favorites, threaded comments (client feedback + admin replies + internal editor notes), and selections
6. Creates portfolios with photos
7. Creates a booking with contract and invoice
8. Sets up Spatie roles (admin, photographer, editor, client) and permissions

---

### STORAGE & FILE HANDLING

- Use Laravel's `public` disk (`storage/app/public/`) with the storage symlink (`php artisan storage:link`)
- Store originals, then generate display (1800px) and thumbnail (500px) versions
- Portfolio photos use Spatie Media Library for automatic WebP conversions
- Studio logos and hero images also use Spatie Media Library
- Gallery photos use the PhotoIngestService + queued jobs for processing
- Always store a direct file path as fallback in case Spatie conversions fail

---

### KEY ARCHITECTURE PATTERNS

1. **Inertia.js** — No REST API. Controllers return `Inertia::render('Page', $props)`. Forms use `useForm()` hook from `@inertiajs/react`.
2. **Spatie Media Library** — Models implement `HasMedia` interface and `InteractsWithMedia` trait. Define collections and conversions in `registerMediaCollections()` and `registerMediaConversions()`.
3. **Multi-tenant by studio_id** — All queries scoped to `$request->user()->studio_id`.
4. **Role-based access** — `isAdmin()` checks in controllers and conditionally rendered UI.
5. **Activity logging** — Key models use `LogsActivity` trait. Dashboard displays recent activity feed.
6. **Email notifications** — Booking flow sends 4 types of emails at different stages.
7. **Dual storage strategy** — Always store files directly to disk AND add to Spatie, so photos are never lost if image conversion fails.

---

### HOW TO ADAPT FOR A DIFFERENT BUSINESS

Replace these domain terms throughout:

| Photography Term | Generic Equivalent |
|-----------------|-------------------|
| Photo / Gallery | [Your deliverable item] / [Collection of items] |
| Shoot / Session | [Your service event] |
| Portfolio | [Public showcase of your work] |
| Retouching | [Post-service refinement] |
| EXIF data | [Item metadata] |
| Wedding/Portrait/Event types | [Your service categories] |

**Examples:**
- **Bakery**: Photos → Cake Photos, Gallery → Order Gallery, Shoot → Tasting Session, Portfolio → Cake Portfolio, Packages → Cake Packages
- **Salon**: Photos → Style Photos, Gallery → Client Lookbook, Shoot → Appointment, Portfolio → Style Portfolio, Packages → Service Packages
- **Tattoo Studio**: Photos → Tattoo Photos, Gallery → Client Gallery, Shoot → Session, Portfolio → Tattoo Portfolio, Packages → Tattoo Packages
- **Real Estate**: Photos → Property Photos, Gallery → Listing Gallery, Shoot → Property Shoot, Portfolio → Property Portfolio

The database structure, authentication, booking system, review workflow, and frontend architecture remain the same regardless of business type.

---

### COMMANDS TO SCAFFOLD

```bash
# 1. Create Laravel project
composer create-project laravel/laravel [project-name]
cd [project-name]

# 2. Install Breeze with Inertia React TypeScript stack
composer require laravel/breeze --dev
php artisan breeze:install react --typescript

# 3. Install Spatie packages
composer require spatie/laravel-medialibrary spatie/laravel-permission spatie/laravel-activitylog
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider" --tag="medialibrary-migrations"
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations"

# 4. Install other PHP packages
composer require intervention/image intervention/image-laravel laravel/sanctum tightenco/ziggy

# 5. Install JS packages
npm install @heroicons/react lucide-react recharts react-is

# 6. Create storage symlink
php artisan storage:link

# 7. Run migrations
php artisan migrate

# 8. Seed database
php artisan db:seed

# 9. Start dev server
composer dev
```

---

**Now build this application step by step. Start with migrations, then models, then
controllers and routes, then the React pages. Make sure every file has friendly
comments explaining what it does. The comments should be written from the perspective
of what the [BUSINESS_TYPE] business owner needs — for example, "This model
represents a client who books sessions with us" rather than "This is an Eloquent
model that extends the base Model class."**
