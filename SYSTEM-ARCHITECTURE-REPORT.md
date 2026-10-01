# Student Management System — Architecture Report

## 1. System purpose

This project is a modular Student Information System (SIS) for academic administrators. Its current MVP supports student records, courses, enrollment, grades, attendance, analytics, export/import, and one superuser login.

## 2. High-level architecture

```text
Browser
  │ React + TypeScript + Vite
  │ HTTP Basic authentication / JSON REST calls
  ▼
Spring Boot REST API
  │ Controllers → Services → Repositories → JPA entities
  ▼
PostgreSQL
```

The project is intentionally a **modular monolith**: one frontend application and one backend application, with business areas separated by feature/domain.

## 3. Repository structure

```text
RI_SMS_APP/
├── frontend/
│   └── src/
│       ├── app/             # App shell, routes, state, authentication
│       ├── components/      # Reusable UI and feature views
│       ├── features/        # Students, courses, attendance, analytics APIs/types
│       ├── services/        # Shared API client
│       ├── data/            # Development fallback/demo data
│       └── types.ts         # Shared frontend domain types
├── backend/
│   └── src/main/java/com/rockstar/ri/
│       ├── config/           # Security, CORS, demo data initialization
│       ├── controller/       # REST endpoints
│       ├── service/          # Business rules and transactions
│       ├── repository/       # Spring Data JPA repositories
│       ├── model/            # Student, Course, Enrollment, Attendance entities
│       ├── dto/              # Request/response payload objects
│       └── exception/        # Centralized API error handling
├── docs/                    # Architecture and roadmap documentation
├── docker-compose.yml       # PostgreSQL, backend, and frontend services
└── .env.example             # Local/Docker configuration template
```

The detailed current database relationship model is documented in
[`docs/DATABASE-RELATIONSHIPS.md`](docs/DATABASE-RELATIONSHIPS.md).

## 4. Frontend flow

```text
AuthProvider/AuthGate
  → AppProviders/AppStoreProvider
  → AppRoutes
  → Feature views and modals
  → feature API modules
  → shared apiClient
  → Spring Boot API
```

The application store coordinates students, courses, enrollments, attendance, activity logs, and local persistence. The Academic Record is the main student workflow and combines overview, courses/grades, attendance, and advising notes.

Search is intentionally located inside the Students and Courses views rather than the top navigation. Course creation can optionally select multiple existing students; the frontend creates the course, enrolls selected students through the enrollment API, and immediately reflects successful enrollment responses in the visible roster.

## 5. Backend flow

```text
HTTP request
  → Security filter
  → REST controller
  → validation and DTO mapping
  → service business rules
  → repository/database transaction
  → JSON response or standardized error
```

The backend uses PostgreSQL in Docker, JPA/Hibernate for persistence, validation for request input, and Actuator for health checks.

## 6. API inventory

Base URL:

```text
http://localhost:8080/api/v1
```

### Authentication

| Method | Endpoint | Usage |
|---|---|---|
| GET | `/auth/login` | Authenticated superuser handshake |

### Students

| Method | Endpoint | Usage |
|---|---|---|
| GET | `/students` | List students; optional `department` filter |
| GET | `/students/{id}` | Get one student |
| POST | `/students` | Create student |
| PUT | `/students/{id}` | Update student |
| DELETE | `/students/{id}` | Delete/archive student |
| POST | `/students/batch-status` | Update multiple student statuses |

### Courses

| Method | Endpoint | Usage |
|---|---|---|
| GET | `/courses` | List courses |
| GET | `/courses/search?q=...` | Search courses |
| GET | `/courses/{id-or-code}` | Get one course |
| POST | `/courses` | Create course |
| PUT | `/courses/{id}` | Update course |
| DELETE | `/courses/{id}` | Delete course |

### Enrollments

| Method | Endpoint | Usage |
|---|---|---|
| GET | `/enrollments` | List enrollments |
| GET | `/enrollments/{id}` | Get enrollment |
| GET | `/enrollments/student/{studentId}` | Student enrollments |
| GET | `/enrollments/course/{courseId}` | Course enrollments |
| POST | `/enrollments/courses/{courseId}/enroll` | Enroll student |
| PATCH | `/enrollments/{id}/status` | Change enrollment status |
| PUT | `/enrollments/{id}/grade` | Assign/update grade |
| DELETE | `/enrollments/{id}` | Remove enrollment |

### Attendance

| Method | Endpoint | Usage |
|---|---|---|
| GET | `/attendance` | List attendance records |
| GET | `/attendance/course/{courseId}/date/{date}` | Course attendance for a date |
| GET | `/attendance/student/{studentId}/course/{courseId}` | Student attendance history |
| GET | `/attendance/student/{studentId}/course/{courseId}/statistics` | Attendance statistics |
| POST | `/attendance/course/{courseId}/date/{date}` | Mark one attendance record |
| POST | `/attendance/bulk` | Save a complete attendance sheet |

### Operations

```text
GET /actuator/health
```

## 7. Frontend best practices

- Keep API calls inside feature API modules, not directly inside visual components.
- Use shared TypeScript types and explicit request/response types.
- Keep business state in the application store, while components remain focused on display and user interaction.
- Show loading, empty, success, and error states for every server operation.
- Do not silently treat failed server writes as successful local writes in production.
- Keep Academic Record actions connected to backend persistence and refresh data after mutations.
- Use route-level or feature-level code splitting when the application grows.
- Never place real secrets in Vite environment variables; frontend variables are visible to users.

## 8. Backend best practices

- Keep controllers thin; put business rules in services.
- Validate all request DTOs at the API boundary.
- Use response DTOs instead of exposing JPA entities directly as the system grows.
- Enforce authorization in the backend, not only by hiding frontend buttons.
- Use transactions for enrollment, grade, attendance, and GPA updates.
- Add database constraints for uniqueness and referential integrity.
- Return consistent error bodies and appropriate HTTP status codes.
- Add audit events for grade, attendance, enrollment, and student-record changes.
- Replace the MVP Basic Auth/in-memory user with a persistent identity provider, JWT, or secure HTTP-only cookie session before production.
- Keep credentials in deployment secrets and remove the default password.
- Use database migrations such as Flyway or Liquibase instead of relying on `ddl-auto=update` in production.

### 8.1 Flyway and JPA schema ownership

Flyway and JPA have different responsibilities and should not both modify the
production schema:

```text
Flyway migrations  → create and change PostgreSQL schema
JPA/Hibernate      → map entities and validate the schema
DataInitializer    → insert development/demo data only
```

The current MVP uses a transitional setup. Docker runs Hibernate with
`ddl-auto=update`, while Flyway applies the numbered migrations under
`backend/src/main/resources/db/migration`:

```text
V1__tighten_academic_constraints.sql
V2__require_course_terms.sql
V3__widen_enrollment_reference_ids.sql
V4__widen_attendance_reference_ids.sql
```

On startup the order is:

```text
PostgreSQL available
  → Flyway validates and applies pending migrations
  → Hibernate creates/updates missing tables in the MVP configuration
  → DataInitializer inserts demo data
  → GPA values are rebuilt from enrollment grades
  → application health check becomes available
```

Flyway records applied migrations in `flyway_schema_history`. A migration that
has already run must never be edited; add a new version instead:

```text
V5__complete_initial_schema.sql
V6__add_course_offerings.sql
V7__add_audit_columns.sql
```

The recommended production transition is:

1. Back up PostgreSQL.
2. Add a complete initial-schema migration that can create all tables on a
   clean database while preserving existing data.
3. Test that migration against both a clean database and the existing
   database.
4. Change Docker from `SPRING_JPA_HIBERNATE_DDL_AUTO=update` to
   `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`.
5. Let Flyway own all future schema changes.

Production configuration should eventually be:

```properties
spring.flyway.enabled=true
spring.jpa.hibernate.ddl-auto=validate
```

Do not use `ddl-auto=create`, `create-drop`, or `update` against a production
database. The test profile may continue to use H2 with `create-drop` for fast
unit tests, but PostgreSQL/Testcontainers integration tests should also run
Flyway migrations because H2 does not reproduce every PostgreSQL behavior.

### 8.2 Data initialization rules

`DataInitializer` is not a schema migration. It is currently a development
convenience that creates sample students, courses, enrollments, and attendance
when the tables are empty. It also recalculates cached GPA values from actual
enrollment grades during startup.

Before production, run demo initialization only under a development profile:

```java
@Profile("demo")
```

Production startup should never insert demo records based only on a row count.
Schema structure belongs in Flyway; real application data belongs in API
transactions or controlled data-import jobs.

## 9. Local/Docker usage

```bash
cp .env.example .env
docker compose up -d --build
```

Frontend:

```text
http://localhost:3000
```

Backend health:

```text
http://localhost:8080/actuator/health
```

## 10. Current MVP limitations

- Authentication is suitable for a showcase, not production.
- The application currently has one superuser role.
- Demo data initialization is intended for local demonstration.
- Backend integration requires Maven dependencies to be available.
- Advanced authorization, audit history, finance, multi-campus support, and production observability are future phases.

## 11. Database model and relationships

```text
students 1 ────────< enrollments >──────── 1 courses
   │                                        │
   └────────< attendance_records >─────────┘
   │
   └────────< student_notes
```

| Table | Purpose | Important constraints |
|---|---|---|
| `students` | Student identity and academic profile | Unique `student_id`; case-insensitive unique email; department/status/email indexes |
| `courses` | Course catalog and capacity | Unique course code; required semester; capacity and enrolled counter |
| `enrollments` | Student-course relationship | Foreign keys to students/courses; unique `(student_id, course_id, semester)` |
| `attendance_records` | Attendance by student, course, and date | Foreign keys to students/courses; unique `(student_id, course_id, date)` |
| `student_notes` | Student notes collection | Foreign key to `students.id` |

The API sends IDs rather than nested database objects. JPA maps the foreign-key relationships, while services control enrollment, capacity, grade, GPA, and attendance rules.

Relationship behavior:

- A student can have many enrollments.
- A course can have many enrollments.
- An enrollment can have many attendance records over time.
- A student cannot be enrolled twice in the same course and semester.
- Saving attendance for the same student/course/date updates the existing row.
- Student deletion removes dependent enrollments and attendance through the service layer before deleting the student; soft deletion is preferred for production history.

The `courses.enrolled` counter is maintained by transactional enrollment services. The frontend also derives the visible course-card count from loaded enrollments and temporarily merges successful enrollment responses so the roster updates immediately.

GPA is derived from graded enrollments and course credits. New students start
at `0.00`; `In Progress` grades are excluded; and the backend recalculates GPA
after grade, enrollment, deletion, and startup-reconciliation operations.
Attendance may be recorded only for an active enrollment. Attendance records
are unique per student, course, and date, and `Excused` sessions are excluded
from the attendance-rate denominator.

## 12. Analytics API

```text
GET /api/v1/analytics/overview
GET /api/v1/analytics/overview?term=Fall%202026&department=Computer%20Science
```

The endpoint uses request and response DTOs and returns:

```json
{
  "totalStudents": 20,
  "averageGPA": 3.12,
  "activeCourses": 3,
  "departmentDistribution": [],
  "term": "Fall 2026",
  "department": null,
  "generatedAt": "2026-09-30T09:00:00Z"
}
```

The backend is authoritative when available. The frontend keeps local calculations only as an offline/demo fallback.

## 13. End-to-end feature flows

### Enrollment and course roster

```text
Course UI
  → AppStore.enrollStudentInCourse
  → POST /api/v1/enrollments/courses/{courseId}/enroll
  → validate student, course, semester, capacity, and uniqueness
  → insert enrollment and update course counter
  → return enrollment
  → update React store and visible roster
```

### Attendance register

```text
Attendance UI
  → build one record per enrolled student
  → POST /api/v1/attendance/bulk
  → validate course, date, student, and enrollment
  → insert or update by student/course/date
  → update store and show “Register Saved!”
```

### Grade update

```text
Course roster
  → PUT /api/v1/enrollments/{id}/grade
  → update enrollment grade
  → recalculate weighted student GPA
  → return updated enrollment
```

## 14. Startup data and schema migrations

`DataInitializer` preserves existing records and ensures the database contains at least 20 students on startup. Missing demo records use deterministic IDs and emails, so restarts are idempotent. This creates 20 student records, not 20 login accounts; authentication remains a separate single-superuser MVP feature.

Flyway migrations are stored in `backend/src/main/resources/db/migration`:

```text
V1__tighten_academic_constraints.sql
V2__require_course_terms.sql
V3__widen_enrollment_reference_ids.sql
V4__widen_attendance_reference_ids.sql
```

Existing PostgreSQL databases are baselined at version `0`, then upgraded
through numbered migrations. The current Docker setup is transitional:
Flyway applies versioned changes and Hibernate uses `ddl-auto=update` to create
missing tables. The production target is a complete initial-schema migration
followed by `ddl-auto=validate`. H2 test runs disable PostgreSQL-specific
Flyway scripts and use JPA test schema creation; PostgreSQL integration tests
are still recommended for migration verification.

## 15. Verification status

- `npm run lint` passes.
- `npm run build` passes.
- `./mvnw test` passes.
- Docker PostgreSQL migrations apply successfully.
- Live API flows verified for student creation, enrollment, attendance, grade/GPA updates, deletion cascades, analytics, and startup seeding.
