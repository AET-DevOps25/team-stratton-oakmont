package com.stratton_oakmont.ai_advisor_service;

import com.stratton_oakmont.ai_advisor_service.model.ChatRequest;
import com.stratton_oakmont.ai_advisor_service.model.ChatResponse;
import com.stratton_oakmont.ai_advisor_service.model.CourseInfo;
import com.stratton_oakmont.ai_advisor_service.service.AiAdvisorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import reactor.core.publisher.Mono;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = {
    "https://tum-study-planner.student.k8s.aet.cit.tum.de",
    "http://localhost:5173", 
    "http://localhost:3000",
    "http://localhost:80",
    "http://localhost",
})
public class AiAdvisorController {

    @Autowired
    private AiAdvisorService aiAdvisorService;

    @PostMapping("/chat")
    public Mono<ResponseEntity<ChatResponse>> chat(@Valid @RequestBody ChatRequest request) {
        return aiAdvisorService.processChat(request)
                .map(response -> ResponseEntity.ok(response))
                .onErrorReturn(ResponseEntity.status(500).build());
    }

    @GetMapping("/course/{courseCode}")
    public Mono<ResponseEntity<?>> getCourseInfo(@PathVariable String courseCode) {
        return aiAdvisorService.getCourseInfo(courseCode)
                .map(courseInfo -> {
                    if (courseInfo != null) {
                        return ResponseEntity.ok(courseInfo);
                    } else {
                        return ResponseEntity.notFound().build();
                    }
                })
                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new CourseInfo())));
    }

    @GetMapping("/health")
    public Mono<ResponseEntity<Map<String, Object>>> healthCheck() {
        return aiAdvisorService.checkHealth()
                .map(isHealthy -> {
                    Map<String, Object> health = Map.of(
                        "status", isHealthy ? "healthy" : "unhealthy",
                        "llm_service_available", isHealthy
                    );
                    return ResponseEntity.ok(health);
                });
    }

    @GetMapping("/")
    public ResponseEntity<Map<String, String>> root() {
        return ResponseEntity.ok(Map.of("message", "AI Advisor Service is running"));
    }

}
