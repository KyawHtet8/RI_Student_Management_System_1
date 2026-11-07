# RI-SMS Assignment Submission Checklist

## Current verified status

- [x] Frontend TypeScript check passes: `npm run lint`
- [x] Frontend production build passes: `npm run build`
- [x] Backend context test passes: `./mvnw test -q`
- [ ] Docker Compose tested from a clean environment
- [ ] Application screenshots added to the report
- [ ] Manual test evidence added to the report

## Report quality

- [ ] Confirm the required assignment filename and submission format
- [ ] Proofread the full report for grammar, spelling, and consistent terminology
- [ ] Add a short personal contribution section
- [ ] Explain the system in your own words and prepare to defend the implementation
- [ ] Check all references and format them consistently using APA 7
- [ ] Run the institution-approved similarity checker
- [ ] Ensure the table of contents and page numbers are correct in the final Word/PDF version

## Screenshots and evidence

- [ ] Login screen
- [ ] Student roster and search
- [ ] Create/edit student form
- [ ] Course catalog
- [ ] Course enrollment workflow
- [ ] Grade assignment and GPA update
- [ ] Attendance register
- [ ] Analytics dashboard
- [ ] CSV/JSON export and import
- [ ] Docker containers and health checks
- [ ] Database/ER diagram matching the actual schema

## Testing evidence

For each test, record the action, expected result, actual result, status, and evidence.

- [ ] Valid superuser login
- [ ] Invalid login rejection
- [ ] Create, edit, and archive a student
- [ ] Duplicate student ID rejection
- [ ] Duplicate email rejection
- [ ] Create and delete a course
- [ ] Successful enrollment
- [ ] Duplicate enrollment rejection
- [ ] Course capacity limit rejection
- [ ] Grade update and GPA recalculation
- [ ] Ungraded courses excluded from GPA
- [ ] Save attendance sheet
- [ ] Update existing attendance record without duplication
- [ ] Attendance without active enrollment rejected
- [ ] Analytics filters work correctly
- [ ] CSV export contains current data
- [ ] JSON backup export/import works
- [ ] Responsive layout checked on desktop and mobile widths
- [ ] Docker health checks pass

## Report accuracy

- [ ] Mark tests as `Automated`, `Manual`, or `Not tested` instead of claiming every test is automated
- [ ] Ensure every API endpoint listed in the report exists in the code
- [ ] Ensure the ER diagram matches the real database relationships
- [ ] Clearly state that the project is an MVP/demo system
- [ ] Clearly document the single-superuser authentication limitation
- [ ] Clearly document that Docker has demonstration default credentials
- [ ] Clearly document that `ddl-auto: update` is transitional and not production-ready
- [ ] Clearly document that only context testing is currently automated

## Security and deployment

- [ ] Never commit `.env` or real passwords
- [ ] Replace default Docker credentials before any real deployment
- [ ] Confirm `.env` is listed in `.gitignore`
- [ ] Test `docker compose up -d --build`
- [ ] Test `docker compose ps`
- [ ] Test `http://localhost:8080/actuator/health`
- [ ] Test `http://localhost:3000/healthz`
- [ ] Document how to stop the system with `docker compose down`
- [ ] Explain that Basic Authentication/session storage is suitable only for the MVP

## Final demonstration workflow

- [ ] Sign in
- [ ] Create a student
- [ ] Create a course
- [ ] Enroll the student
- [ ] Assign a grade
- [ ] Confirm GPA recalculation
- [ ] Record attendance
- [ ] View analytics
- [ ] Export data
- [ ] Explain the backend validation and database constraints

## Final supervisor recommendation

The project is technically strong and the frontend, build, and backend context checks currently pass. Before submission, prioritise test evidence, screenshots, personal contribution, Docker verification, and honest documentation of MVP limitations.
