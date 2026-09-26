package com.rockstar.ri.dto;

import lombok.Builder;

@Builder
public record AttendanceStatistics(
        String studentId,
        String courseId,
        long totalSessions,
        long present,
        long late,
        long absent,
        long excused,
        double attendanceRate) {
}
