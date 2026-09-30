package com.rockstar.ri.dto;

import lombok.Data;

/** Optional filters for the analytics overview. */
@Data
public class AnalyticsOverviewRequest {
    private String term;
    private String department;
}
