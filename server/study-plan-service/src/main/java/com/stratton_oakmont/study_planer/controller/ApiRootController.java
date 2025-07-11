package com.stratton_oakmont.study_planer.controller;

import com.stratton_oakmont.study_planer.dto.CreateStudyPlanRequest;
import com.stratton_oakmont.study_planer.dto.StudyPlanDto;
import com.stratton_oakmont.study_planer.dto.StudyProgramDto;
import com.stratton_oakmont.study_planer.entity.StudyPlan;
import com.stratton_oakmont.study_planer.entity.studydata.StudyProgram;
import com.stratton_oakmont.study_planer.service.StudyPlanService;
import com.stratton_oakmont.study_planer.service.StudyProgramService;
import com.stratton_oakmont.study_planer.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * API Controller that handles root-level API endpoints after ingress rewrite
 * Maps to root path "/" to handle ingress-rewritten paths like /api/v1/my, /api/v1/study-programs, etc.
 */
@RestController
@RequestMapping("/")
@CrossOrigin(origins = {
    "https://tum-study-planner.student.k8s.aet.cit.tum.de",
    "http://localhost:5173", 
    "http://localhost:3000"
})
public class ApiRootController {

    private final StudyPlanService studyPlanService;
    private final StudyProgramService studyProgramService;
    private final JwtUtil jwtUtil;
    private static final Logger logger = LoggerFactory.getLogger(ApiRootController.class);

    @Autowired
    public ApiRootController(StudyPlanService studyPlanService, StudyProgramService studyProgramService, JwtUtil jwtUtil) {
        this.studyPlanService = studyPlanService;
        this.studyProgramService = studyProgramService;
        this.jwtUtil = jwtUtil;
        logger.info("LOG: ApiRootController initialized successfully");
    }

    // POST / - Create new study plan (from /api/study-plan/ -> /api/v1/)
    @PostMapping({"", "/"})
    public ResponseEntity<StudyPlanDto> createStudyPlan(
        @Valid @RequestBody CreateStudyPlanRequest request,
        @RequestHeader("Authorization") String authorizationHeader) {

        try {
            // Extract and validate JWT token
            String token = jwtUtil.extractTokenFromHeader(authorizationHeader);
            if (token == null || !jwtUtil.isTokenValid(token)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "INVALID_TOKEN");
                error.put("message", "Invalid or missing JWT token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }

            // Extract user ID from JWT token
            Long userId = jwtUtil.extractUserIdFromToken(token);
            if (userId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "INVALID_TOKEN");
                error.put("message", "User ID not found in token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }

            // Create StudyPlan entity using user ID from token
            StudyPlan newPlan = studyPlanService.createStudyPlanForUser(
                userId,
                request.getStudyProgramId(), 
                request.getName()
            );
            
            // Set plan data if provided
            if (request.getPlanData() != null) {
                newPlan.setPlanData(request.getPlanData());
                newPlan = studyPlanService.updateStudyPlan(newPlan.getId(), newPlan);
            }
            
            StudyPlanDto responseDto = convertToStudyPlanDto(newPlan);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "TOKEN_PROCESSING_ERROR");
            error.put("message", "Error processing JWT token: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    // GET /my - Get study plans for authenticated user (from /api/study-plan/my -> /api/v1/my)
    @GetMapping("/my")
    public ResponseEntity<?> getMyStudyPlans(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            // Extract and validate JWT token
            String token = jwtUtil.extractTokenFromHeader(authorizationHeader);
            if (token == null || !jwtUtil.isTokenValid(token)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "INVALID_TOKEN");
                error.put("message", "Invalid or missing JWT token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            // Extract user ID from JWT token
            Long userId = jwtUtil.extractUserIdFromToken(token);
            if (userId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "INVALID_TOKEN");
                error.put("message", "User ID not found in token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            // Get study plans for authenticated user
            List<StudyPlan> studyPlans = studyPlanService.getUserStudyPlansOrderedByCreatedDate(userId);
            List<StudyPlanDto> studyPlanDtos = studyPlans.stream()
                    .map(this::convertToStudyPlanDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(studyPlanDtos);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "TOKEN_PROCESSING_ERROR");
            error.put("message", "Error processing JWT token: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    // GET /study-programs - Get all study programs (from /api/study-plan/study-programs -> /api/v1/study-programs)
    @GetMapping("/study-programs")
    public ResponseEntity<List<StudyProgramDto>> getAllStudyPrograms() {
        List<StudyProgram> programs = studyProgramService.getAllStudyPrograms();
        List<StudyProgramDto> dtos = programs.stream()
            .map(this::convertToStudyProgramDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // GET /study-programs/{id} - Get specific study program
    @GetMapping("/study-programs/{id}")
    public ResponseEntity<StudyProgramDto> getStudyProgramById(@PathVariable Long id) {
        StudyProgram program = studyProgramService.getStudyProgramById(id);
        return ResponseEntity.ok(convertToStudyProgramDto(program));
    }

    // Helper method to convert StudyPlan entity to DTO
    private StudyPlanDto convertToStudyPlanDto(StudyPlan studyPlan) {
        StudyPlanDto dto = new StudyPlanDto();
        dto.setId(studyPlan.getId());
        dto.setName(studyPlan.getName());
        dto.setUserId(studyPlan.getUserId());
        dto.setPlanData(studyPlan.getPlanData());
        dto.setIsActive(studyPlan.getIsActive());
        dto.setCreatedDate(studyPlan.getCreatedDate() != null ? studyPlan.getCreatedDate().toString() : null);
        dto.setLastModified(studyPlan.getLastModified() != null ? studyPlan.getLastModified().toString() : null);
        dto.setStudyProgramId(studyPlan.getStudyProgramId());
        dto.setStudyProgramName(studyPlan.getStudyProgramName());
        return dto;
    }

    // Helper method to convert StudyProgram entity to DTO
    private StudyProgramDto convertToStudyProgramDto(StudyProgram program) {
        StudyProgramDto dto = new StudyProgramDto();
        dto.setId(program.getId());
        dto.setName(program.getDegree());
        dto.setDegreeType(program.getDegree());
        dto.setCurriculum(program.getCurriculum());
        dto.setFieldOfStudies(program.getFieldOfStudies());
        dto.setEctsCredits(program.getEctsCredits());
        dto.setSemester(program.getSemester());
        dto.setCurriculumLink(program.getCurriculumLink());
        return dto;
    }
}
