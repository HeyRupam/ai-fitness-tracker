package com.fitenss.aiservice.repository;

import com.fitenss.aiservice.model.Recomendation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RecomondationRepository extends MongoRepository<Recomendation, String> {
    List<Recomendation> findByUserId(String userId);

    Optional<Recomendation> findByActivityId(String activityId);
}
