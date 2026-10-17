# AI-assisted development

I used Cursor Agent on this assignment. The policy in the brief allows that; the work still had to be checked by hand.

## What the agent helped with

- NestJS module layout, TypeORM entities, and the first migration.
- Next.js App Router pages, the `/api/v1/*` proxy, and Headless UI dialogs.
- Boilerplate for TipTap editor/viewer wiring.
- First draft of README sections.

## What I insisted on reviewing myself

- Cookie handling: tokens must not leak back to the browser JSON after login.
- Disabled-user behavior: JWT signature is not enough; `isActive` is loaded from the database.
- Member visibility on `GET /todos` and `GET /todos/:id`.
- Last-owner protection.
- TipTap allow-list (especially links).
- The three required automated tests against a real Postgres.

Project-specific instructions for later sessions are in `AGENTS.md` and `.cursor/rules/task-board.mdc`. Those files exist so an agent does not "helpfully" add `localStorage` auth or turn `synchronize` back on.

## What I would not outsource

Role rules, seed credentials, and the final README wording. Those need to match the brief exactly and read like a person who understood the product, not a template.
