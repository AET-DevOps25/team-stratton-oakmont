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
@CrossOrigin(origins = "*") // Configure this properly for production
public class HomeController {

    @Autowired
    private AiAdvisorService aiAdvisorService;





}