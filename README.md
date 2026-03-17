# SalesTrack Academy

SalesTrack Academy is a full-stack internal learning platform for sales teams. Admins can create courses, lessons, quizzes, groups, invitations, and assignments, while agents can complete training, take assessments, track progress, and download completion certificates.

This repository is a pnpm + Turborepo monorepo with a Next.js frontend, a NestJS API, shared contracts/config packages, Prisma/PostgreSQL data access, and S3-backed file storage.

## What the product does

- Admins manage users, groups, courses, lessons, quizzes, assignments, analytics, and invitations.
- Agents work through assigned learning content, complete quizzes, follow their progress, and download certificates.
- Lesson content supports text, PDF, audio, and video.
- Files are uploaded through presigned S3 URLs.
- Invitation emails are sent over SMTP, with a manual fallback invite link when SMTP is unavailable.

## Tech stack

- Monorepo tooling: `pnpm`, `turbo`
- Frontend: Next.js 16, React 19, App Router, TypeScript
- UI layer: Tailwind CSS v4, Base UI, class-variance-authority, lucide-react, Sonner
- Backend: NestJS 11, Passport, JWT, Swagger, Zod validation via `nestjs-zod`
- Database: PostgreSQL
- ORM: Prisma
- Storage: AWS S3 via AWS SDK v3
- Email: Nodemailer
- PDF generation: PDFKit

## Repository layout

```text
apps/
  api/        NestJS API
  web/        Next.js frontend

packages/
  config/     Shared env parsing and validation
  contracts/  Shared request/response contracts and enums
  database/   Prisma schema, client, and seed script
  storage/    S3 client and presigned URL helpers

infra/
  docker-compose.yml
```

## Architecture overview

### Frontend

The web app lives in `apps/web` and uses the Next.js App Router.

Key route areas:

- `/` marketing landing page
- `/public/login`, `/public/signup`, `/public/accept-invite`
- `/dashboard/admin/*`
- `/dashboard/agent/*`

Auth state is bootstrapped client-side through `AuthProvider`, while route protection is enforced in `apps/web/src/proxy.ts` by reading the `access_token` cookie and redirecting users based on role.

### Backend

The API lives in `apps/api` and exposes resources under the `/api` prefix.

Main Nest modules:

- `AuthModule`
- `UsersModule`
- `GroupsModule`
- `CoursesModule`
- `LessonsModule`
- `QuizzesModule`
- `CommentsModule`
- `AnalyticsModule`
- `StorageModule`
- `MailModule`
- `CertificatesModule`
- `HealthModule`

Global API behavior:

- cookie parsing
- CORS with credential support
- Helmet security headers
- Zod-based validation
- unified error formatting
- `{ data: ... }` response wrapping
- optional Swagger docs at `/api/docs`

### Shared packages

- `@salestrack/config` validates API and web environment variables.
- `@salestrack/contracts` shares Zod schemas, enums, and API-facing TypeScript types.
- `@salestrack/database` owns Prisma schema/client/seed responsibilities.
- `@salestrack/storage` wraps S3 clients and presigned upload/download URL generation.

## Core domain model

The Prisma schema currently models:

- users and refresh tokens
- invitations
- groups and group memberships
- courses
- lessons
- quizzes, questions, and answer options
- course assignments
- lesson progress
- quiz attempts
- comments
- certificates

Important business rules currently encoded in the codebase:

- roles are `ADMIN` and `AGENT`
- groups are intended for agents and course assignment workflows
- course completion drives certificate generation
- certificates are generated as PDFs and stored in S3

## Authentication model

The application uses cookie-based auth with:

- short-lived `access_token` cookies
- rotating `refresh_token` cookies

The API also supports bearer-token auth in Swagger/testing scenarios, but the browser app is designed around cookies.

Important production implication:

- if the frontend and API are deployed as separate apps, they should share a parent custom domain, for example `app.example.com` and `api.example.com`
- set `COOKIE_DOMAIN=.example.com` so the web app and API can see the auth cookies correctly

## File storage model

Uploads are a two-step flow:

1. the frontend requests a presigned upload URL from the API
2. the browser uploads directly to S3
3. the frontend confirms the upload with the API

Because uploads happen from the browser directly to S3, production buckets must have CORS configured for the deployed web origin.

## Certificates

Certificates are handled server-side:

- the API verifies that the course is completed and all quizzes are passed
- a PDF is generated with PDFKit
- the PDF is uploaded to S3
- certificate metadata is stored in PostgreSQL
- agents can later list and download their own certificates

## Local development

### Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL 16 locally, or Docker

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example env file and fill in values:

```bash
cp .env.example .env
```

At minimum for local development you need:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL`

Features that require extra infrastructure:

- uploads/certificates need `AWS_S3_*`
- invitation email needs `SMTP_*`

### 3. Start PostgreSQL

Option A: use your own local Postgres instance.

Option B: use Docker Compose:

```bash
docker compose -f infra/docker-compose.yml up -d postgres
```

### 4. Generate Prisma client and create the schema

```bash
pnpm db:generate
pnpm db:push
```

### 5. Seed sample data

```bash
pnpm db:seed
```

The seed currently creates:

- `admin@salestrack.com / Password123!`
- `agent@salestrack.com / Password123!`
- one sample group
- one sample course with lessons and a quiz

### 6. Run the monorepo in development

```bash
pnpm dev
```

Default local URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/api/docs`

## Useful scripts

From the repository root:

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm db:generate`
- `pnpm db:push`
- `pnpm db:migrate`
- `pnpm db:seed`
- `pnpm db:studio`

## Database workflow note

There is currently no committed `packages/database/prisma/migrations` directory in the repository.

That means the current workflow is schema-first with:

- `pnpm db:push` for syncing schema changes
- `pnpm db:seed` for sample data

For production bootstrapping, this repo currently assumes `db push` rather than checked-in Prisma migrations.

## Docker support

`infra/docker-compose.yml` can run:

- PostgreSQL
- the NestJS API
- the Next.js web app

Example:

```bash
docker compose -f infra/docker-compose.yml up --build
```

Note:

- uploads and certificates still require valid S3 credentials
- invitation email still requires valid SMTP credentials

## Deployment notes

### Vercel

This repo is designed to work well as two Vercel projects:

- `apps/api`
- `apps/web`

Recommended build commands:

- API: `pnpm -w turbo build --filter=api...`
- Web: `pnpm -w turbo build --filter=web...`

Important environment variables:

- API: `DATABASE_URL`, `JWT_SECRET`, `AWS_S3_*`, `FRONTEND_URL`, `FRONTEND_URLS`, `COOKIE_SAME_SITE`, `COOKIE_DOMAIN`
- Web: `NEXT_PUBLIC_API_URL`

If you deploy web and API separately, use a shared custom domain and subdomains so cookie auth works reliably.

Example:

- web: `https://sales-track-academy.xyz`
- api: `https://api.sales-track-academy.xyz`
- `COOKIE_DOMAIN=.sales-track-academy.xyz`

### S3

Production uploads will fail unless:

- the bucket exists
- the credentials are valid
- the region matches
- the bucket CORS rules allow the deployed web origin

### SMTP

Invitation email will not send unless:

- `SMTP_HOST`
- `SMTP_USER`
- `SMTP_PASS`

are configured together.

When SMTP is absent or fails, the app falls back to returning a manual invite URL in the API response.

## Feature surface today

The codebase already includes:

- role-based login and signup
- invite-based account creation
- admin user management
- agent groups
- multimedia course and lesson management
- quiz creation, editing, submission, and scoring
- assignments to users and groups
- agent and org analytics
- lesson comments
- avatar uploads
- PDF certificates and download flow
- marketing landing page and public auth pages

## Current constraints and implementation notes

- The app is currently forced to light theme in the root layout.
- The web app relies on cookies for dashboard access, so auth-sensitive deployments should be planned carefully.
- Some operational behavior, such as invitation email and uploads, depends heavily on infrastructure being configured correctly.
- Because the database workflow currently leans on `db push`, schema discipline matters before production changes.

## Suggested next improvements

- introduce checked-in Prisma migrations
- add automated tests around auth, assignments, and quiz workflows
- add draft autosave for longer admin forms
- improve CI validation for env and deployment assumptions

