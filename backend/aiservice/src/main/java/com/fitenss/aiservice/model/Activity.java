package com.fitenss.aiservice.model;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
public class Activity {
    private String id;
    private String userId;
    private String type;
    private Integer duration;
    private Integer caloriesBurned;
    private LocalDateTime startTime;
    private LocalDateTime createAt;
    private Map<String, Object> additionalMetrics;
    private LocalDateTime updatedAt;

}
