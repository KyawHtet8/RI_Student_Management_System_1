package com.rockstar.ri.config;

import com.rockstar.ri.model.Student;
import com.rockstar.ri.model.Course;
import com.rockstar.ri.repository.CourseRepository;
import com.rockstar.ri.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

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
    }
}
