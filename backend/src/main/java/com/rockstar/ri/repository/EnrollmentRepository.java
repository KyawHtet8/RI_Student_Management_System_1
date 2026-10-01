package com.rockstar.ri.repository;

import com.rockstar.ri.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, String> {

    boolean existsByStudentIdAndCourseIdAndStatus(String studentId, String courseId, String status);

    boolean existsByStudentIdAndCourseIdAndSemester(String studentId, String courseId, String semester);

    List<Enrollment> findByStudentId(String studentId);

    List<Enrollment> findByCourseId(String courseId);
}
