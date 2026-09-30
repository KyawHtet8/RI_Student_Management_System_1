# Student Management System — Full-Stack Interview Guide

## 1. One-minute project presentation

> I built a modular monolithic Student Management System using React, TypeScript, Spring Boot, PostgreSQL, Flyway, and Docker. The frontend is organized by feature and uses a centralized application store. The backend follows a Controller → Service → Repository architecture with DTO validation, transactional business rules, relational database constraints, analytics, and standardized errors. The system supports students, courses, semester-aware enrollment, grades, GPA calculation, attendance, analytics, authentication, and Docker deployment.

This is an assignment-ready MVP with a production-oriented architecture.

## 2. High-level architecture

```text
Browser
  → React + TypeScript + Vite
  → Feature API modules + shared API client
  → Spring Boot REST API
  → Controllers
  → Services
  → Repositories/JPA
  → PostgreSQL
```

The project uses a modular monolith: one frontend and one backend, with business areas separated by domain instead of separate microservices.

## 3. Frontend domain

### Main frontend areas

- `app/`: application shell, authentication, routes, and store
- `features/students/`: student API, types, and hooks
- `features/courses/`: course and enrollment API modules
- `features/attendance/`: attendance API and types
- `features/analytics/`: analytics API and reporting view
- `components/`: reusable visual components and feature views
- `services/apiClient.ts`: shared HTTP and authentication handling

The components handle display and user interaction. The application store handles server state, mutations, local demo fallback, activity logs, and synchronization.

Example flow:

```text
CoursesView
  → AppStore.enrollStudentInCourse()
  → courseApi.enrollStudent()
  → apiClient()
  → Spring Boot API
```

### Frontend best practice

API calls should not be scattered throughout visual components. Feature API modules provide a clear boundary between UI and HTTP transport.

## 4. Backend domain

```text
HTTP request
  → Security filter
  → Controller
  → Request DTO validation
  → Service business rules
  → Repository
  → PostgreSQL transaction
  → Response DTO/entity
```

### Controller

Controllers define the HTTP boundary. They receive requests, validate DTOs, call services, and return responses.

Controllers should not contain GPA calculations, capacity rules, or complex database logic.

### Service

Services own business rules.

Examples:

- A student must exist before enrollment.
- A course cannot exceed capacity.
- A student cannot enroll twice in the same course and semester.
- Attendance can only be recorded for an enrolled student.
- A grade update recalculates GPA.

### Repository

Repositories provide database access using Spring Data JPA. They contain queries and persistence operations, while services decide when those operations are allowed.

## 5. Database domain

```text
students 1 ────────< enrollments >──────── 1 courses
   │                                        │
   └────────< attendance_records >─────────┘
   │
   └────────< student_notes
```

### Main tables

| Table | Purpose |
|---|---|
| `students` | Personal and academic student information |
| `courses` | Course catalog, semester, schedule, and capacity |
| `enrollments` | Relationship between students and courses, including grade and status |
| `attendance_records` | Attendance for a student, course, and date |
| `student_notes` | Notes belonging to a student |

### Important constraints

- Unique student ID
- Case-insensitive unique student email
- Unique course code
- Unique `(student_id, course_id, semester)` enrollment
- Unique `(student_id, course_id, date)` attendance
- Foreign keys between students, courses, enrollments, and attendance
- Required course and enrollment semester

Students and courses have a many-to-many relationship. The `enrollments` table is required because it stores the relationship plus semester, grade, status, and enrollment date.

## 6. Enrollment data flow

```text
User selects student and course
  → CoursesView
  → AppStore.enrollStudentInCourse()
  → POST /api/v1/enrollments/courses/{courseId}/enroll
  → validate student, course, semester, capacity, uniqueness
  → insert enrollment
  → update course enrollment counter
  → return enrollment
  → update React store and visible roster
```

The frontend also temporarily merges the successful enrollment response into the visible roster so the course card count updates immediately.

## 7. Attendance Register data flow

When the user clicks **Save Register**:

```text
AttendanceView
  → create one record per enrolled student
  → POST /api/v1/attendance/bulk
  → validate course, date, student, and enrollment
  → insert or update by student/course/date
  → update frontend attendance state
  → show “Register Saved!”
```

Example request:

```json
{
  "courseId": "crs-001",
  "date": "2026-09-30",
  "records": [
    {
      "studentId": "std-001",
      "status": "Present",
      "remarks": "On time"
    }
  ]
}
```

The attendance unique constraint makes the operation an upsert for the same student, course, and date.

## 8. Grade and GPA flow

```text
Course roster
  → PUT /api/v1/enrollments/{id}/grade
  → update enrollment grade
  → find course credits
  → recalculate weighted GPA
  → update student GPA
  → return updated enrollment
```

The grade belongs to the enrollment, while the calculated GPA is stored on the student profile for quick display.

## 9. Analytics domain

Endpoint:

```http
GET /api/v1/analytics/overview
GET /api/v1/analytics/overview?term=Fall%202026&department=Computer%20Science
```

The backend calculates:

- Total students
- Average GPA
- Active courses
- Department distribution
- Term and department filters
- Generation timestamp

The backend is authoritative when available. Local frontend analytics remain only as an offline/demo fallback.

## 10. Authentication and security

The MVP currently uses:

- Spring Security
- HTTP Basic authentication
- One in-memory superuser
- BCrypt password encoding
- Session-scoped frontend credential storage

Interview explanation:

> This authentication design is suitable for a showcase MVP. For production, I would use persistent users, role-based authorization, secure HTTP-only cookies or short-lived access tokens, HTTPS, rate limiting, MFA, and audit logging.

## 11. Transactions

Transactions protect operations that affect multiple records.

Enrollment example:

```text
Check capacity
  → insert enrollment
  → increment course count
```

These actions should succeed together or fail together.

Transactions are important for:

- Enrollment
- Enrollment status changes
- Grade updates
- GPA recalculation
- Attendance bulk saves

## 12. DTOs and API contracts

DTOs separate the public API contract from JPA entities.

Benefits:

- Prevent exposing internal database structure
- Validate input at the API boundary
- Control writable and read-only fields
- Keep API responses stable when entities evolve

Example request:

```json
{
  "studentId": "std-001",
  "grade": "A"
}
```

## 13. Flyway and database migrations

Flyway manages versioned database changes.

```text
backend/src/main/resources/db/migration/
  V1__tighten_academic_constraints.sql
  V2__require_course_terms.sql
```

Startup sequence:

```text
Start backend
  → read flyway_schema_history
  → run missing migrations
  → record migration versions
  → initialize JPA
```

The final production configuration should use:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

Then Flyway owns schema changes and Hibernate only validates mappings.

## 14. Startup demo data

`DataInitializer` preserves existing records and ensures the database has at least 20 students.

Important behavior:

- Existing students are not overwritten.
- Missing demo students are added only when needed.
- IDs and emails are deterministic.
- Restarts do not create duplicates.
- These are student records, not 20 login accounts.

## 15. Docker and deployment

```text
PostgreSQL container
  ↕ internal Docker network
Spring Boot backend container
  ↕ HTTP
Nginx frontend container
```

The frontend uses a multi-stage build:

```text
Node image builds React assets
  → Nginx serves static production files
```

The backend image builds a Spring Boot JAR and runs it with a smaller Java runtime image.

## 16. Testing and QA strategy

### Current checks

```bash
cd frontend
npm run lint
npm run build

cd ../backend
./mvnw test

docker compose up -d --build
```

### Recommended test levels

- Unit tests for GPA, capacity, status, and analytics rules
- Repository tests for queries and constraints
- Controller tests for validation and HTTP status codes
- Integration tests for API plus PostgreSQL workflows
- Playwright tests for browser workflows

### Critical end-to-end journey

```text
Login
  → create course
  → select students
  → save course
  → open View Enrolled Students
  → verify names and count
  → save attendance
  → reload page
  → verify persistence
  → open analytics
  → verify updated metrics
```

## 17. Interview questions and answers

### Why a modular monolith?

> The project is small enough to deploy as one application, but domains are separated by feature. This keeps deployment simple while preserving architectural boundaries.

### Why use an enrollment table?

> Students and courses have a many-to-many relationship. Enrollment stores the relationship and additional domain data such as semester, status, grade, and enrollment date.

### Why use a service layer?

> Business rules should not depend on HTTP or the UI. The service layer makes those rules reusable and testable.

### Why use transactions?

> Enrollment and GPA updates affect multiple records. Transactions keep related changes consistent.

### Why use Flyway?

> JPA maps objects, but Flyway provides explicit, repeatable, reviewable database evolution.

### What would you improve for production?

> I would add persistent role-based authentication, audit logs, complete response DTO mapping, automated integration and browser tests, soft deletion, rate limiting, observability, encrypted backups, and production migrations with Hibernate validation only.

## 18. Honest project positioning

This is an assignment-ready MVP and a full-stack knowledge showcase. It demonstrates frontend architecture, TypeScript, REST APIs, Spring Boot, security, DTO validation, transactions, relational database design, JPA, Flyway, analytics, Docker, testing, error handling, and UI/backend synchronization.

It should not be described as production-complete until authentication, authorization, audit history, automated browser coverage, and operational observability are expanded.
