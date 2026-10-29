# Studyloom

Studyloom turns study topics and pasted text into simple, narrated video lessons for students and teachers.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/study-video-maker/` — lesson creation, playback, and local lesson library
- `artifacts/api-server/src/routes/study-lessons.ts` — lesson-script and narration API
- `lib/api-spec/openapi.yaml` — source of truth for the lesson API contract

## Architecture decisions

- Lesson content and narration are generated on demand through Replit's OpenAI AI integration.
- Saved lesson history stays in the current browser; lesson audio is generated when requested and not stored.

## Product

Students and teachers can enter a topic or paste study text, choose a learner level and lesson length, then generate a simple animated lesson with narration, scene-by-scene explanations, key terms, and takeaways. Recent lessons are saved locally on that device.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The generated lesson duration options must stay aligned with the labels in the frontend.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
