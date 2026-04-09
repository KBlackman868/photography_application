# Testing Strategy

## Test Organization

```
tests/
├── Feature/    # HTTP flow tests (controllers, middleware, auth)
└── Unit/       # Isolated logic tests (services, helpers, models)
```

## Running Tests

```bash
npm test                    # Clears config cache + runs PHPUnit
php artisan test            # Direct PHPUnit run
php artisan test --filter=RegistrationTest  # Specific test
```

## Test Types

### Feature Tests (HTTP Flows)
Test full request/response cycles through controllers.

Current coverage:
- Authentication: Registration, Login, Email Verification, Password Reset, Password Confirmation
- Profile: Update, Delete

Should expand to:
- Gallery CRUD and access control
- Photo upload pipeline
- Booking workflow state transitions
- Selection submission and approval
- Export creation and status polling

### Unit Tests (Isolated Logic)
Test services and business rules without HTTP layer.

Priority targets:
- `PhotoIngestService` — file storage, record creation, job dispatch
- `ExportService` — export record creation, job dispatch
- `ImageService` — resize/crop/watermark operations
- `SelectionLockService` — locking and unlocking behavior
- `GalleryProgressService` — metric calculations

### Service Test Requirements

Every service test must cover:
1. **Happy path** — normal successful operation
2. **Failure path** — invalid input, missing resources, permission denied
3. **Edge cases** — empty collections, boundary values, concurrent access
4. **Transactional integrity** — data consistency on failure

## Test Utilities

- **UserFactory** — Available for creating test users with roles
- **SQLite in-memory** — Test database (configured in phpunit.xml)
- **Fake storage** — Use `Storage::fake('public')` for file upload tests
- **Fake queues** — Use `Queue::fake()` to assert job dispatch without execution
- **Fake events** — Use `Event::fake()` for event-driven tests
- **Fake mail** — Use `Mail::fake()` for booking notification tests

## Key Testing Patterns

### Policy Tests
```php
$this->actingAs($client)
    ->get(route('galleries.show', $otherClientsGallery))
    ->assertForbidden();
```

### Upload Tests
```php
Storage::fake('public');
$file = UploadedFile::fake()->image('photo.jpg', 4000, 2667);
$response = $this->postJson("/api/galleries/{$gallery->id}/photos/upload", [
    'photos' => [$file],
]);
Storage::disk('public')->assertExists("galleries/{$gallery->id}/originals/{$filename}");
```

### Job Dispatch Tests
```php
Queue::fake();
// ... trigger upload
Queue::assertPushed(GenerateThumbnailsJob::class);
Queue::assertPushed(GenerateWebPreviewJob::class);
Queue::assertPushed(ExtractExifJob::class);
```

## Naming Convention

- Test classes: `{Feature}Test.php` (e.g., `GalleryAccessTest.php`)
- Test methods: `test_description_of_behavior` (snake_case)
