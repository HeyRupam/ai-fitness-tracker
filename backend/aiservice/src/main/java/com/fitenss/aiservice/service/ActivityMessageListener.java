package com.fitenss.aiservice.service;

import com.fitenss.aiservice.model.Activity;
import com.fitenss.aiservice.model.Recomendation;
import com.fitenss.aiservice.repository.RecomondationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
class ActivityMessageListener {

    private final ActivityAIService activityAIService;
    private final RecomondationRepository recomondationRepository;

    @RabbitListener(queues = "${rabbitmq.queue.name}")
    public void processActivity(Activity activity){
        log.info("Received activity for processing: {}", activity);
//        log.info("Generate recommendation: {}", activityAIService.generateRecomendation(activity));

        Recomendation recomendation = activityAIService.generateRecomendation(activity);
        recomondationRepository.save(recomendation);
    }
}
