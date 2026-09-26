package com.rockstar.ri.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EnrollStudentRequest {

    @NotBlank(message = "Student ID is required")
    private String studentId;
}
