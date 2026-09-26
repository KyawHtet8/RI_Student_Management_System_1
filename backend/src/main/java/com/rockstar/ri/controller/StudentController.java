package com.rockstar.ri.controller;

import com.rockstar.ri.dto.BatchStatusRequest;
import com.rockstar.ri.model.Student;
import com.rockstar.ri.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*") // Frontend မှ လာခေါ်ခွင့်ပြုခြင်း
public class StudentController {

    private final StudentService service;

    // =========================================================================
    // 1. GET ALL STUDENTS (ဌာနအလိုက် Filter ပါဝင်သည်)
    // URL: GET http://localhost:8080/api/v1/students?department=Computer%20Science
    // =========================================================================
    @GetMapping
    public ResponseEntity<List<Student>> getStudents(
            @RequestParam(required = false) String department) {
        log.info("REST request to get students, department filter: {}", department);
        List<Student> students = service.getStudents(department);
        return ResponseEntity.ok(students); // 200 OK with JSON array
    }

    // =========================================================================
    // 2. GET SINGLE STUDENT BY ID
    // URL: GET http://localhost:8080/api/v1/students/std-001
    // =========================================================================
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudent(@PathVariable String id) {
        log.info("REST request to get student by ID: {}", id);
        return ResponseEntity.ok(service.getStudentById(id));
    }

    // =========================================================================
    // 3. CREATE NEW STUDENT (ကျောင်းသားအသစ် မှတ်ပုံတင်ခြင်း)
    // URL: POST http://localhost:8080/api/v1/students
    // =========================================================================
    @PostMapping
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        log.info("REST request to register new student: {} {}", student.getFirstName(), student.getLastName());
        Student createdStudent = service.createStudent(student);
        // REST Best Practice: Data အသစ်ဖန်တီးပြီးပါက 201 CREATED status ပြန်ရပါသည်
        return new ResponseEntity<>(createdStudent, HttpStatus.CREATED);
    }

    // =========================================================================
    // 4. UPDATE STUDENT (အချက်အလက် ပြင်ဆင်ခြင်း)
    // URL: PUT http://localhost:8080/api/v1/students/std-001
    // =========================================================================
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(
            @PathVariable String id,
            @RequestBody Student student) {
        log.info("REST request to update student ID: {}", id);
        return ResponseEntity.ok(service.updateStudent(id, student));
    }

    // =========================================================================
    // 5. DELETE STUDENT (ကျောင်းသား စာရင်းဖျက်ခြင်း)
    // URL: DELETE http://localhost:8080/api/v1/students/std-001
    // =========================================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable String id) {
        log.info("REST request to delete student ID: {}", id);
        service.deleteStudent(id);
        // REST Best Practice: ဖျက်ပြီးပါက ပြန်ပြစရာ Body မလိုသဖြင့် 204 NO CONTENT ပြန်ပါသည်
        return ResponseEntity.noContent().build();
    }

    // =========================================================================
    // 6. BATCH UPDATE STATUS (ကျောင်းသားအများအပြားကို တစ်ပြိုင်နက် Status ပြောင်းခြင်း)
    // URL: POST http://localhost:8080/api/v1/students/batch-status
    // Payload: { "ids": ["std-001", "std-002"], "status": "Active" }
    // =========================================================================
    @PostMapping("/batch-status")
    public ResponseEntity<Void> batchUpdateStatus(@Valid @RequestBody BatchStatusRequest request) {
        log.info("REST request to batch update status to '{}' for {} students", 
                request.status(), request.ids().size());
        service.batchUpdateStatus(request.ids(), request.status());
        return ResponseEntity.ok().build();
    }
}
