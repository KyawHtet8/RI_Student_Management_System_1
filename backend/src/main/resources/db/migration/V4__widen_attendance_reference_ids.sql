-- Attendance references the same application-generated student/course IDs as
-- enrollments. Those IDs can be longer than the original VARCHAR(36) limit.
DO $$
BEGIN
    IF to_regclass('public.attendance_records') IS NOT NULL THEN
        ALTER TABLE attendance_records
            ALTER COLUMN student_id TYPE varchar(64),
            ALTER COLUMN course_id TYPE varchar(64);
    END IF;
END $$;
