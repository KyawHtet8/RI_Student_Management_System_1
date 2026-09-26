package com.rockstar.ri.controller;

import com.rockstar.ri.dto.AssignGradeRequest;
import com.rockstar.ri.dto.EnrollStudentRequest;
import com.rockstar.ri.dto.UpdateEnrollmentStatusRequest;
import com.rockstar.ri.model.Enrollment;
import com.rockstar.ri.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/enrollments")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService service;

    @GetMapping
    public ResponseEntity<List<Enrollment>> getAll() {
        return ResponseEntity.ok(service.getEnrollments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Enrollment> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.getEnrollmentById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Enrollment>> getByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(service.getByStudent(studentId));
    }

    @GetMapping("/course/{courseIdentifier}")
    public ResponseEntity<List<Enrollment>> getByCourse(@PathVariable String courseIdentifier) {
        return ResponseEntity.ok(service.getByCourse(courseIdentifier));
    }

    @PostMapping("/course/{courseIdentifier}")
    public ResponseEntity<Enrollment> enroll(@PathVariable String courseIdentifier,
                                             @Valid @RequestBody EnrollStudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.enrollStudent(courseIdentifier, request));
    }

    @PostMapping({"/course/{courseIdentifier}/enroll", "/courses/{courseIdentifier}/enroll",
            "/enroll/{courseIdentifier}"})
    public ResponseEntity<Enrollment> enrollExplicitly(@PathVariable String courseIdentifier,
                                                        @Valid @RequestBody EnrollStudentRequest request) {
        return enroll(courseIdentifier, request);
    }

    // Alias for clients that use /enrollments/{courseIdentifier} as the create route.
    @PostMapping("/{courseIdentifier}")
    public ResponseEntity<Enrollment> enrollUsingIdentifier(@PathVariable String courseIdentifier,
                                                            @Valid @RequestBody EnrollStudentRequest request) {
        return enroll(courseIdentifier, request);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Enrollment> updateStatus(@PathVariable String id,
                                                   @Valid @RequestBody UpdateEnrollmentStatusRequest request) {
        return ResponseEntity.ok(service.updateStatus(id, request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Enrollment> replaceStatus(@PathVariable String id,
                                                     @Valid @RequestBody UpdateEnrollmentStatusRequest request) {
        return updateStatus(id, request);
    }

    @PutMapping("/{id}/grade")
    public ResponseEntity<Enrollment> assignGrade(@PathVariable String id,
                                                  @Valid @RequestBody AssignGradeRequest request) {
        return ResponseEntity.ok(service.assignGrade(id, request));
    }

    @PostMapping("/{id}/grade")
    public ResponseEntity<Enrollment> postGrade(@PathVariable String id,
                                                @Valid @RequestBody AssignGradeRequest request) {
        return assignGrade(id, request);
    }

    @PatchMapping("/{id}/drop")
    public ResponseEntity<Enrollment> drop(@PathVariable String id) {
        UpdateEnrollmentStatusRequest request = new UpdateEnrollmentStatusRequest();
        request.setStatus("Dropped");
        return updateStatus(id, request);
    }

    @PostMapping("/{id}/drop")
    public ResponseEntity<Enrollment> postDrop(@PathVariable String id) {
        return drop(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.deleteEnrollment(id);
        return ResponseEntity.noContent().build();
    }
}
