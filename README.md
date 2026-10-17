# Task Board

A small production-style task board. The browser talks only to Next.js. NestJS owns authentication, authorization, and persistence.

This repository is a monorepo:

```
frontend/          Next.js App Router (Persian RTL UI)
backend/           NestJS API
docs/              architecture, AI workflow, demo notes
docker-compose.yml PostgreSQL
AGENTS.md          project-specific AI instructions
```

## Environment setup

You need Node.js 20+ (22 is fine), npm, and Docker or Podman with Compose.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Local defaults in those files match `docker-compose.yml`. Change `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` before any shared environment.

## Docker Compose (PostgreSQL)

```bash
docker compose up -d
```

This starts Postgres 16 on `localhost:5432` with database/user/password `taskboard`.

## Database migrations

Schema is created only through TypeORM migrations. `synchronize` is disabled.

```bash
cd backend
npm install
npm run migration:run
```

## Seed

Public registration is not part of this product. The first accounts come from the seed script, which skips emails that already exist.

```bash
cd backend
npm run seed
```

### Sample credentials

| Role    | Email                     | Password         |
|---------|---------------------------|------------------|
| Owner   | owner@taskboard.local     | OwnerPass123!    |
| Manager | manager@taskboard.local   | ManagerPass123!  |
| Member  | member@taskboard.local    | MemberPass123!   |

Passwords are stored with argon2.

## Run the apps

Terminal 1:

```bash
cd backend
npm run start:dev
```

Terminal 2:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. Next.js proxies `/api/v1/*` to NestJS on port 3001 and stores access/refresh tokens in HttpOnly cookies. The browser never calls NestJS directly.

## Tests

Postgres must be up, and migrations must have been applied.

```bash
cd backend
npm test
```

Covered cases:

1. A member cannot view another user's tasks.
2. A member cannot create or patch users.
3. After an owner disables a user, that user's existing access token stops working.

## Architecture decisions

- **BFF proxy.** Assignment requires the browser to talk only to Next.js. The route `frontend/src/app/api/v1/[...path]/route.ts` forwards REST calls, attaches `Authorization` from the access cookie, and never persists raw tokens in `localStorage`.
- **HttpOnly cookies.** NestJS issues JWT access tokens and opaque refresh tokens. Next.js is the only layer that writes cookies. Refresh tokens are stored in Postgres as SHA-256 hashes, not plaintext.
- **Authorization in NestJS.** Role checks and task visibility live in services/guards. Hiding buttons in the UI is not treated as security.
- **Disabled users.** Login is rejected when `isActive` is false. JWT validation reloads the user on every request. Disabling a user also revokes outstanding refresh tokens.
- **Last owner.** The last active owner cannot be disabled or downgraded.
- **TipTap.** Descriptions are JSON documents in `jsonb`. The API allows a small node/mark set (paragraph, headings, lists, blockquote, bold, italic, http(s) links). Empty documents are valid. The read-only view uses the same JSON, not HTML as source of truth.
- **GET /users.** Write endpoints (`POST`, `PATCH`) are owner-only, matching the assignment. `GET /users` is available to authenticated users so managers can assign work and everyone can filter by assignee. Members still cannot change users.

## Known limitations

- There is no public registration and no UI for creating an owner. That matches the assignment; owners come from seed.
- Priority values were not enumerated in the brief. The app uses `low`, `medium`, `high`.
- Access tokens last 15 minutes; the frontend retries once via `/auth/refresh`.
- A Persian demo video is required by the assignment. I did not commit a binary recording in git. The speaking outline is in `docs/demo-video.md` so the recording can be made in under five minutes.
- The Compose file runs the database only. Apps are started with npm for a simpler local loop.

More detail: `docs/architecture.md`, `docs/ai-workflow.md`.
