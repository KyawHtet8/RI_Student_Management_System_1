# Student Management System — Database Relationships

This document describes the current MVP database, its relationships,
constraints, lifecycle rules, and planned academic-model evolution.

## 1. Current relationship model

```text
students 1 ─────────< enrollments >──────── 1 courses
   │                                             │
   └──────────────< attendance_records >────────┘
   │
   └──────────────< student_notes
```

Students and courses have a many-to-many relationship through `enrollments`.
Enrollment stores semester, status, grade, and enrollment date. Attendance
currently references student and course directly; the service verifies an
active enrollment before creating attendance.

## 2. Tables and responsibilities

### `students`

Stores student identity and academic profile. Important fields include `id`,
the unique human-readable `student_id`, name, email, department, major,
academic year, status, cached `gpa`, and enrollment date. Address and emergency
contact are embedded in this table. Notes are stored in `student_notes`.

Important constraints:

```text
PRIMARY KEY (id)
UNIQUE (student_id)
UNIQUE (email)
```

PostgreSQL also maintains a case-insensitive unique email index.

### `courses`

Stores the current MVP course catalog and class details:

```text
id, code, name, department, credits, instructor,
semester, capacity, enrolled, room, schedule
```

The `courses.enrolled` counter is maintained transactionally by enrollment
services. Enrollment rows remain the detailed source for the actual roster.

### `enrollments`

Associates a student with a course:

```text
id, student_id, course_id, semester, status, grade, enrollment_date
```

Relationships:

```text
enrollments.student_id → students.id
enrollments.course_id  → courses.id
```

Constraint:

```text
UNIQUE(student_id, course_id, semester)
```

This prevents duplicate enrollment in the same course and semester.

### `attendance_records`

Stores one result for a student, course, and date:

```text
id, student_id, course_id, date, status, remarks
```

Relationships:

```text
attendance_records.student_id → students.id
attendance_records.course_id  → courses.id
```

Constraint:

```text
UNIQUE(student_id, course_id, date)
```

Saving the same student/course/date updates the existing row. Attendance
requires an active `Enrolled` enrollment. `Present` and `Late` count as
attended sessions; `Excused` is excluded from the attendance-rate denominator.

### `student_notes`

Stores notes belonging to a student:

```text
student_id → students.id
note
```

Notes are currently a JPA `@ElementCollection`. A production audit-focused
system should make notes a full entity with author and timestamps.

## 3. Cardinality summary

| Relationship | Cardinality | Meaning |
|---|---:|---|
| Student → Enrollment | 1-to-many | One student can take many courses |
| Course → Enrollment | 1-to-many | One course can have many students |
| Student → Attendance | 1-to-many | One student has many attendance records |
| Course → Attendance | 1-to-many | One course has many attendance records |
| Student → Notes | 1-to-many | One student can have many notes |
| Enrollment → Attendance | Logical relationship | Attendance is checked against active enrollment, but the current table has no `enrollment_id` |

## 4. Write and delete lifecycle

### Enrolling a student

```text
Validate student → resolve course → check duplicate enrollment
→ lock course → check capacity → increment course counter
→ insert enrollment → recalculate cached GPA
```

The operation is transactional.

### Recording attendance

```text
Validate student and course → verify active enrollment
→ find existing student/course/date row → insert or update attendance
```

### Deleting an enrollment

```text
Load enrollment → decrement course counter when applicable
→ delete enrollment → recalculate GPA
```

### Deleting a student

```text
Delete student enrollments → delete student attendance → delete student
```

This ordering is required because foreign keys prevent deleting a referenced
student first. Soft deletion is preferable for production academic history.

## 5. GPA relationship

GPA is derived from enrollment grades and course credits:

```text
GPA = Σ(grade points × course credits) / Σ(graded course credits)
```

`In Progress` and ungraded enrollments are excluded. `students.gpa` is a cached
value for quick display and is recalculated by the backend after grade changes,
enrollment deletion, and startup reconciliation.

## 6. Identifier lengths

The application generates internal student IDs using `std-` plus a UUID.
Enrollment and attendance reference columns therefore use `VARCHAR(64)` to
support generated and seeded IDs. The long-term design should use UUID columns
consistently for internal IDs and keep human-readable student numbers separate.

## 7. Flyway and JPA ownership

```text
Flyway      Creates and changes database schema
JPA         Maps entities and validates persistence mappings
Services    Enforce relationship and transaction rules
Repositories Execute database queries
```

Current migrations:

```text
V1__tighten_academic_constraints.sql
V2__require_course_terms.sql
V3__widen_enrollment_reference_ids.sql
V4__widen_attendance_reference_ids.sql
```

The Docker MVP currently uses Hibernate `ddl-auto=update` as a transitional
creator for missing tables. The production target is a complete initial Flyway
schema followed by:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

Applied migrations must never be edited. New schema changes use new versions.

## 8. Future `CourseOffering` model

The current `courses` table combines catalog and semester-specific class data.
For multiple sections, instructors, or semesters, introduce:

```text
courses → course_offerings → enrollments → attendance_records
```

Attendance can then use `enrollment_id + attendance_date` as its unique
identity, avoiding ambiguity when the same course is offered in multiple
semesters or sections.
