package com.rockstar.ri.config;

import com.rockstar.ri.model.Student;
import com.rockstar.ri.model.Course;
import com.rockstar.ri.model.AttendanceRecord;
import com.rockstar.ri.model.AttendanceStatus;
import com.rockstar.ri.model.Enrollment;
import com.rockstar.ri.repository.CourseRepository;
import com.rockstar.ri.repository.AttendanceRecordRepository;
import com.rockstar.ri.repository.EnrollmentRepository;
import com.rockstar.ri.repository.StudentRepository;
import com.rockstar.ri.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final EnrollmentService enrollmentService;

    @Override
    public void run(String... args) {
        if (studentRepository.count() == 0) {
            Student s1 = Student.builder()
                    .id("std-001")
                    .studentId("U-2026-1082")
                    .firstName("Alexander")
                    .lastName("Vance")
                    .email("a.vance@rockstar.edu")
                    .major("Computer Science")
                    .department("Computer Science")
                    .year("Senior")
                    .gpa(3.92)
                    .status("Active")
                    .tuitionStatus("Paid")
                    .advisor("Dr. Sarah Jenkins")
                    .enrollmentDate(LocalDate.now().minusYears(3))
                    .build();

            Student s2 = Student.builder()
                    .id("std-002")
                    .studentId("U-2026-2104")
                    .firstName("Elena")
                    .lastName("Rostova")
                    .email("e.rostova@rockstar.edu")
                    .major("Biomedical Engineering")
                    .department("Engineering")
                    .year("Junior")
                    .gpa(3.78)
                    .status("Active")
                    .tuitionStatus("Paid")
                    .advisor("Prof. David K.")
                    .enrollmentDate(LocalDate.now().minusYears(2))
                    .build();

            studentRepository.saveAll(List.of(s1, s2));
            log.info(">>> [ROCKSTAR SIS] Initialized 2 Sample Students successfully!");
        }
        ensureMinimumStudents(20);
        if (courseRepository.count() == 0) {
            courseRepository.saveAll(List.of(
                    Course.builder().id("crs-001").code("CS-101").name("Introduction to Computer Science")
                            .credits(3).department("Computer Science").instructor("Dr. Alan Turing")
                            .capacity(45).enrolled(38).semester("Fall 2026")
                            .schedule("Mon/Wed 09:00 - 10:30 AM").room("Turing Hall 101").build(),
                    Course.builder().id("crs-002").code("MATH-201").name("Linear Algebra & Differential Equations")
                            .credits(4).department("Mathematics").instructor("Prof. Katherine Johnson")
                            .capacity(35).enrolled(32).semester("Fall 2026")
                            .schedule("Tue/Thu 11:00 - 12:30 PM").room("Euler Hall 204").build(),
                    Course.builder().id("crs-003").code("ENG-105").name("Academic & Technical Writing")
                            .credits(2).department("Humanities").instructor("Dr. Maya Angelou")
                            .capacity(30).enrolled(15).semester("Fall 2026")
                            .schedule("Fri 13:00 - 15:00 PM").room("Humanities 3B").build()
            ));
            log.info(">>> [ROCKSTAR SIS] Initialized 3 Sample Courses successfully!");
        }

        // Keep the Academic Record view useful on a fresh installation.
        // These records are only created when the related tables are empty.
        if (enrollmentRepository.count() == 0) {
            enrollmentRepository.saveAll(List.of(
                    Enrollment.builder()
                            .id("enr-001")
                            .studentId("std-001")
                            .courseId("crs-001")
                            .enrollmentDate(LocalDate.now().minusMonths(2).toString())
                            .status("Enrolled")
                            .grade("A-")
                            .semester("Fall 2026")
                            .build(),
                    Enrollment.builder()
                            .id("enr-002")
                            .studentId("std-001")
                            .courseId("crs-002")
                            .enrollmentDate(LocalDate.now().minusMonths(2).toString())
                            .status("Enrolled")
                            .grade("B+")
                            .semester("Fall 2026")
                            .build(),
                    Enrollment.builder()
                            .id("enr-003")
                            .studentId("std-002")
                            .courseId("crs-003")
                            .enrollmentDate(LocalDate.now().minusMonths(2).toString())
                            .status("Enrolled")
                            .grade("A")
                            .semester("Fall 2026")
                            .build()
            ));
            log.info(">>> [ROCKSTAR SIS] Initialized sample enrollments successfully!");
        }

        if (attendanceRecordRepository.count() == 0) {
            attendanceRecordRepository.saveAll(List.of(
                    AttendanceRecord.builder().id("att-001").studentId("std-001").courseId("crs-001")
                            .date(LocalDate.now().minusDays(14).toString()).status(AttendanceStatus.Present).build(),
                    AttendanceRecord.builder().id("att-002").studentId("std-001").courseId("crs-001")
                            .date(LocalDate.now().minusDays(7).toString()).status(AttendanceStatus.Late).build(),
                    AttendanceRecord.builder().id("att-003").studentId("std-001").courseId("crs-002")
                            .date(LocalDate.now().minusDays(10).toString()).status(AttendanceStatus.Present).build(),
                    AttendanceRecord.builder().id("att-004").studentId("std-002").courseId("crs-003")
                            .date(LocalDate.now().minusDays(5).toString()).status(AttendanceStatus.Absent).build()
            ));
            log.info(">>> [ROCKSTAR SIS] Initialized sample attendance successfully!");
        }

        // GPA is derived data. Rebuild it from the current enrollment grades
        // on startup so seeded and legacy records cannot leave stale values.
        studentRepository.findAll().forEach(student ->
                enrollmentService.recalculateStudentGpa(student.getId()));
        log.info(">>> [ROCKSTAR SIS] Recalculated GPA values from enrollment records");
    }

    /**
     * Keep a useful demo roster available without overwriting real records.
     * Existing students are never changed or deleted, and generated IDs are
     * deterministic so restarting the application is idempotent.
     */
    private void ensureMinimumStudents(int minimum) {
        long currentCount = studentRepository.count();
        if (currentCount >= minimum) {
            return;
        }

        List<Student> additionalStudents = new ArrayList<>();
        for (int number = 1; currentCount + additionalStudents.size() < minimum; number++) {
            String id = String.format("std-demo-%03d", number);
            if (studentRepository.existsById(id)) {
                continue;
            }

            String department = switch (number % 4) {
                case 0 -> "Computer Science";
                case 1 -> "Engineering";
                case 2 -> "Data Science & AI";
                default -> "Business Administration";
            };

            additionalStudents.add(Student.builder()
                    .id(id)
                    .studentId(String.format("U-2026-%04d", 3000 + number))
                    .firstName("Demo")
                    .lastName(String.format("Student %02d", number))
                    .email(String.format("demo.student.%02d@rockstar.edu", number))
                    .major(department)
                    .department(department)
                    .year(number % 4 == 0 ? "Senior" : number % 3 == 0 ? "Junior" : "Sophomore")
                    .gpa(Math.round((2.70 + (number % 13) * 0.1) * 100.0) / 100.0)
                    .status("Active")
                    .tuitionStatus(number % 5 == 0 ? "Partial" : "Paid")
                    .advisor("Dr. Academic Advisor")
                    .enrollmentDate(LocalDate.now().minusMonths(number % 24))
                    .build());
        }

        if (!additionalStudents.isEmpty()) {
            studentRepository.saveAll(additionalStudents);
            log.info(">>> [ROCKSTAR SIS] Added {} demo students; roster now contains at least {} students.",
                    additionalStudents.size(), minimum);
        }
    }
}
