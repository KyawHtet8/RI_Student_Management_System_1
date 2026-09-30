package com.rockstar.ri.dto;

public record DepartmentAnalytics(
        String name,
        long count,
        double percent,
        double avgGpa) {
}
