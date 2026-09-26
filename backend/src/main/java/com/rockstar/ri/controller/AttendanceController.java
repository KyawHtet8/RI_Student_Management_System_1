package com.rockstar.ri.controller;

import com.rockstar.ri.dto.AttendanceStatistics;
import com.rockstar.ri.dto.BulkAttendanceRequest;
import com.rockstar.ri.dto.MarkAttendanceRequest;
import com.rockstar.ri.model.AttendanceRecord;
import com.rockstar.ri.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService service;

    @GetMapping("/course/{courseIdentifier}/date/{date}")
    public ResponseEntity<List<AttendanceRecord>> getForClass(@PathVariable String courseIdentifier,
                                                               @PathVariable String date) {
        return ResponseEntity.ok(service.getAttendance(courseIdentifier, date));
    }

    @GetMapping("/student/{studentId}/course/{courseIdentifier}")
    public ResponseEntity<List<AttendanceRecord>> getForStudent(@PathVariable String studentId,
                                                                 @PathVariable String courseIdentifier) {
        return ResponseEntity.ok(service.getStudentAttendance(studentId, courseIdentifier));
    }

    @GetMapping("/student/{studentId}/course/{courseIdentifier}/statistics")
    public ResponseEntity<AttendanceStatistics> getStatistics(@PathVariable String studentId,
                                                               @PathVariable String courseIdentifier) {
        return ResponseEntity.ok(service.getStatistics(studentId, courseIdentifier));
    }

    @PostMapping("/course/{courseIdentifier}/date/{date}")
    public ResponseEntity<AttendanceRecord> mark(@PathVariable String courseIdentifier,
                                                 @PathVariable String date,
                                                 @Valid @RequestBody MarkAttendanceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.markAttendance(courseIdentifier, date, request));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<AttendanceRecord>> markBulk(@Valid @RequestBody BulkAttendanceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.markBulkAttendance(request));
    }
}
