# RI STUDENT MANAGEMENT SYSTEM

## Web and Mobile Application Development
### Summative Module Assessment — Performance Based Task

**Student Name:** [Student Name]  
**Student ID:** [Student ID]  
**Programme:** [Programme Name]  
**Lecturer:** [Lecturer Name]  
**Submission Date:** [Date]

## Table of Contents

1. Introduction  
2. Application Overview  
3. User Experience Design  
4. Front-end Development – 25 Marks  
5. Back-end Development – 25 Marks  
6. Database and API Integration  
7. Deployment and Testing – 20 Marks  
8. Future Improvements  
9. Conclusion  
10. References  
13. Appendices

# 1. Introduction

## 1.1 Background

The RI Student Management System (RI-SMS) is a responsive web application for managing academic information in one central system. Educational administrators commonly work with paper forms, spreadsheets, email, and separate attendance files. These approaches become difficult to control as the number of students and courses increases. Repeated data entry can create inconsistent names and contact details, while separate course and attendance records make it difficult to understand a student’s complete academic history.

RI-SMS provides a browser-based solution for academic administration. An authenticated administrator can maintain student profiles, manage courses, enrol students, record attendance, assign grades, view GPA information, and review analytics. It uses React and TypeScript for the front end, Spring Boot and Java for the REST API, PostgreSQL for persistent data, and Docker Compose for local deployment.

## 1.2 Problem Statement

The main problem is that student information is often distributed across disconnected tools. A spreadsheet may contain personal information, another file may contain course registrations, and attendance may be recorded manually. This creates duplicate records, over-capacity courses, inaccurate grades, slow reporting, and weak access control.

RI-SMS addresses this problem by using one relational data model and one workflow. The front end provides convenient forms and lists, but important rules are enforced by the backend. For example, a student cannot be enrolled twice in the same course and semester, a course cannot exceed its capacity, and an attendance record must belong to an active enrolment. This separation helps protect data when requests originate outside the user interface.

## 1.3 Aim

The aim of this project is to develop a usable, responsive, and maintainable Student Management System that supports essential academic administration through a secure REST-backed web application.

## 1.4 Objectives

The project objectives are to:

* design a clear dashboard for academic administrators;
* implement authenticated access and sign-out;
* create, search, edit, archive, and review student records;
* create and manage courses and course capacity;
* enrol students while enforcing business rules;
* record attendance and provide attendance statistics;
* assign grades and calculate GPA from graded credits;
* display filtered academic analytics;
* provide CSV export and JSON backup operations;
* integrate a PostgreSQL database through a Spring Boot API;
* test the application and package it with Docker Compose.

## 1.5 Scope of the Application

The application includes an administrator web interface, REST API, PostgreSQL database, and local Docker deployment. It covers student, course, enrolment, attendance, grade, analytics, and data workflows. The MVP uses one superuser and does not yet include a student portal, fee payment, notifications, or multi-role access.

# 2. Application Overview

## 2.1 Application Description

After authentication, the administrator enters a dashboard with navigation, content, dialogs, notifications, and connection status. Students supports searchable records, editing, archiving, batch updates, and details. Courses shows metadata, capacity, enrolments, and rosters. Attendance saves a selected course and date sheet.

The academic record combines a student profile with course history, grades, attendance history, and administrative notes. When a grade is assigned, the backend recalculates GPA using course credits and grade points. The Analytics view summarises total students, average GPA, active courses, and department distribution. Filters can be applied by academic term and department. System and data functions provide CSV roster export and JSON backup/import for demonstration recovery.

## 2.2 Target Users

The primary user is an academic administrator or registrar who needs to maintain accurate records. In a future version, different permissions could be provided to lecturers, advisors, department managers, and students. A lecturer might record attendance and grades but not change personal details, while a student might view only their own profile. The present implementation deliberately uses a single superuser to keep the MVP scope manageable.

## 2.3 Main Features

| Feature | Description |
|---|---|
| Authentication | Validates the configured superuser and protects application data. |
| Student management | Creates, searches, edits, archives, and displays student records. |
| Course management | Maintains course code, name, department, credits, instructor, term, room, schedule, and capacity. |
| Enrolment | Links students to courses and prevents duplicate or over-capacity enrolments. |
| Grades and GPA | Stores grades and recalculates GPA from graded course credits. |
| Attendance | Saves Present, Late, Absent, or Excused status for a course and date. |
| Analytics | Displays totals, averages, and department summaries with filters. |
| Data operations | Exports CSV, exports/imports JSON, and resets demonstration data. |

## 2.4 Functional Requirements

The system must reject invalid login credentials and allow an authenticated user to sign out. Student IDs and email addresses must be unique. Course codes must be unique, and a course must have valid credits, capacity, semester, and required descriptive fields. Enrolment must verify that both records exist, that capacity is available, and that the student is not already enrolled for the same course and semester. Attendance must verify active enrolment and update an existing student-course-date record instead of creating a duplicate. Grades must update the relevant enrolment and trigger GPA recalculation. Analytics must return current data and accept optional term and department filters.

## 2.5 Non-functional Requirements

The application should be understandable to a non-technical administrator, usable on desktop and narrow screens, and responsive without unnecessary page reloads. API errors should have a consistent response structure and the interface should communicate loading, success, and failure states. Spring Security, server-side validation, database constraints, transactions, and environment-based configuration protect sensitive data and data integrity. Separate frontend features, services, types, backend controllers, services, repositories, and models improve maintainability. PostgreSQL and indexed relational tables provide a suitable base for future growth.

# 3. User Experience Design

## 3.1 Design Requirements and UI/UX Principles

The design uses consistency, simplicity, visibility, feedback, hierarchy, and accessibility as its main principles. Navigation remains visible so the user can move between Students, Courses, Attendance, Analytics, and System functions. Similar actions use consistent buttons, dialogs, labels, and confirmation patterns. Tables and summary cards establish visual hierarchy: important totals are shown first, while detailed records are available through selection.

Feedback is provided through loading states, toast notifications, validation messages, connection status, and error messages returned by the API. Forms group related fields such as identity, contact, academic, and emergency-contact information. Required values and invalid formats are checked before submission, while the backend repeats validation for security. Lucide icons are paired with text labels rather than being the only indication of an action. Responsive layouts, compact navigation, scrollable tables, and mobile-friendly spacing allow the main workflows to remain usable at smaller widths.

## 3.2 Wireframes

The final submission should include student-created wireframes for Login, Dashboard, Student Roster, Student Details, Course Catalogue, Attendance, and Analytics. Each should show navigation, controls, data areas, and feedback locations. Label figures and do not expose passwords or private data.

# 4. Front-end Development – 25 Marks

## 4.1 Technologies and Frameworks

React was selected because its component model supports reusable views and interactive state. TypeScript provides compile-time checking for student, course, enrolment, attendance, and API data. Vite supplies a fast development server and production build process. Tailwind CSS provides responsive utility classes, while Lucide supplies consistent icons. The Fetch-based shared API client centralises HTTP requests, authentication headers, JSON parsing, and error handling.

## 4.2 Project Structure

The frontend is organised by application responsibility:

```text
frontend/src/
├── app/          providers, authentication, routes, and store
├── components/   header, navigation, views, and modals
├── features/     students, courses, attendance, and analytics APIs
├── services/     shared REST API client
├── shared/       reusable UI components, hooks, and formatters
├── data/         development and demonstration fallback data
└── types.ts      shared domain types
```

`App.tsx` composes providers and the application shell. Feature API modules keep request details out of visual components. The store coordinates records and refreshes them after successful mutations. A project-structure screenshot from the IDE should be added as evidence.

## 4.3 Components and Reusability

Reusable components include the Header, Navigation, StudentList, StudentModal, StudentDetailModal, CoursesView, AttendanceView, AnalyticsView, SettingsView, and shared UI elements such as buttons, cards, modals, and notifications. For example, the student modal is used for both creating and editing records; its initial values and submit handler change according to the selected mode. This reduces duplicated markup and keeps validation and presentation predictable.

## 4.4 API/Data Integration

The front end sends JSON requests to `/api/v1`. A successful response is parsed into typed application data and placed in the store. A failed response is converted into a user-readable error, while loading state prevents confusing repeated submissions. Representative requests include `GET /students`, `POST /students`, `PUT /students/{id}`, `GET /courses`, `POST /enrollments/courses/{courseId}/enroll`, `POST /attendance/bulk`, and `GET /analytics/overview`. A Postman, browser network, or Swagger screenshot showing a real response should be included in the final submission.

## 4.5 Form Validation

Client-side validation checks required fields, valid email format, numeric limits, course capacity, and appropriate date or status values. Invalid input is displayed beside the relevant control instead of failing silently. The server repeats the checks because a client can be bypassed. Evidence should include one valid student or course submission, an empty required field, a duplicate identifier, and an invalid email or capacity value.

## 4.6 Responsive Implementation

Responsive classes change spacing, widths, navigation, and grid columns at smaller breakpoints. Tables scroll horizontally, while cards and forms stack on narrow screens. Check desktop, tablet, and mobile sizes, with screenshots of the login, roster, and a form at wide and narrow widths.

# 5. Back-end Development – 25 Marks

## 5.1 Server-side Technologies

The backend uses Java 21 and Spring Boot 3.3. Spring Web exposes REST controllers, Spring Data JPA maps entities to PostgreSQL, Spring Security protects requests, and Bean Validation checks request values. Flyway stores versioned database migrations. This technology combination separates transport, business rules, and persistence while providing mature support for transactions and relational data.

## 5.2 System Architecture

```text
Administrator browser
        ↓ JSON over HTTP
React + TypeScript frontend
        ↓ REST API / Basic authentication
Spring Boot controllers → services → repositories
        ↓ JPA/JDBC
PostgreSQL 16 database
```

Controllers receive requests and return responses. Services enforce rules and transaction boundaries. Repositories perform database operations, while entities represent students, courses, enrolments, and attendance. A global exception handler converts missing resources, validation failures, and business conflicts into consistent error responses.

## 5.3 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/auth/login` | Validate the configured superuser session. |
| GET/POST | `/api/v1/students` | List or create students. |
| GET/PUT/DELETE | `/api/v1/students/{id}` | View, update, or archive a student. |
| GET/POST | `/api/v1/courses` | List or create courses. |
| GET/PUT/DELETE | `/api/v1/courses/{id-or-code}` | Manage a course. |
| POST | `/api/v1/enrollments/courses/{courseId}/enroll` | Enrol a student after rule checks. |
| PATCH/PUT/DELETE | `/api/v1/enrollments/{id}` | Change status, assign grade, or remove enrolment. |
| GET/POST | `/api/v1/attendance` and `/bulk` | Read or save attendance records. |
| GET | `/api/v1/analytics/overview` | Return filtered academic summaries. |
| GET | `/actuator/health` | Report backend health. |

Postman or equivalent evidence should show successful requests and important errors such as invalid credentials, duplicate enrolment, and a missing resource.

## 5.4 CRUD Implementation

Create and update requests use DTOs rather than exposing database entities directly. The service validates input, persists the transaction, and returns the updated record. Read operations provide roster, detail, course, attendance, and analytics data. Delete behaviour is cautious: student removal is represented as archive/status behaviour where appropriate, while course and enrolment operations enforce relationship rules. After a successful mutation the frontend refreshes its store so the visible list reflects the database.

## 5.5 Authentication and Authorization

The MVP has one environment-configured superuser. The login request is checked by Spring Security, and the frontend stores the current session value in browser `sessionStorage`. Logout removes the stored session and returns the user to the login gate. This is suitable for controlled demonstration but should not be treated as a complete production identity solution. Screenshots should show valid login, failed login, the authenticated dashboard, and logout without revealing credentials.

## 5.6 Authorization

All academic workflows are placed behind the authenticated application boundary. The current scope does not yet provide separate lecturer, advisor, registrar, and student permissions. This limitation must be stated clearly in the evaluation. A production implementation should enforce role permissions in the backend, not only hide buttons in React. An administrator-only test should therefore be recorded as “single-superuser access” rather than claiming multi-role authorization.

# 6. Database and API Integration

PostgreSQL stores the persistent domain data. The main tables are `students`, `courses`, `enrollments`, and `attendance_records`; supporting migration history is maintained by Flyway. Students have a unique student ID and email. Courses have a unique code. Enrolments reference both tables and apply uniqueness to the student, course, and semester combination. Attendance references a student and course and applies uniqueness to the student, course, and date.

The student-course many-to-many relationship is resolved through enrolments. Before an enrolment is saved, the service checks the student, course, capacity, semester, and existing relationship. Before attendance is saved, it checks active enrolment. GPA is calculated as `sum(grade points × credits) / sum(graded credits)`; ungraded and in-progress courses are excluded. These constraints mean that data remains valid even when a request does not originate in the React interface.

Database evidence should include an ER diagram and a screenshot of the PostgreSQL tables. Migration files document academic constraints and reference-ID changes. The Docker MVP uses transitional Hibernate update mode; production should use Flyway schema creation and Hibernate validation.

# 7. Deployment and Testing – 20 Marks

## 7.1 Development Environment

Development uses Visual Studio Code or another IDE, Node.js and npm for the frontend, Java and Maven for the backend, PostgreSQL for persistence, Git for version control, and a modern browser for manual testing. Automated checks include the frontend TypeScript/lint command, the production build, and the Spring Boot context test.

## 7.2 Deployment Environment

Docker Compose defines PostgreSQL, backend, and frontend services on a shared network. PostgreSQL uses a persistent volume. The backend exposes port 8080 and waits for database readiness. The frontend production build is served by Nginx on port 3000. Configuration such as database credentials, CORS origins, and superuser credentials is provided through environment variables. The local deployment command is:

```bash
docker compose up -d --build
```

The application is available at `http://localhost:3000`, the API at `http://localhost:8080/api/v1`, and health information at `/actuator/health`. Demonstration credentials must be replaced before any real deployment, and HTTPS, backups, monitoring, and secure secrets are required for production.

## 7.3 Testing Strategy

Testing combines automated build/context checks with manual functional, API, validation, authentication, responsive, and database checks. Critical workflows include duplicate IDs, enrolment capacity, GPA recalculation, attendance updates, analytics filtering, and export/import. Evidence must distinguish automated, manual, and not-tested results.

## 7.4 Test Plan and Test Cases

| ID | Test | Expected result | Status |
|---|---|---|---|
| TC01 | Valid superuser login | Dashboard opens | Pass/record evidence |
| TC02 | Wrong password | Access is rejected | Pass/record evidence |
| TC03 | Duplicate student ID | Validation or conflict is returned | Pass/record evidence |
| TC04 | Enrol student twice | Second request is rejected | Pass/record evidence |
| TC05 | Enrol beyond capacity | Course and data remain unchanged | Pass/record evidence |
| TC06 | Assign grade | Enrolment changes and GPA recalculates | Pass/record evidence |
| TC07 | Save attendance twice | Existing date record is updated | Pass/record evidence |
| TC08 | Export JSON/CSV | Current records are downloaded | Pass/record evidence |
| TC09 | Narrow viewport | Controls remain usable | Pass/record evidence |
| TC10 | Build and context test | Commands complete successfully | Automated |

## 7.5 Debugging and Evaluation

Issues investigated included incorrect API paths, database configuration, fixed-width layouts, duplicate relationships, and inconsistent reference-ID lengths. Solutions included a shared API client, environment configuration, responsive classes, service validation, database constraints, and migrations. Evaluation focuses on consistent capacity, attendance, and GPA rules.

## 7.6 Security, Ethics, and Academic Integrity

Student records are personally identifiable and academically sensitive. Access should follow least privilege, credentials must not be committed, and test screenshots must use demonstration data. Incorrect grades or attendance can harm students, so validation, transactions, audit history, backups, and a correction process are important ethical controls. The current system is an MVP and its single-superuser model must be disclosed. This report should be proofread, referenced, and checked with the institution-approved similarity checker.

# 8. Future Improvements

Future releases should implement role-based access, secure HTTP-only sessions, audit logs, transcript and attendance-report PDFs, notifications, and a student-facing portal. Operational improvements should include end-to-end tests, CI/CD, HTTPS, backups, monitoring, and stronger privacy controls. Course offerings should be separated from the general catalogue so the same course can run in multiple terms or sections.

# 9. Conclusion

RI-SMS demonstrates a complete full-stack solution for academic administration. React and TypeScript provide a structured responsive interface, Spring Boot provides validated REST services, PostgreSQL preserves related records, and Docker Compose provides repeatable local deployment. The system brings student records, courses, enrolment, grades, attendance, analytics, and data operations into one workflow. Its key technical strength is that important academic rules are enforced in backend services and database constraints rather than relying only on frontend controls. Although the MVP requires further security, role, audit, and deployment work before production use, it meets the core objective of providing a central and maintainable Student Management System.

# 10. References

Docker. (n.d.). *Docker Compose documentation*. https://docs.docker.com/compose/  

Meta Open Source. (n.d.). *React documentation*. https://react.dev/  

Microsoft. (n.d.). *TypeScript documentation*. https://www.typescriptlang.org/docs/  

OWASP Foundation. (n.d.). *OWASP Application Security Verification Standard*. https://owasp.org/www-project-application-security-verification-standard/  

PostgreSQL Global Development Group. (n.d.). *PostgreSQL documentation*. https://www.postgresql.org/docs/  

Redgate. (n.d.). *Flyway documentation*. https://documentation.red-gate.com/flyway  

VMware. (n.d.). *Spring Boot documentation*. https://docs.spring.io/spring-boot/  

Project source code and internal architecture, database, and Docker documentation were also consulted.

# 13. Appendices

Appendix A should contain wireframes. Appendix B should contain labelled screenshots of login, student management, enrolment, attendance, analytics, API testing, database structure, and Docker health checks. Appendix C should contain test evidence. Remove passwords, tokens, and private information.
