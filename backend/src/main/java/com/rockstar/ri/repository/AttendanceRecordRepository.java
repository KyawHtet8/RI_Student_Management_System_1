package com.rockstar.ri.repository;

import com.rockstar.ri.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, String> {

    Optional<AttendanceRecord> findByStudentIdAndCourseIdAndDate(
            String studentId, String courseId, String date);

    List<AttendanceRecord> findByStudentIdAndCourseIdOrderByDateAsc(
            String studentId, String courseId);

    List<AttendanceRecord> findByCourseIdAndDateOrderByStudentIdAsc(
            String courseId, String date);
}
