package com.fitenss.aiservice.controller;

import com.fitenss.aiservice.model.Recomendation;
import com.fitenss.aiservice.service.RecomendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recomendation")
public class RecomondationController {
    private final RecomendationService recomendationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Recomendation>> getUserRecomendation(@PathVariable String userId){
        return  ResponseEntity.ok(recomendationService.getUserRecomendation(userId));
    }

    @GetMapping("/activity/{activityId}")
    public ResponseEntity<Recomendation> getActivityRecomendation(@PathVariable String activityId){
        return  ResponseEntity.ok(recomendationService.getActivityRecomendation(activityId));
    }

}
