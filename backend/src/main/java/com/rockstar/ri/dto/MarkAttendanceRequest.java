package com.rockstar.ri.dto;

import com.rockstar.ri.model.AttendanceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MarkAttendanceRequest {

    @NotBlank(message = "Student ID is required")
    private String studentId;

    @NotNull(message = "Attendance status is required")
    private AttendanceStatus status;

    @Size(max = 255, message = "Remarks must not exceed 255 characters")
    private String remarks;
}
