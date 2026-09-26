package com.rockstar.ri.service;

import com.rockstar.ri.dto.CreateCourseRequest;
import com.rockstar.ri.dto.UpdateCourseRequest;
import com.rockstar.ri.model.Course;
import com.rockstar.ri.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository repository;

    @Transactional(readOnly = true)
    public List<Course> getCourses() { return repository.findAll(); }

    @Transactional(readOnly = true)
    public List<Course> searchCourses(String query) {
        return query == null || query.isBlank() ? repository.findAll() : repository.searchByNameOrCode(query.trim());
    }

    @Transactional(readOnly = true)
    public Course getCourseById(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new RuntimeException("Course not found with identifier: " + identifier);
        }
        String normalizedIdentifier = identifier.trim();
        return repository.findById(normalizedIdentifier)
                .or(() -> repository.findByCodeIgnoreCase(normalizedIdentifier))
                .orElseThrow(() -> new RuntimeException("Course not found with identifier: " + identifier));
    }

    @Transactional
    public Course createCourse(CreateCourseRequest request) {
        String code = normalizeCode(request.getCode());
        validateCapacity(request.getCapacity(), defaultEnrolled(request.getEnrolled()));
        if (repository.existsByCodeIgnoreCase(code)) {
            throw new IllegalArgumentException("Course code already exists: " + code);
        }
        Course course = Course.builder().id(generateId()).code(code).name(clean(request.getName()))
                .department(clean(request.getDepartment())).credits(request.getCredits())
                .instructor(clean(request.getInstructor())).capacity(request.getCapacity())
                .enrolled(defaultEnrolled(request.getEnrolled())).semester(cleanNullable(request.getSemester()))
                .schedule(cleanNullable(request.getSchedule())).room(cleanNullable(request.getRoom())).build();
        log.info("Created course {} ({})", course.getId(), course.getCode());
        return repository.save(course);
    }

    @Transactional
    public Course updateCourse(String identifier, UpdateCourseRequest request) {
        Course existing = getCourseById(identifier);
        String code = normalizeCode(request.getCode());
        if (!existing.getCode().equalsIgnoreCase(code) && repository.existsByCodeIgnoreCase(code)) {
            throw new IllegalArgumentException("Course code already exists: " + code);
        }
        validateCapacity(request.getCapacity(), request.getEnrolled());
        existing.setCode(code);
        existing.setName(clean(request.getName()));
        existing.setDepartment(clean(request.getDepartment()));
        existing.setCredits(request.getCredits());
        existing.setInstructor(clean(request.getInstructor()));
        existing.setCapacity(request.getCapacity());
        existing.setEnrolled(request.getEnrolled());
        existing.setSemester(cleanNullable(request.getSemester()));
        existing.setSchedule(cleanNullable(request.getSchedule()));
        existing.setRoom(cleanNullable(request.getRoom()));
        log.info("Updated course {} ({})", existing.getId(), existing.getCode());
        return repository.save(existing);
    }

    @Transactional
    public void deleteCourse(String identifier) {
        Course course = getCourseById(identifier);
        repository.delete(course);
        log.info("Deleted course {} ({})", course.getId(), course.getCode());
    }

    private String generateId() {
        String id;
        do { id = "crs-" + UUID.randomUUID().toString().substring(0, 8); }
        while (repository.existsById(id));
        return id;
    }

    private static void validateCapacity(Integer capacity, Integer enrolled) {
        if (capacity == null || capacity <= 0) {
            throw new IllegalArgumentException("Course capacity must be greater than zero");
        }
        if (enrolled == null || enrolled < 0) {
            throw new IllegalArgumentException("Enrolled students cannot be negative");
        }
        if (enrolled > capacity) {
            throw new IllegalArgumentException("Enrolled students cannot exceed course capacity");
        }
    }

    private static int defaultEnrolled(Integer enrolled) { return enrolled == null ? 0 : enrolled; }
    private static String normalizeCode(String code) {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Course code is required");
        }
        return code.trim().toUpperCase(Locale.ROOT);
    }
    private static String clean(String value) { return value == null ? null : value.trim(); }
    private static String cleanNullable(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
