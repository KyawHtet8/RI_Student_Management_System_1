-- Safe upgrade for existing PostgreSQL installations. Fresh databases will
-- receive the same constraints from JPA after this migration no-ops.
DO $$
BEGIN
    IF to_regclass('public.students') IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = 'public' AND indexname = 'uk_students_email_ci'
        ) THEN
            CREATE UNIQUE INDEX uk_students_email_ci ON students (LOWER(email));
        END IF;
    END IF;

    IF to_regclass('public.enrollments') IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'uk_enrollment_student_course'
        ) THEN
            ALTER TABLE enrollments DROP CONSTRAINT uk_enrollment_student_course;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'uk_enrollment_student_course_semester'
        ) THEN
            ALTER TABLE enrollments
                ADD CONSTRAINT uk_enrollment_student_course_semester
                UNIQUE (student_id, course_id, semester);
        END IF;

        CREATE INDEX IF NOT EXISTS idx_enrollments_semester
            ON enrollments (semester);
    END IF;

    IF to_regclass('public.courses') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_courses_semester
            ON courses (semester);
    END IF;
END $$;
