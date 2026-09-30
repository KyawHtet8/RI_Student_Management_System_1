-- Semester is part of the enrollment identity and must be present.
-- The table checks keep this migration safe for a brand-new database where
-- Hibernate creates the tables after Flyway runs.
DO $$
BEGIN
    IF to_regclass('public.courses') IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM courses WHERE semester IS NULL) THEN
            ALTER TABLE courses ALTER COLUMN semester SET NOT NULL;
        END IF;
    END IF;

    IF to_regclass('public.enrollments') IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM enrollments WHERE semester IS NULL) THEN
            ALTER TABLE enrollments ALTER COLUMN semester SET NOT NULL;
        END IF;
    END IF;
END $$;
