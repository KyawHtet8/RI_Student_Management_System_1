package com.rockstar.ri.dto;

import java.time.Instant;
import java.util.List;

public record AnalyticsOverviewResponse(
        long totalStudents,
        double averageGPA,
        long activeCourses,
        List<DepartmentAnalytics> departmentDistribution,
        String term,
        String department,
        Instant generatedAt) {
}
