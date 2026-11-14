# Changelog

## Stage 02 — Administrator control centre and frontend completion

### Added
- Administrator dashboard: learner/course counts, completion rate, enrolment, status and completion charts (lightweight SVG, no chart dependency), recent registrations, activity log and announcements (create/delete).
- Course management: list with search and filters, create/edit form with validation, thumbnail upload, objectives, category/level/duration/instructor, draft/publish/unpublish/archive/restore/delete with confirmations, publish checks.
- Curriculum builder: add, rename, delete and reorder modules and lessons; five lesson types (video, text, PDF/document, external link, downloadable resource); lesson preview and full learner preview.
- Learning materials: file/link upload with drag-and-drop, categories, visibility, course/module association, preview (image, PDF, video, text), archive and delete.
- User management: search, role/status filters, pagination, learner profile with enrolments and progress, enrol/remove, activate/deactivate, role changes with confirmation; admins cannot lock themselves out.
- Career pathway management: roles, skills, ordered milestones, linked courses and resources, draft/publish/archive.
- Assessment management: multiple-choice and written questions, marks, pass mark, time limit, course/module link, validation, learner-style preview with answer key.
- Reports: enrolment, popularity, completion, assessment performance, course comparison table and CSV export.
- Settings: identity, branding, administration, notification, learning and account preferences; category lists; demo-data reset.
- Shared admin UI kit: modal, confirm dialog, toasts, tabs, form fields, tag input, file drop, skeleton/empty/error states.
- Service layer: user, material, assessment, announcement, settings, activity and analytics services (async, with simulated latency); every admin change is written to the activity log.

### Changed
- Learner portal now shows only published courses and pathways (`isLive`); legacy records without a status remain visible.
- The learning interface renders lessons by type through the shared `LessonViewer`.
- Mock repository returns copies of its data and reports storage-full errors instead of failing silently.
- Sidebar highlights the active admin section on nested pages.
- Replaced the compact Stage 01 admin preview pages; icon imports use canonical lucide names.

### Fixed
- Seed data could be modified in place by repository writes (found by the new tests).

## Stage 01 — Frontend refinement and learner experience

- Retained the supplied JTAH identity, logo assets, existing routes, CSS Modules, React/Vite stack and API specification.
- Refined the learner dashboard to load through the course and career service interfaces, expose loading and failure states, and calculate completed lessons from course lesson data rather than displaying a fixed figure.
- Added a next-lesson action that takes learners directly to the relevant learning interface.
- Improved dashboard information hierarchy and responsive presentation.
- Added shared spacing, shadow and transition tokens; standardised dashboard typography and interaction affordances.
- Added subtle page entrance and skeleton loading animations, with reduced-motion support.
- Added `.env.example` and clarified frontend preview limitations in the project documentation.

### Scope note
This stage deliberately does not implement the Python backend. Existing mock authentication and browser-local persistence remain demonstrations, not production security or database persistence.
