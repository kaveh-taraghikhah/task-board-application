# Architecture

## Request path

```
Browser (fa RTL)
  → Next.js (App Router, /api/v1/*)
      → NestJS (auth, users, todos)
          → PostgreSQL
```

Next.js is a backend-for-frontend, not just a static host. It:

1. Renders the Persian UI.
2. Proxies REST to NestJS.
3. Holds JWTs in HttpOnly cookies so JavaScript on the page cannot read them.

NestJS is the security boundary. Every protected handler uses JWT auth. User mutations require the owner role. Task list/get/update/delete apply member visibility in `TodosService`, not in React.

## Data model

- `users`: email, full name, argon2 hash, role enum, `isActive`.
- `refresh_tokens`: SHA-256 of the opaque token, expiry, optional `revokedAt`.
- `todos`: title, status, priority, due date, jsonb TipTap document, creator, assignee.

Relations are TypeORM many-to-one. The initial table layout is `backend/src/database/migrations/1730000000000-InitialSchema.ts`.

## Session

Login returns an access JWT (short) and a refresh token (long, random, hashed at rest). Next.js copies both into cookies and returns only `{ user }` to the browser.

On each API call, NestJS loads the user by `sub`. If the row is missing or `isActive` is false, the request is 401 even if the JWT signature is still valid. Disabling a user also revokes refresh rows so `/auth/refresh` cannot mint a new pair.

## TipTap

The editor and the read-only renderer both load the same JSON document. `validateTipTapDocument` walks the tree and rejects unknown nodes/marks and non-http(s) links. An empty `doc` with a paragraph (or empty content) is accepted.

## Why GET /users is not owner-only

The assignment lists user routes together with "(owner only)". Managers still need a directory to assign work, and the board filters by assignee. Reads are therefore allowed for any authenticated user. Creates and patches stay owner-only, and that split is covered by the member-cannot-modify-users test.
