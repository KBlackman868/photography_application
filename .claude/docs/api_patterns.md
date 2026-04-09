# API Patterns

## Authentication

All API routes require `auth:sanctum` middleware. Tokens issued on login for SPA/mobile access.

## Base URL

All API routes prefixed with `/api`. Defined in `routes/api.php`.

## Endpoints

### Photos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/galleries/{id}/photos` | List with filters |
| POST | `/api/galleries/{id}/photos/upload` | Batch upload (multipart) |
| PUT | `/api/photos/{id}` | Update metadata |
| POST | `/api/galleries/{id}/photos/batch` | Bulk update |
| DELETE | `/api/photos/{id}` | Delete photo |

**Query filters:** `?search=&favorited=1&has_comments=1&unresolved_only=1&rating=4&color_label=red`

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/photos/{id}/comments` | List threaded comments |
| POST | `/api/photos/{id}/comments` | Create comment (supports `parent_id` for replies) |

### Favorites
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/photos/{id}/favorite` | Toggle favorite |

### Selections
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/galleries/{id}/selection` | Get current selections |
| POST | `/api/galleries/{id}/selection` | Submit selections |

### Exports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/galleries/{id}/exports` | Create export job |
| GET | `/api/exports/{id}/status` | Poll export status |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/galleries/{id}/progress` | Comment/selection stats |

## Response Format

API resources transform models via `app/Http/Resources/`:
- `PhotoResource` — Includes computed URLs, EXIF data, counts, favorite status
- Original URL returned only for admin users

## Pagination

- Default: 15 per page (Laravel default)
- Galleries: 12 per page
- Photos in gallery: 50 per page

## Export Types

| Type | Description |
|------|-------------|
| `zip_originals` | Full-resolution files |
| `zip_previews` | Web-sized (faster download) |
| `lightroom_csv` | Metadata for Lightroom import |
| `editing_brief` | Selection guide for editors |
| `selection_list` | Client's formatted picks |

## Async Pattern

Export creation returns a job ID. Frontend polls `/exports/{id}/status` until status is `completed`, then provides download link.

## Error Responses

- `403 Forbidden` — Authorization failure (policy denied)
- `404 Not Found` — Resource doesn't exist
- `422 Unprocessable Entity` — Validation errors (with field-level messages)
- `500 Internal Server Error` — Unexpected failures
