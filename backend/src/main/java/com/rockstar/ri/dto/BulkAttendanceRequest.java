package com.rockstar.ri.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.List;

@Data
public class BulkAttendanceRequest {

    @NotBlank(message = "Course ID is required")
    private String courseId;

    @NotBlank(message = "Attendance date is required")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Date must use ISO format YYYY-MM-DD")
    private String date;

    @NotEmpty(message = "At least one attendance record is required")
    @Valid
    private List<MarkAttendanceRequest> records;
}
