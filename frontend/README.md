# JTAH Learning Management System

Stage 02 completes the frontend for the JTAH Learning Management System: the learner portal (Stage 01) plus the administrator control centre. The platform is intended for learners, instructors and non-technical administrators. Everything is still frontend-only; it does not claim production authentication or backend persistence.

## Technology

- React 19 and JavaScript ES Modules
- Vite 8
- React Router DOM 7
- Lucide React
- CSS Modules and shared global design tokens

## Run locally

```bash
npm ci
cp .env.example .env
npm run dev
```

Create a production bundle with `npm run build`, and preview it with `npm run preview`.

## Preview access and security

The current sign-in experience uses mock authentication. It is suitable only for local UI evaluation. Browser-local data is not a secure database, and client-side route guards are not an authorisation boundary. Do not deploy this preview with real learner data. A Python backend must implement identity verification, sessions/tokens, server-side role enforcement and durable persistence.

## Project structure

- `src/pages`: route-level screens.
- `src/features`: domain-specific interfaces (authentication, landing, courses, lessons and the administrator control centre in `features/admin`).
- `src/layouts`: authentication, centred and learner/admin application shells.
- `src/components`: reusable interface components.
- `src/contexts`: shared authentication state.
- `src/services`: API client, domain service interfaces and mock repository.
- `src/mocks`: initial demonstration data.
- `src/styles`: brand tokens and global responsive styles.

## Configuration

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the backend API root when integration is introduced. The current frontend service implementations use the mock repository; setting the URL alone does not activate a backend.

## Current frontend scope

- JTAH landing and authentication UI.
- Learner dashboard, course catalogue, course details and structured lesson interface.
- Career pathway exploration.
- Supporting learner routes for assessments, certificates, resources, community, help, profile and notifications.
- Administrator preview routes for overview, courses, users, pathways, materials, assessments, reports and settings.
- Local mock data and service boundaries intended to ease later API integration.

## Stage 01 learner dashboard improvements

Dashboard metrics are derived from course and lesson data. The page now includes loading and error states, a next-incomplete-lesson action, a career pathway entry point and responsive dashboard styling. Motion is subtle and honours `prefers-reduced-motion`.

## Known limitations

Authentication, email verification, role enforcement, media upload/streaming, assessment grading, certificate generation, notification delivery, analytics and shared persistence are not connected to a backend. Some supporting learner pages remain preview-level interfaces. The course editor manages metadata and does not yet provide a complete nested module/lesson authoring workflow.

See `BACKEND_API_SPEC.md`, `CHANGELOG.md` and `IMPLEMENTATION_STATUS.md` for integration guidance and stage notes.

## Administrator control centre (Stage 02)

Sign in with an email and choose the **Administrator** role on the preview login screen, then open `/admin`.

| Area | Route | What it does |
| --- | --- | --- |
| Overview | `/admin` | Statistics, charts, recent registrations, activity log, announcements |
| Courses | `/admin/courses` | Create, edit, publish, unpublish, archive, delete; curriculum builder at `/admin/courses/:id/edit` |
| Users | `/admin/users` | Search/filter, profile, enrolments, activate/deactivate, roles |
| Career pathways | `/admin/pathways` | Roles, skills, milestones, linked courses and resources |
| Learning materials | `/admin/materials` | Upload/link files, categories, visibility, attach to courses/modules, preview |
| Assessments | `/admin/assessments` | Multiple-choice and written questions, marks, pass mark, preview |
| Reports | `/admin/reports` | Enrolment, popularity, completion, assessment charts, CSV export |
| Settings | `/admin/settings` | Identity, branding, preferences, categories, demo-data reset |

Content marked **draft** or **archived** is hidden from learners; only **published** content appears in the learner portal.

### Demo-data limits

All data is stored in the browser (`localStorage`). Uploaded files are kept only when under 600 KB; larger files keep their name only until the backend stores files. Use **Settings > Account > Reset demo data** to restore the seed content.
