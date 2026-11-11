# JTAH LMS — Backend Integration Contract (Draft)

This document is a technology-neutral starting point. It is not an implementation of a backend. All endpoints are proposed under `/api/v1` and should be refined against final product requirements.

## Conventions

- JSON request and response bodies unless an endpoint explicitly accepts `multipart/form-data`.
- Use stable opaque IDs (UUIDs or equivalent), ISO-8601 timestamps, pagination, and consistent validation errors.
- The backend is the source of truth. Browser localStorage is only for the frontend preview.
- Every administrative operation must be authorised on the server. Hiding an admin route or button is not security.
- Use secure, HTTP-only cookies for sessions where feasible. If bearer tokens are chosen, define refresh, expiry, revocation and storage rules explicitly.

## Authentication and identity

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Create a learner account |
| POST | `/auth/login` | Authenticate a user |
| POST | `/auth/logout` | End the current session |
| GET | `/auth/me` | Return current user and role/permission summary |
| POST | `/auth/verify-email` | Verify an email using a one-time code/token |
| POST | `/auth/resend-verification` | Send another verification message |
| POST | `/auth/password/forgot` | Request password reset |
| POST | `/auth/password/reset` | Complete password reset |

Suggested user fields: `id`, `fullName`, `email`, `status`, `roleIds`, `profileImageUrl`, `createdAt`, `updatedAt`, `lastLoginAt`.

## Courses and curriculum

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/courses` | List published courses; support search, category, level and pagination filters |
| GET | `/courses/:courseId` | Course details with published curriculum |
| POST | `/admin/courses` | Create course (admin/instructor permission) |
| PATCH | `/admin/courses/:courseId` | Update course metadata |
| DELETE | `/admin/courses/:courseId` | Archive or delete according to retention rules |
| POST | `/admin/courses/:courseId/publish` | Publish a course |
| POST | `/admin/courses/:courseId/modules` | Add a module |
| PATCH | `/admin/modules/:moduleId` | Update module |
| DELETE | `/admin/modules/:moduleId` | Delete module |
| POST | `/admin/modules/:moduleId/lessons` | Add lesson |
| PATCH | `/admin/lessons/:lessonId` | Update lesson |
| DELETE | `/admin/lessons/:lessonId` | Delete lesson |
| PATCH | `/admin/courses/:courseId/reorder` | Persist module/lesson ordering |

Course fields: `id`, `title`, `slug`, `description`, `categoryId`, `level`, `duration`, `instructorIds`, `thumbnailUrl`, `learningObjectives`, `prerequisites`, `status`, `publishedAt`, `createdAt`, `updatedAt`.

Module fields: `id`, `courseId`, `title`, `description`, `position`.

Lesson fields: `id`, `moduleId`, `title`, `description`, `type`, `contentReference`, `duration`, `position`, `completionRule`, `isPreview`.

## Enrolment and learner progress

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/courses/:courseId/enrolments` | Enrol current learner |
| GET | `/me/enrolments` | List current learner's courses |
| GET | `/me/courses/:courseId/progress` | Retrieve course progress |
| PUT | `/me/lessons/:lessonId/progress` | Save lesson completion/progress |
| GET | `/me/activity` | Recent learning activity |

Progress must be associated with a user and lesson on the server. Do not trust a client-supplied completion percentage without validating completion rules.

## Learning materials and uploads

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/materials` | List authorised resources |
| POST | `/admin/materials/upload` | Upload file and create metadata |
| PATCH | `/admin/materials/:materialId` | Update metadata or associations |
| DELETE | `/admin/materials/:materialId` | Remove or archive a resource |

Material fields: `id`, `title`, `description`, `type`, `mimeType`, `fileSize`, `storageKey`, `url`, `courseId`, `moduleId`, `lessonId`, `visibility`, `uploadedBy`, `createdAt`.

Use object storage for file bytes. The database should store metadata and storage references, not large file blobs. Validate file type, size, access permissions and malware scanning requirements.

## Assessments

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/courses/:courseId/assessments` | List available assessments |
| GET | `/assessments/:assessmentId` | Fetch learner-safe assessment definition |
| POST | `/assessments/:assessmentId/submissions` | Submit an attempt |
| GET | `/me/assessment-submissions` | Learner assessment history |
| POST | `/admin/assessments` | Create assessment |
| PATCH | `/admin/assessments/:assessmentId` | Update assessment |
| GET | `/admin/assessments/:assessmentId/results` | View results (authorised staff) |

Do not expose correct answers in learner-facing assessment payloads before submission. Store attempt, answers, score, feedback and timestamps server-side.

## Career pathways

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/career-pathways` | List published pathways |
| GET | `/career-pathways/:pathwayId` | Get pathway, stages, skills, roles and resources |
| PUT | `/me/career-pathways/:pathwayId` | Select or update learner's pathway |
| GET | `/me/career-progress` | Get learner pathway progress |
| PUT | `/me/career-stages/:stageId/progress` | Update milestone progress |
| POST | `/admin/career-pathways` | Create pathway |
| PATCH | `/admin/career-pathways/:pathwayId` | Update pathway |
| DELETE | `/admin/career-pathways/:pathwayId` | Archive/delete pathway |

Career entities: `CareerPathway`, `CareerStage`, `Skill`, `CareerRole`, `CareerResource`, and a learner-to-pathway progress relationship. Course associations should use IDs rather than embedded hardcoded UI content.

## Users, roles and permissions

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/admin/users` | Search and paginate users |
| GET | `/admin/users/:userId` | View user detail |
| PATCH | `/admin/users/:userId` | Update permitted profile/status fields |
| PUT | `/admin/users/:userId/roles` | Assign roles |
| GET | `/admin/roles` | List roles |
| GET | `/admin/permissions` | List permissions |

Recommended roles: `learner`, `instructor`, `administrator`. Define granular permissions for course publishing, user administration, assessment management, reporting and platform configuration.

## Notifications and announcements

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/me/notifications` | List notifications |
| PATCH | `/me/notifications/:notificationId/read` | Mark notification read |
| GET | `/announcements` | List announcements visible to current user |
| POST | `/admin/announcements` | Create announcement |
| PATCH | `/admin/announcements/:announcementId` | Update/publish announcement |

## Certificates and reporting

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/me/certificates` | List learner certificates |
| GET | `/certificates/verify/:verificationCode` | Public certificate verification |
| GET | `/admin/reports/overview` | Platform overview metrics |
| GET | `/admin/reports/enrolments` | Enrolment report |
| GET | `/admin/reports/completions` | Completion report |
| GET | `/admin/reports/assessments` | Assessment performance report |

Certificates should be generated only after server-side completion and assessment criteria have been met.

## Standard response and error shape

Example success:

```json
{
  "data": {},
  "meta": { "requestId": "..." }
}
```

Example validation error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "fields": { "title": "This field is required." }
  },
  "meta": { "requestId": "..." }
}
```

## Suggested database entities

`users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `courses`, `course_categories`, `course_instructors`, `course_modules`, `lessons`, `materials`, `enrolments`, `lesson_progress`, `assessments`, `assessment_questions`, `assessment_options`, `assessment_attempts`, `assessment_answers`, `certificates`, `certificate_verifications`, `career_pathways`, `career_stages`, `skills`, `career_stage_skills`, `career_pathway_courses`, `career_resources`, `learner_career_paths`, `learner_career_stage_progress`, `announcements`, `notifications`, and `audit_logs`.
