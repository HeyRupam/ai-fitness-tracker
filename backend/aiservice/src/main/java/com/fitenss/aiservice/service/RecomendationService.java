package com.fitenss.aiservice.service;

import com.fitenss.aiservice.model.Recomendation;
import com.fitenss.aiservice.repository.RecomondationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecomendationService {
    private final RecomondationRepository recomondationRepository;

    public List<Recomendation> getUserRecomendation(String userId) {
       return recomondationRepository.findByUserId(userId);
    }

    public Recomendation getActivityRecomendation(String activityId) {
        return recomondationRepository.findByActivityId(activityId)
                .orElseThrow(() -> new RuntimeException("No recomendation found for this activity: " + activityId));
    }
}
