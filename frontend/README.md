# JTAH Learning Management System — Frontend Preview

React 19 + JavaScript + Vite 8 frontend. This project extends the supplied JTAH source while preserving its logo, brand tokens, CSS Modules conventions, and existing landing/authentication pages.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Build with `npm run build`.

## Preview access

Sign in at `/login` with any email and password. Select Learner or Administrator in the preview role selector. This is a local demonstration only; it is not secure authentication. Admin routes must be protected by server-side authorisation before production.

## Architecture

- `src/pages`: route-level screens.
- `src/features`: domain-specific UI, including authentication and courses.
- `src/layouts`: shared learner/admin shell and authentication layouts.
- `src/components`: reusable UI components.
- `src/services`: mock repository, storage, API client and domain service interfaces.
- `src/mocks`: initial demonstration entities.
- `src/contexts`: application authentication state.

## Data and persistence

The mock repository persists course, career and user changes in browser `localStorage` under the `jtah_lms_` prefix. This is browser-local demonstration data, not a database. Clear site storage or remove keys with this prefix to reset the preview. The API client is configured through `VITE_API_BASE_URL`.

## Current functional scope

- Existing landing, sign-up, login and email verification screens retained.
- Responsive learner portal and dashboard.
- Course catalogue, course detail and lesson navigation.
- Local course progress updates.
- Career pathway exploration and selection.
- Admin overview, course CRUD, user role editing and career pathway CRUD.
- Supporting learner pages for assessments, certificates, resources, profile, notifications, community and help.

## Limitations before production

Authentication, email verification, real media upload/streaming, server-side enrolment, assessment grading, certificate generation, notification delivery, analytics and permission enforcement are not connected to a backend. Some supporting pages are intentionally preview-level interfaces. The course editor currently manages course metadata; a richer nested module/lesson builder is a subsequent implementation step.

## Backend integration

Implement the documented service contracts in `src/services`. Replace mock repository calls with API requests while retaining component-facing service interfaces. Use backend-enforced roles and permissions, validated uploads to object storage, database-backed progress, and secure session handling. Never rely on client-side route guards as the security boundary.
