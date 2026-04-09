# Photography Studio Portal

A client-facing photography studio management platform. Photographers upload, organize, and deliver photos. Clients browse galleries, leave threaded comments, mark favorites, submit selections, and book sessions.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 12, PHP 8.2+ |
| Frontend | React 18, TypeScript, Inertia.js |
| Styling | Tailwind CSS 3 (dark mode via `class`) |
| Build | Vite 7 |
| Auth | Laravel Sanctum (API tokens), Breeze (web) |
| Roles | Spatie Permission (`admin`/`photographer`, `editor`, `client`) |
| Media | Spatie MediaLibrary (studio assets), Intervention Image 3.11 (processing) |
| Audit | Spatie Activity Log |
| Database | SQLite (local), configurable |
| Testing | PHPUnit 11.5.3 |

## Key Directories

```
app/Http/Controllers/     # 27 controllers (web + Api/ + Auth/)
app/Http/Requests/        # Form request validation
app/Http/Resources/       # API response transformers
app/Http/Policies/        # Authorization (Gallery, Photo, Selection, Export, Comment)
app/Models/               # 17 Eloquent models
app/Services/             # Business logic (PhotoIngest, Export, Image, SignedUrl, SelectionLock, GalleryProgress)
app/Jobs/                 # Background processing (Thumbnails, WebPreview, Exif, ExportZip)
app/Mail/                 # Booking notifications
routes/web.php            # Public + authenticated web routes
routes/api.php            # Sanctum-protected API (photos, comments, favorites, selections, exports)
resources/js/Pages/       # React page components
resources/js/Components/  # Reusable UI (ReviewPanel subsystem, form elements)
resources/js/hooks/       # Custom hooks (useTheme, useKeyboardShortcuts, usePrefetch)
database/migrations/      # 27 migrations
database/seeders/         # AdminAccountSeeder
```

## Essential Commands

```bash
# Development (runs PHP server + queue + logs + Vite concurrently)
npm run dev

# Build for production
npm run build

# Run tests (clears config cache first)
npm test

# Laravel specific
php artisan migrate
php artisan db:seed
php artisan storage:link
php artisan queue:work          # Required for image processing jobs
```

## Development Workflow

**Task prefixes are mandatory.** Every task must be classified:
- `BUG FIX` — bugfix/description
- `NEW FEATURE` — feature/description
- `UPDATE` — update/description

**Branching:** kebab-case, one concern per branch. No direct commits to main. All merges → staging → main.

**Commits:** `fix(scope):`, `feat(scope):`, `refactor(scope):`, `test(scope):` — atomic, no mixed concerns.

**Database changes:** Always ask if the project is in production before modifying migrations.

**Before creating/switching branches:** Check existing branches, suggest the most logical one, ask for approval.

**For meaningful changes:** Present at least 3 options with trade-offs, recommend one.

## Core Business Flows

- **Gallery:** Draft → Published → Review → Approved → Archived
- **Booking:** Inquiry → Quoted → Confirmed → Paid → Completed/Cancelled
- **Photo upload:** Store original → create DB record → dispatch 3 background jobs (thumbnail, preview, EXIF)
- **Selections:** Client picks photos (up to `selection_limit`) → submits → photographer approves (with locking)

## Storage Layout

```
storage/app/public/galleries/{gallery_id}/{originals,previews,thumbnails}/
storage/app/public/studios/{studio_id}/        # Logos, hero images
storage/app/public/portfolios/                 # Portfolio photos
```

File naming: UUID-based. Paths stored as relative in DB, served via `asset('storage/...')` or signed URLs.

## Additional Documentation

Detailed guidelines in `.claude/docs/`:
- [Architectural Patterns](/.claude/docs/architectural_patterns.md)
- [Development Workflow](/.claude/docs/workflow.md)
- [Testing Strategy](/.claude/docs/testing_strategy.md)
- [Laravel Guidelines](/.claude/docs/laravel_guidelines.md)
- [Frontend Guidelines](/.claude/docs/frontend_guidelines.md)
- [API Patterns](/.claude/docs/api_patterns.md)
