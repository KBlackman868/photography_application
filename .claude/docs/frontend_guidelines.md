# Frontend Guidelines

## Stack

- **React 18** with TypeScript
- **Inertia.js** — bridges Laravel controllers to React pages (no separate API for page loads)
- **Tailwind CSS 3** — utility-first styling with dark mode (`class` strategy)
- **Vite 7** — dev server and production builds
- Path alias: `@/*` maps to `resources/js/*`

## Page Components

Pages live in `resources/js/Pages/` and map to Inertia routes:

```tsx
// Controller returns:
return Inertia::render('Galleries/Show', ['gallery' => $gallery]);

// React receives typed props:
export default function Show({ gallery }: { gallery: Gallery }) { ... }
```

## Component Organization

```
resources/js/
├── Pages/          # Route-level components (one per Inertia render)
├── Components/     # Reusable UI (buttons, inputs, modals, panels)
├── hooks/          # Custom React hooks
├── types/          # TypeScript interfaces (global.d.ts, index.d.ts)
└── bootstrap.ts    # Axios defaults
```

## TypeScript

- Define interfaces in `resources/js/types/`
- Type all component props
- Use `@/` path alias for imports

## Styling

- Tailwind utilities — avoid custom CSS unless necessary
- Dark mode: use `dark:` prefix classes, toggled via `useTheme` hook
- Custom theme colors: `primary` (#1e3a8a), `accent` (#d4af37)
- Custom fonts: Syne (display headings), Inter (body text)
- Animation classes defined in `resources/css/app.css` (scroll-reveal, fade-up, slide-left)

## Key UI Subsystems

### ReviewPanel (Gallery Proofing)
The most complex frontend feature. Subcomponents:
- `PhotoPreviewStage` — Main image viewer
- `ThumbnailSidebar` — Grid navigation
- `CommentsSidebar` — Threaded feedback with resolve tracking
- `ProgressHeader` — Stats and export controls

Keyboard shortcuts (via `useKeyboardShortcuts`):
- `J`/`K` or arrows — Previous/next photo
- `F` — Toggle favorite
- `C` — Focus comment input

### Hooks
- `useTheme` — Dark/light mode toggle
- `useKeyboardShortcuts` — Gallery navigation shortcuts
- `usePrefetch` — Preload adjacent photos for smooth navigation
- `useScrollReveal` — Fade-in animations on scroll
- `useCountUp` — Animated number counters

## Forms

- Use Inertia's `useForm` hook for form state and submission
- Validation errors returned automatically from Laravel Form Requests
- Display errors via `InputError` component

## API Calls

- Inertia handles page navigation (no manual fetch for page loads)
- Direct API calls (photo upload, comments, favorites) use Axios via `resources/js/bootstrap.ts`
- Sanctum cookie-based auth for SPA API calls

## Icons

- Heroicons (`@heroicons/react`) — primary icon set
- Lucide React — supplementary icons
