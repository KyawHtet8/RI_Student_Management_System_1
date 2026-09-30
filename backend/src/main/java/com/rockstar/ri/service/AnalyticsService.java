package com.rockstar.ri.service;

import com.rockstar.ri.dto.AnalyticsOverviewRequest;
import com.rockstar.ri.dto.AnalyticsOverviewResponse;
import com.rockstar.ri.dto.DepartmentAnalytics;
import com.rockstar.ri.model.Course;
import com.rockstar.ri.model.Student;
import com.rockstar.ri.repository.CourseRepository;
import com.rockstar.ri.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public AnalyticsOverviewResponse getOverview(AnalyticsOverviewRequest request) {
        String term = normalize(request.getTerm());
        String department = normalize(request.getDepartment());

        List<Student> students = studentRepository.findAll().stream()
                .filter(student -> department == null || department.equalsIgnoreCase(student.getDepartment()))
                .toList();

        List<Course> courses = courseRepository.findAll().stream()
                .filter(course -> term == null || term.equalsIgnoreCase(course.getSemester()))
                .toList();

        double averageGpa = students.isEmpty()
                ? 0.0
                : round(students.stream().map(Student::getGpa).filter(Objects::nonNull)
                        .mapToDouble(Double::doubleValue).average().orElse(0.0));

        List<DepartmentAnalytics> distribution = students.stream()
                .collect(Collectors.groupingBy(Student::getDepartment))
                .entrySet().stream()
                .map(entry -> {
                    List<Student> departmentStudents = entry.getValue();
                    double avgGpa = departmentStudents.stream().map(Student::getGpa)
                            .filter(Objects::nonNull).mapToDouble(Double::doubleValue).average().orElse(0.0);
                    double percent = students.isEmpty() ? 0.0 : (departmentStudents.size() * 100.0 / students.size());
                    return new DepartmentAnalytics(entry.getKey(), departmentStudents.size(), round(percent), round(avgGpa));
                })
                .sorted(Comparator.comparingLong(DepartmentAnalytics::count).reversed()
                        .thenComparing(DepartmentAnalytics::name, Comparator.nullsLast(String::compareToIgnoreCase)))
                .toList();

        return new AnalyticsOverviewResponse(
                students.size(),
                averageGpa,
                courses.stream().filter(course -> course.getEnrolled() != null && course.getEnrolled() > 0).count(),
                distribution,
                term,
                department,
                Instant.now());
    }

    private static String normalize(String value) {
        if (value == null || value.isBlank() || "All".equalsIgnoreCase(value)) {
            return null;
        }
        return value.trim().replaceAll("(?i)\\s+Semester\\s+", " ");
    }

    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
