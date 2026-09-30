package com.rockstar.ri.controller;

import com.rockstar.ri.dto.AnalyticsOverviewRequest;
import com.rockstar.ri.dto.AnalyticsOverviewResponse;
import com.rockstar.ri.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * GET /api/v1/analytics/overview?term=Fall%202026&department=Computer%20Science
     */
    @GetMapping("/overview")
    public ResponseEntity<AnalyticsOverviewResponse> getOverview(
            @ModelAttribute AnalyticsOverviewRequest request) {
        return ResponseEntity.ok(analyticsService.getOverview(request));
    }
}
