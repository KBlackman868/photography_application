# Architectural Patterns

## Inertia.js Bridge

Laravel renders React pages via Inertia — no separate API for page loads. Controllers return `Inertia::render('Page', $props)`. The frontend receives typed props and renders React components. Shared data (auth user, flash messages) injected via `HandleInertiaRequests` middleware.

## Service Layer

Business logic lives in `app/Services/`, not controllers. Controllers remain thin — validate, authorize, delegate to service, return response.

| Service | Responsibility |
|---------|---------------|
| PhotoIngestService | Upload pipeline: store file, create record, dispatch jobs |
| ExportService | Create export records, dispatch BuildExportZipJob |
| ImageService | Resize, crop, watermark via Intervention Image |
| SignedUrlService | Time-limited download URLs (60-min default) |
| SelectionLockService | Prevent concurrent selection edits during approval |
| GalleryProgressService | Comment resolution %, selection counts |

## Background Job Pipeline

Photo uploads trigger 3 async jobs per photo:
1. `GenerateThumbnailsJob` — 300×300 crop
2. `GenerateWebPreviewJob` — 1800px optimized
3. `ExtractExifJob` — Camera metadata (aperture, ISO, lens, etc.)

All jobs: 3 retries, 30-second backoff. Queue worker must be running (`php artisan queue:work`).

Export zips built by `BuildExportZipJob` — frontend polls `/exports/{id}/status`.

## Authorization Model

**Roles:** `admin`/`photographer` (studio owner), `editor` (internal team), `client` (external).

**Policies** enforce access at the resource level:
- `GalleryPolicy` — Admins see all studio galleries; editors see studio galleries; clients see only their project's galleries
- `PhotoPolicy`, `SelectionPolicy`, `ExportPolicy`, `CommentPolicy` — similar scoping

Pattern: `$this->authorize('action', $model)` in controllers.

**Super Admin:** The admin/photographer role has unrestricted studio access. Ensure this role is always seeded via `AdminAccountSeeder`.

## Multi-Tenant Scoping

Studio-based isolation. Most queries scoped to the authenticated user's studio:
```php
$studio = auth()->user()->studio;
$galleries = $studio->galleries()->paginate(12);
```

Clients access resources through their project association, not direct studio membership.

## Soft Deletes

Used on key models (galleries, photos) for archive functionality. Always use `->trashed()` checks when relevant.

## Media Management (Dual System)

1. **Direct filesystem** — Photo originals/previews/thumbnails stored in `storage/app/public/galleries/`
2. **Spatie MediaLibrary** — Studio branding assets (logo, hero images, photographer photo) with automatic conversions

These are separate systems. Photos use the direct approach for performance; studio assets use Spatie for convenience.
