package com.rockstar.ri.service;

import com.rockstar.ri.dto.AssignGradeRequest;
import com.rockstar.ri.dto.EnrollStudentRequest;
import com.rockstar.ri.dto.UpdateEnrollmentStatusRequest;
import com.rockstar.ri.exception.ResourceNotFoundException;
import com.rockstar.ri.model.Course;
import com.rockstar.ri.model.Enrollment;
import com.rockstar.ri.repository.CourseRepository;
import com.rockstar.ri.repository.EnrollmentRepository;
import com.rockstar.ri.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private static final String ENROLLED = "Enrolled";
    private static final String DROPPED = "Dropped";
    private static final String COMPLETED = "Completed";
    private static final String WAITLISTED = "Waitlisted";
    private static final List<String> STATUSES = List.of(ENROLLED, COMPLETED, DROPPED, WAITLISTED);
    private static final List<String> GRADES = List.of(
            "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "In Progress");

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    private static final Map<String, Double> GRADE_POINTS = Map.ofEntries(
            Map.entry("A", 4.0), Map.entry("A-", 3.7), Map.entry("B+", 3.3),
            Map.entry("B", 3.0), Map.entry("B-", 2.7), Map.entry("C+", 2.3),
            Map.entry("C", 2.0), Map.entry("C-", 1.7), Map.entry("D+", 1.3),
            Map.entry("D", 1.0), Map.entry("F", 0.0));

    @Transactional(readOnly = true)
    public List<Enrollment> getEnrollments() {
        return enrollmentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Enrollment getEnrollmentById(String id) {
        return enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
    }

    @Transactional(readOnly = true)
    public List<Enrollment> getByStudent(String studentId) {
        requireStudent(studentId);
        return enrollmentRepository.findByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public List<Enrollment> getByCourse(String courseIdentifier) {
        return enrollmentRepository.findByCourseId(resolveCourse(courseIdentifier).getId());
    }

    @Transactional
    public Enrollment enrollStudent(String courseIdentifier, EnrollStudentRequest request) {
        String studentId = requireStudent(request.getStudentId());
        Course course = resolveCourse(courseIdentifier);

        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, course.getId())) {
            throw new IllegalStateException("Student is already enrolled in this course");
        }
        course = lockCourse(course.getId());
        if (course.getEnrolled() >= course.getCapacity()) {
            throw new IllegalStateException("Course has reached maximum capacity");
        }

        course.setEnrolled(course.getEnrolled() + 1);
        courseRepository.save(course);

        Enrollment enrollment = Enrollment.builder()
                .id(generateId())
                .studentId(studentId)
                .courseId(course.getId())
                .enrollmentDate(LocalDate.now().toString())
                .status(ENROLLED)
                .build();
        try {
            Enrollment saved = enrollmentRepository.save(enrollment);
            log.info("Enrolled student {} in course {}", studentId, course.getId());
            return saved;
        } catch (DataIntegrityViolationException exception) {
            throw new IllegalStateException("Student is already enrolled in this course", exception);
        }
    }

    @Transactional
    public Enrollment updateStatus(String id, UpdateEnrollmentStatusRequest request) {
        Enrollment enrollment = getEnrollmentById(id);
        String status = canonicalStatus(request.getStatus());
        boolean wasCounted = isCounted(enrollment.getStatus());
        boolean willBeCounted = isCounted(status);

        if (wasCounted != willBeCounted) {
            Course course = lockCourse(enrollment.getCourseId());
            if (willBeCounted && course.getEnrolled() >= course.getCapacity()) {
                throw new IllegalStateException("Course has reached maximum capacity");
            }
            course.setEnrolled(Math.max(0, course.getEnrolled() + (willBeCounted ? 1 : -1)));
            courseRepository.save(course);
        }
        enrollment.setStatus(status);
        return enrollmentRepository.save(enrollment);
    }

    @Transactional
    public Enrollment assignGrade(String id, AssignGradeRequest request) {
        Enrollment enrollment = getEnrollmentById(id);
        String grade = canonicalGrade(request.getGrade());
        enrollment.setGrade(grade);
        if (request.isMarkCompleted()) {
            enrollment.setStatus(COMPLETED);
        }
        Enrollment saved = enrollmentRepository.save(enrollment);
        recalculateStudentGpa(enrollment.getStudentId());
        return saved;
    }

    @Transactional
    public double recalculateStudentGpa(String studentId) {
        String normalizedStudentId = requireStudent(studentId);
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(normalizedStudentId);
        double qualityPoints = 0.0;
        int totalCredits = 0;

        for (Enrollment enrollment : enrollments) {
            Double gradePoints = enrollment.getGrade() == null
                    ? null : GRADE_POINTS.get(enrollment.getGrade());
            if (gradePoints == null) {
                continue;
            }
            Course course = resolveCourse(enrollment.getCourseId());
            qualityPoints += gradePoints * course.getCredits();
            totalCredits += course.getCredits();
        }

        double gpa = totalCredits == 0 ? 0.0 : Math.round((qualityPoints / totalCredits) * 100.0) / 100.0;
        var student = studentRepository.findById(normalizedStudentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        student.setGpa(gpa);
        studentRepository.save(student);
        log.info("Recalculated GPA for student {}: {}", normalizedStudentId, gpa);
        return gpa;
    }

    @Transactional
    public void deleteEnrollment(String id) {
        Enrollment enrollment = getEnrollmentById(id);
        if (isCounted(enrollment.getStatus())) {
            Course course = lockCourse(enrollment.getCourseId());
            course.setEnrolled(Math.max(0, course.getEnrolled() - 1));
            courseRepository.save(course);
        }
        enrollmentRepository.delete(enrollment);
        log.info("Deleted enrollment {}", id);
    }

    private String requireStudent(String studentId) {
        String normalized = requireText(studentId, "Student ID is required");
        studentRepository.findById(normalized)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return normalized;
    }

    private Course resolveCourse(String identifier) {
        String normalized = requireText(identifier, "Course ID is required");
        return courseRepository.findById(normalized)
                .or(() -> courseRepository.findByCodeIgnoreCase(normalized))
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
    }

    private Course lockCourse(String courseId) {
        return courseRepository.findByIdForUpdate(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
    }

    private String generateId() {
        String id;
        do {
            id = "enr-" + UUID.randomUUID().toString().substring(0, 8);
        } while (enrollmentRepository.existsById(id));
        return id;
    }

    private static boolean isCounted(String status) {
        return ENROLLED.equals(status);
    }

    private static String canonicalStatus(String status) {
        String normalized = requireText(status, "Status is required");
        return STATUSES.stream().filter(value -> value.equalsIgnoreCase(normalized)).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid enrollment status: " + status));
    }

    private static String canonicalGrade(String grade) {
        String normalized = requireText(grade, "Grade is required");
        return GRADES.stream().filter(value -> value.equalsIgnoreCase(normalized)).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid grade: " + grade));
    }

    private static String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }
}
