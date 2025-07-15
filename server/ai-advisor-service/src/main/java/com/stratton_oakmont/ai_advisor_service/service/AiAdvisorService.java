package com.stratton_oakmont.ai_advisor_service.service;

import com.stratton_oakmont.ai_advisor_service.model.ChatRequest;
import com.stratton_oakmont.ai_advisor_service.model.ChatResponse;
import com.stratton_oakmont.ai_advisor_service.model.CourseInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

@Service
public class AiAdvisorService {

    private final WebClient webClient;
    
    @Value("${llm.inference.service.url:http://localhost:8082}")
    private String llmServiceUrl;

    public AiAdvisorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public Mono<ChatResponse> processChat(ChatRequest request) {
        return webClient
                .post()
                .uri(llmServiceUrl + "/chat/")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(ChatResponse.class)
                .onErrorReturn(WebClientResponseException.class, 
                    createFallbackResponse("I'm currently unable to access the course database. Please try again later."))
                .onErrorReturn(Exception.class, 
                    createFallbackResponse("An error occurred while processing your request. Please try again."));
    }

    public Mono<CourseInfo> getCourseInfo(String courseCode) {
        return webClient
                .get()
                .uri(llmServiceUrl + "/course/" + courseCode)
                .retrieve()
                .bodyToMono(CourseInfo.class)
                .onErrorReturn(WebClientResponseException.NotFound.class, null);
    }

    public Mono<Boolean> checkHealth() {
        return webClient
                .get()
                .uri(llmServiceUrl + "/health")
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> true)
                .onErrorReturn(false);
    }

    private ChatResponse createFallbackResponse(String message) {
        return new ChatResponse(message, Arrays.asList(), 0.0, Arrays.asList());
    }
}
