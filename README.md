# TaskFlow — Full-Stack Task Management Application

A responsive task management app built for the Pied Piper Innovation technical assignment.

**Stack:** Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · TanStack Query · React Hook Form + Zod · Node.js · Express · PostgreSQL · Prisma

## Features

| Area | What's included |
|---|---|
| Dashboard | Total / pending / in-progress / completed / overdue counts, status and priority distribution |
| Task management | Create, view, edit, delete, quick status change |
| Task list | Table, title search (debounced), filter by status & priority, sort by created/due date, pagination. Filters live in the URL (shareable, back-button safe) |
| Forms | Client validation (Zod), server validation errors mapped to fields, duplicate-submit prevention |
| UX | Loading, empty and error states, responsive layout, accessible markup (labels, ARIA, semantic table, native `<dialog>`, skip link) |
| Extras | **Kanban board with drag-and-drop**, **dark/light theme**, **optimistic updates** (with rollback), **unit + integration tests**, rate limiting, security headers, CI workflow, OpenAPI spec |

## Quick start

Prerequisites: Node.js 20+, Docker (or any PostgreSQL 14+).

```bash
# 1. Database
docker compose up -d

# 2. Backend  (http://localhost:4000/api)
cd backend
cp .env.example .env
npm install                          # also runs `prisma generate`
npx prisma migrate deploy            # applies the committed migration
npm run prisma:seed                  # optional sample data
npm run dev

# 3. Frontend (http://localhost:3000)
cd ../frontend
cp .env.example .env.local
npm install
npm run dev
```

Using `npx prisma migrate dev` instead of `deploy` is fine in development.

### Environment variables

| File | Variable | Default | Purpose |
|---|---|---|---|
| `backend/.env` | `DATABASE_URL` | — (required) | PostgreSQL connection string |
| | `PORT` | `4000` | API port |
| | `CORS_ORIGIN` | `http://localhost:3000` | Allowed origins (comma-separated) |
| | `NODE_ENV` | `development` | Hides error internals in `production` |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api` | API base URL used by the browser |
| | `API_URL` | *(falls back to the above)* | Optional internal URL used during server-side rendering |

Backend env vars are validated with Zod at startup; the process exits with a clear message if they are invalid.

### Scripts

| Where | Command | Purpose |
|---|---|---|
| backend | `npm run dev` / `build` / `start` | Develop, compile, run compiled output |
| backend | `npm test` | Unit + integration tests (no database required) |
| backend | `npm run typecheck` | TypeScript check |
| frontend | `npm run dev` / `build` / `start` | Develop, build, serve |
| frontend | `npm test`, `npm run typecheck`, `npm run lint` | Tests, types, lint |

## Project structure

```
.
├── docker-compose.yml          # local PostgreSQL
├── docs/openapi.yaml           # API documentation (OpenAPI 3)
├── docs/screenshots/           # application screenshots
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # data model, enums, indexes
│   │   ├── migrations/         # SQL migrations (committed)
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/             # env validation
│   │   ├── routes/             # endpoint + middleware wiring
│   │   ├── controllers/        # HTTP in/out only
│   │   ├── services/           # business logic
│   │   ├── repositories/       # the only layer that talks to Prisma
│   │   ├── dtos/               # request/response types (inferred from schemas)
│   │   ├── schemas/            # Zod request & response schemas
│   │   ├── validations/        # reusable, sanitized field rules
│   │   ├── mappers/            # entity -> response DTO
│   │   ├── middlewares/        # validate, error handler
│   │   ├── utils/              # AppError, response helpers, sanitizer
│   │   ├── container.ts        # composition root (dependency wiring)
│   │   └── app.ts / server.ts
│   └── tests/                  # Vitest + Supertest
└── frontend/src/
    ├── app/                    # pages & layouts (server components + prefetch)
    ├── components/             # ui/, layout/, dashboard/, tasks/, board/
    ├── hooks/                  # TanStack Query hooks, useDebounce
    ├── services/               # API service layer (taskService)
    ├── lib/                    # apiClient, query keys, constants, helpers
    ├── schemas/                # form validation schemas
    └── types/
```

## Architecture & design decisions

### Backend

- **Layering (separation of concerns).** `Route → Controller → Service → Repository`. Controllers only translate HTTP to method calls; services hold all business rules (not-found handling, overdue calculation, PUT-vs-PATCH semantics, stats); repositories are the only code that imports Prisma.
- **SOLID.** `TaskService` depends on the `ITaskRepository` interface (dependency inversion), and `container.ts` is the single place concrete classes are wired. This is what makes the service testable with an in-memory repository, and lets `createApp(controller)` run the real HTTP stack in tests without a database. Each class has one responsibility; adding a new storage backend needs no service changes (open/closed).
- **DTOs, schemas, validations, mappers.** Field-level sanitized rules live in `validations/`; request and response shapes are composed from them in `schemas/`; DTO types are *inferred* from those schemas so contract and types cannot drift. `TaskMapper` converts Prisma entities to response DTOs (ISO dates, computed `isOverdue`) so persistence details never leak.
- **Validation & sanitization.** Zod validates body, query and params through one `validate()` middleware and replaces them with parsed values. Free text is sanitized (control characters removed, tags stripped repeatedly so nested payloads can't reassemble, whitespace normalized). Output is additionally escaped by React.
- **Errors & responses.** One error middleware maps Zod, `AppError`, malformed JSON and Prisma errors to a consistent envelope: `{ success, data, meta }` or `{ success: false, error: { message, details } }`. Stack traces are hidden in production.
- **REST semantics.** `POST` 201, `DELETE` 204, `GET` 200, `404` for missing, `400` for validation. `PUT` fully replaces (omitted optional fields reset), `PATCH` partially updates, `PATCH /:id/status` is a focused endpoint. `/tasks/stats` is registered before `/:id`.
- **Database.** Enums for status/priority; indexes on `status`, `priority`, `dueDate`, `createdAt` (the filtered/sorted columns); `VARCHAR(150)` title; `updatedAt` maintained by Prisma; an additional hand-written `CHECK` constraint prevents blank titles even if the API is bypassed. Null due dates sort last.
- **Security & operations.** Helmet, CORS allow-list, rate limiting, 10 kB body limit, env validation, graceful shutdown (closes server and Prisma).

### Frontend

- **Layers.** `apiClient` (base URL, headers, network errors, envelope parsing → `ApiError`) → `taskService` (endpoints) → hooks (TanStack Query) → components. Components never call `fetch`.
- **State.** *Server state* lives in the TanStack Query cache with a central query-key factory and targeted invalidation; *client state* (modals, search box text) stays local; *filter state* lives in the URL. No global store is needed, which avoids redundant state.
- **Rendering.** Pages are server components that prefetch data and hand it to the client via `HydrationBoundary`, so the first paint already contains data and the client doesn't refetch immediately. Only interactive parts are `"use client"`. Server fetches use `cache: "no-store"` so Next never serves stale tasks.
- **Forms.** React Hook Form + Zod resolver; server validation `details` are mapped onto the matching fields (non-field errors show in an alert); `isSubmitting` disables the button and blocks duplicate submits.
- **Optimistic UI.** Status changes (table, detail page, Kanban drag-and-drop) update the cache immediately and roll back on failure, then revalidate.
- **Accessibility.** Labelled controls, `aria-invalid`/`aria-describedby` on errors, `role="alert"`, semantic table with caption/scopes, native `<dialog>` (focus trap, Esc), skip link, keyboard-accessible status menu as an alternative to dragging.
- **Known limitations.** The board loads up to 100 tasks (the API maximum) and says so when more exist. HTML5 drag-and-drop doesn't work on touch screens — the per-card status menu is the touch/keyboard path. Authentication is out of scope for this assignment.

## API

Base URL: `http://localhost:4000/api` — full spec in [`docs/openapi.yaml`](docs/openapi.yaml) (open it in Swagger Editor).

| Method | Endpoint | Description | Success |
|---|---|---|---|
| GET | `/health` | Health check | 200 |
| GET | `/tasks` | List tasks. Query: `search`, `status`, `priority`, `sortBy` (`createdAt`\|`dueDate`), `order`, `page`, `limit` (≤100) | 200 |
| POST | `/tasks` | Create task | 201 |
| GET | `/tasks/stats` | Dashboard statistics | 200 |
| GET | `/tasks/:id` | Task details | 200 |
| PUT | `/tasks/:id` | Replace task | 200 |
| PATCH | `/tasks/:id` | Partial update | 200 |
| PATCH | `/tasks/:id/status` | Update status only | 200 |
| DELETE | `/tasks/:id` | Delete task | 204 |

Errors: `400` validation, `404` not found, `429` rate limited, `500` unexpected.

**Example**

```http
POST /api/tasks
{ "title": "Prepare demo", "priority": "HIGH", "dueDate": "2026-12-01T00:00:00.000Z" }
```
```json
{ "success": true, "data": { "id": "…", "title": "Prepare demo", "description": null, "status": "TODO",
  "priority": "HIGH", "dueDate": "2026-12-01T00:00:00.000Z", "isOverdue": false,
  "createdAt": "…", "updatedAt": "…" } }
```
```json
// 400
{ "success": false, "error": { "message": "Validation failed",
  "details": [ { "field": "title", "message": "Title must be at least 3 characters" } ] } }
```

## Database

Schema: [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma) · Migrations: [`backend/prisma/migrations`](backend/prisma/migrations)

`tasks(id uuid PK, title varchar(150), description text null, status enum, priority enum, dueDate timestamptz null, createdAt, updatedAt)` with indexes on `status`, `priority`, `dueDate`, `createdAt`.

## Testing

- **Backend** (`npm test`): sanitizer, Zod schemas, `TaskService` business rules (pagination, filters, 404s, PUT vs PATCH, overdue/stats) and full HTTP integration tests via Supertest against an in-memory repository.
- **Frontend** (`npm test`): form schemas, API client (envelope parsing, error mapping, network failure, 204), URL-param parsing.
- GitHub Actions runs type-check, tests and lint on every push.

## Screenshots

Located in [`docs/screenshots`](docs/screenshots):

1. `dashboard.png` — dashboard (light)
2. `tasks-list.png` — list with search/filters/pagination
3. `task-form-validation.png` — form with validation errors
4. `task-detail.png` — task details
5. `board.png` — Kanban board
6. `dark-mode.png` — dark theme
7. `mobile.png` — responsive view
