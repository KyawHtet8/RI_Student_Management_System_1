package com.rockstar.ri.service;

import com.rockstar.ri.dto.AttendanceStatistics;
import com.rockstar.ri.dto.BulkAttendanceRequest;
import com.rockstar.ri.dto.MarkAttendanceRequest;
import com.rockstar.ri.exception.ResourceNotFoundException;
import com.rockstar.ri.model.AttendanceRecord;
import com.rockstar.ri.model.AttendanceStatus;
import com.rockstar.ri.model.Course;
import com.rockstar.ri.repository.AttendanceRecordRepository;
import com.rockstar.ri.repository.CourseRepository;
import com.rockstar.ri.repository.EnrollmentRepository;
import com.rockstar.ri.repository.StudentRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional(readOnly = true)
    public List<AttendanceRecord> getAttendance(String courseIdentifier, String date) {
        Course course = resolveCourse(courseIdentifier);
        validateDate(date);
        return attendanceRepository.findByCourseIdAndDateOrderByStudentIdAsc(course.getId(), date.trim());
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecord> getStudentAttendance(String studentId, String courseIdentifier) {
        requireStudent(studentId);
        Course course = resolveCourse(courseIdentifier);
        return attendanceRepository.findByStudentIdAndCourseIdOrderByDateAsc(studentId.trim(), course.getId());
    }

    @Transactional
    public AttendanceRecord markAttendance(String courseIdentifier, String date,
                                            @Valid MarkAttendanceRequest request) {
        Course course = resolveCourse(courseIdentifier);
        String normalizedDate = validateDate(date);
        String studentId = verifyEnrollment(request.getStudentId(), course.getId());

        AttendanceRecord record = attendanceRepository
                .findByStudentIdAndCourseIdAndDate(studentId, course.getId(), normalizedDate)
                .orElseGet(() -> AttendanceRecord.builder()
                        .id(generateId())
                        .studentId(studentId)
                        .courseId(course.getId())
                        .date(normalizedDate)
                        .build());
        record.setStatus(request.getStatus());
        record.setRemarks(cleanNullable(request.getRemarks()));
        return attendanceRepository.save(record);
    }

    @Transactional
    public List<AttendanceRecord> markBulkAttendance(BulkAttendanceRequest request) {
        // Each item is validated and upserted in the same transaction.
        return request.getRecords().stream()
                .map(record -> markAttendance(request.getCourseId(), request.getDate(), record))
                .toList();
    }

    @Transactional(readOnly = true)
    public AttendanceStatistics getStatistics(String studentId, String courseIdentifier) {
        requireStudent(studentId);
        Course course = resolveCourse(courseIdentifier);
        String normalizedStudentId = studentId.trim();
        List<AttendanceRecord> records = attendanceRepository
                .findByStudentIdAndCourseIdOrderByDateAsc(normalizedStudentId, course.getId());

        long present = count(records, AttendanceStatus.Present);
        long late = count(records, AttendanceStatus.Late);
        long absent = count(records, AttendanceStatus.Absent);
        long excused = count(records, AttendanceStatus.Excused);
        long total = records.size();
        double rate = total == 0 ? 0.0 : round(((present + late) * 100.0) / total);

        return AttendanceStatistics.builder()
                .studentId(normalizedStudentId)
                .courseId(course.getId())
                .totalSessions(total)
                .present(present)
                .late(late)
                .absent(absent)
                .excused(excused)
                .attendanceRate(rate)
                .build();
    }

    private String verifyEnrollment(String studentId, String courseId) {
        String normalized = requireText(studentId, "Student ID is required");
        requireStudent(normalized);
        if (!enrollmentRepository.existsByStudentIdAndCourseId(normalized, courseId)) {
            throw new IllegalStateException("Student is not enrolled in this course");
        }
        return normalized;
    }

    private Course resolveCourse(String identifier) {
        String normalized = requireText(identifier, "Course ID is required");
        return courseRepository.findById(normalized)
                .or(() -> courseRepository.findByCodeIgnoreCase(normalized))
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
    }

    private void requireStudent(String studentId) {
        studentRepository.findById(requireText(studentId, "Student ID is required"))
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    }

    private static String validateDate(String date) {
        String normalized = requireText(date, "Attendance date is required");
        try {
            LocalDate.parse(normalized);
            return normalized;
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException("Date must use ISO format YYYY-MM-DD");
        }
    }

    private String generateId() {
        String id;
        do {
            id = "att-" + UUID.randomUUID().toString().substring(0, 8);
        } while (attendanceRepository.existsById(id));
        return id;
    }

    private static long count(List<AttendanceRecord> records, AttendanceStatus status) {
        return records.stream().filter(record -> record.getStatus() == status).count();
    }

    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private static String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private static String cleanNullable(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
