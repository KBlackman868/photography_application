# Laravel Guidelines

## Routing

- Use **named routes** everywhere: `route('galleries.index')`, never hardcoded URLs
- Resource routes where applicable: `Route::resource('galleries', GalleryController::class)`
- API routes under `routes/api.php` with `auth:sanctum` middleware
- Public routes (portfolio, booking form, welcome) have no auth middleware

## Form Requests

Required for all form endpoints. Must include:

```php
class StoreBookingRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'session_type' => 'required|in:portrait,wedding,event,commercial',
        ];
    }

    public function attributes(): array
    {
        return [
            'session_type' => 'type of session',  // Humanised
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'We need your email to send booking confirmation.',
        ];
    }
}
```

## Controller Pattern

Controllers must stay thin. Delegate to services:

```php
public function store(StorePhotoRequest $request, Gallery $gallery)
{
    $this->authorize('update', $gallery);
    $photos = $this->photoIngestService->ingestBatch($gallery, $request->file('photos'));
    return PhotoResource::collection($photos);
}
```

## Configuration

- Use `config()` for reusable/environment-driven values
- Never hardcode URLs, paths, limits, or credentials
- Store business rules in config when they might vary per environment

## Authorization & Roles

**Roles:** `admin`/`photographer`, `editor`, `client` (via Spatie Permission)

- Admin/photographer has full studio access (Super Admin equivalent)
- Always seed admin role via `AdminAccountSeeder`
- Use policies for resource-level authorization
- Use `$this->authorize()` in controllers, not inline checks
- Keep permission naming consistent: `verb-resource` (e.g., `view-gallery`, `create-photo`)
- Never duplicate permission logic across controllers

## Eloquent Patterns

- Scope queries to the authenticated user's studio
- Use eager loading to prevent N+1: `Gallery::with('photos', 'project.client')->get()`
- Use `$casts` for JSON fields (e.g., `exif_data`, `tags`)
- Use accessors for computed values (e.g., `preview_url`, `thumb_url`)
- Soft deletes for archivable resources

## Validation

- Use Laravel Precognition where it benefits UX (real-time validation on booking forms)
- Don't force Precognition on simple forms
- Always return human-friendly error messages

## File Uploads

- Store files in `storage/app/public/` with structured paths
- UUID-based filenames to avoid collisions
- Validate mime type and size (50MB max for photos)
- Process asynchronously via queued jobs
- Never use raw user-provided filenames

## Queue Jobs

- All image processing runs in background jobs
- 3 retries with 30-second backoff
- Queue worker must be running: `php artisan queue:work`
- Use `Queue::fake()` in tests

## Mail

- Booking confirmation emails via Mailable classes
- Use Blade templates in `resources/views/emails/`
- Use `Mail::fake()` in tests
