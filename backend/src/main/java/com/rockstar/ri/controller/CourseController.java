package com.rockstar.ri.controller;

import com.rockstar.ri.dto.CreateCourseRequest;
import com.rockstar.ri.dto.UpdateCourseRequest;
import com.rockstar.ri.model.Course;
import com.rockstar.ri.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/courses")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
public class CourseController {
    private final CourseService service;

    @GetMapping
    public ResponseEntity<List<Course>> getCourses() { return ResponseEntity.ok(service.getCourses()); }

    @GetMapping("/search")
    public ResponseEntity<List<Course>> search(@RequestParam(name = "q", required = false) String query) {
        return ResponseEntity.ok(service.searchCourses(query));
    }

    @GetMapping("/{identifier}")
    public ResponseEntity<Course> getCourse(@PathVariable String identifier) {
        return ResponseEntity.ok(service.getCourseById(identifier));
    }

    @PostMapping
    public ResponseEntity<Course> create(@Valid @RequestBody CreateCourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createCourse(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> update(@PathVariable String id, @Valid @RequestBody UpdateCourseRequest request) {
        return ResponseEntity.ok(service.updateCourse(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
}
