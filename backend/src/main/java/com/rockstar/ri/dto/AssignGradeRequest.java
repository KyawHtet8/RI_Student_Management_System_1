package com.rockstar.ri.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssignGradeRequest {

    @NotBlank(message = "Grade is required")
    private String grade;

    private boolean markCompleted;
}
