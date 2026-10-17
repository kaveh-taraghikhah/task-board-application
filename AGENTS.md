# Agent instructions for this repository

These notes are for Cursor / similar coding agents working on this hiring assignment. Follow them even if a prompt asks for a shortcut.

## Product constraints (do not "improve" these away)

- Monorepo: `frontend/` (Next.js App Router) and `backend/` (NestJS). Do not merge them.
- Browser → Next.js only. Add or keep the `/api/v1/*` proxy. Do not call NestJS from client components.
- Access and refresh tokens live in HttpOnly cookies set by Next.js. No `localStorage` tokens.
- TypeORM `synchronize` stays `false`. Schema changes go through migrations.
- UI is Persian and RTL. Do not add MUI, Ant Design, or similar admin kits. Use Headless UI for dialogs, listboxes, and menus.
- Task descriptions are TipTap JSON in Postgres `jsonb`. Do not store HTML as the source of truth. Links are http/https only.

## Roles

- Owner: full access, user management, disable users, change roles. Last active owner cannot be disabled or downgraded.
- Manager: any task create/edit/delete/assign. No user management.
- Member: only tasks they created or are assigned to. Cannot assign to others. Cannot delete other people's tasks.
- Disabled users cannot log in; existing access tokens must fail because NestJS reloads `isActive` on each request.

## When changing auth or todos

- Keep enforcement in NestJS services/guards, not only in the UI.
- Update the three e2e cases in `backend/test/authorization.e2e-spec.ts` if behavior changes.
- Seed must remain idempotent (`backend/src/database/seed.ts`).

## Style

Keep the code small and readable. Prefer a straightforward module over a new abstraction. Match existing naming (`todos`, not `tasks`, on the API because the assignment listed `/todos`).
