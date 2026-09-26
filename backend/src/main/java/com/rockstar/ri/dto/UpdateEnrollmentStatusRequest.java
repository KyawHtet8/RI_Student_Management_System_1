package com.rockstar.ri.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateEnrollmentStatusRequest {

    @NotBlank(message = "Status is required")
    private String status;
}
