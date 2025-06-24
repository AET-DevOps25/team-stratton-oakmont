package com.stratton_oakmont.study_planer.controller;

import com.stratton_oakmont.study_planer.dto.CreateStudyPlanRequest;
import com.stratton_oakmont.study_planer.dto.StudyPlanDto;
import com.stratton_oakmont.study_planer.dto.StudyProgramDto;
import com.stratton_oakmont.study_planer.entity.StudyPlan;
import com.stratton_oakmont.study_planer.entity.StudyProgram;
import com.stratton_oakmont.study_planer.service.StudyPlanService;
import com.stratton_oakmont.study_planer.service.StudyProgramService;
import com.stratton_oakmont.study_planer.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:5173")
public class StudyPlanController {

    private final StudyPlanService studyPlanService;
    private final StudyProgramService studyProgramService;
    private final JwtUtil jwtUtil;

    @Autowired
    public StudyPlanController(StudyPlanService studyPlanService, StudyProgramService studyProgramService, JwtUtil jwtUtil) {
        this.studyPlanService = studyPlanService;
        this.studyProgramService = studyProgramService;
        this.jwtUtil = jwtUtil;
    }

    // POST /api/v1/study-plans - Create new study plan
    @PostMapping("/study-plans")
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

            // Extract user ID from JWT token (not from request body)
            Long userId = jwtUtil.extractUserIdFromToken(token);
            if (userId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "INVALID_TOKEN");
                error.put("message", "User ID not found in token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }

            // Create StudyPlan entity using user ID from token
            StudyPlan newPlan = studyPlanService.createStudyPlanForUser(
                userId,  // Use userId from JWT token, not from request
                request.getStudyProgramId(), 
                request.getName()
            );
            
            // Set plan data if provided
            if (request.getPlanData() != null) {
                newPlan.setPlanData(request.getPlanData());
                newPlan = studyPlanService.updateStudyPlan(newPlan.getId(), newPlan);
            }
            
            StudyPlanDto responseDto = convertToDto(newPlan);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "TOKEN_PROCESSING_ERROR");
            error.put("message", "Error processing JWT token: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    // GET /api/v1/study-plans/my - Get study plans for authenticated user
    @GetMapping("/study-plans/my")
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
            List<StudyPlan> studyPlans = studyPlanService.getStudyPlansByUserId(userId);
            List<StudyPlanDto> studyPlanDtos = studyPlans.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(studyPlanDtos);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "TOKEN_PROCESSING_ERROR");
            error.put("message", "Error processing JWT token: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    // GET /api/v1/study-plans - List all study plans (admin only - for now keep as is)
    // TODO [ ]: remove this API path before deploying, unsecure endpoint !! 
    @GetMapping("/study-plans")
    public ResponseEntity<List<StudyPlanDto>> getAllStudyPlans() {
        List<StudyPlan> studyPlans = studyPlanService.getAllStudyPlans();
        List<StudyPlanDto> studyPlanDtos = studyPlans.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(studyPlanDtos);
    }

    // GET /api/v1/study-plans/{id} - Get specific study plan (with ownership check)
    @GetMapping("/study-plans/{id}")
    public ResponseEntity<?> getStudyPlanById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorizationHeader) {
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

            // Get study plan and check ownership
            StudyPlan studyPlan = studyPlanService.getStudyPlanById(id);
            if (!studyPlan.getUserId().equals(userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "ACCESS_DENIED");
                error.put("message", "You can only access your own study plans");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            StudyPlanDto studyPlanDto = convertToDto(studyPlan);
            return ResponseEntity.ok(studyPlanDto);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "TOKEN_PROCESSING_ERROR"); 
            error.put("message", "Error processing JWT token: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    // Helper method to convert StudyPlan entity to DTO
    private StudyPlanDto convertToDto(StudyPlan studyPlan) {
        StudyPlanDto dto = new StudyPlanDto();
        dto.setId(studyPlan.getId());
        dto.setName(studyPlan.getName());
        dto.setUserId(studyPlan.getUserId());
        dto.setPlanData(studyPlan.getPlanData());
        dto.setIsActive(studyPlan.getIsActive());
        dto.setCreatedDate(studyPlan.getCreatedDate());
        dto.setLastModified(studyPlan.getLastModified());
        
        // Set study program info
        if (studyPlan.getStudyProgram() != null) {
            dto.setStudyProgramId(studyPlan.getStudyProgram().getId());
            dto.setStudyProgramName(studyPlan.getStudyProgram().getName());
        }
        
        return dto;
    }

    // PUT /api/v1/study-plans/{id} - Update study plan (with ownership check)
    @PutMapping("/study-plans/{id}")
    public ResponseEntity<?> updateStudyPlan(
            @PathVariable Long id,
            @Valid @RequestBody CreateStudyPlanRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
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

            // Get existing study plan and check ownership
            StudyPlan existingPlan = studyPlanService.getStudyPlanById(id);
            if (!existingPlan.getUserId().equals(userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "ACCESS_DENIED");
                error.put("message", "You can only update your own study plans");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // Update the study plan
            existingPlan.setName(request.getName());
            if (request.getPlanData() != null) {
                existingPlan.setPlanData(request.getPlanData());
            }
            
            // Update study program if different
            if (!existingPlan.getStudyProgram().getId().equals(request.getStudyProgramId())) {
                StudyProgram newProgram = studyProgramService.getStudyProgramById(request.getStudyProgramId());
                existingPlan.setStudyProgram(newProgram);
            }

            StudyPlan updatedPlan = studyPlanService.updateStudyPlan(id, existingPlan);
            StudyPlanDto responseDto = convertToDto(updatedPlan);
            return ResponseEntity.ok(responseDto);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "UPDATE_ERROR");
            error.put("message", "Error updating study plan: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

     // PATCH /api/v1/study-plans/{id} - Partial update study plan (with ownership check)
    @PatchMapping("/study-plans/{id}")
    public ResponseEntity<?> partialUpdateStudyPlan(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates,
            @RequestHeader("Authorization") String authorizationHeader) {
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

            // Get existing study plan and check ownership
            StudyPlan existingPlan = studyPlanService.getStudyPlanById(id);
            if (!existingPlan.getUserId().equals(userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "ACCESS_DENIED");
                error.put("message", "You can only update your own study plans");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // Apply partial updates
            if (updates.containsKey("name")) {
                existingPlan.setName((String) updates.get("name"));
            }
            if (updates.containsKey("planData")) {
                existingPlan.setPlanData((String) updates.get("planData"));
            }
            if (updates.containsKey("isActive")) {
                existingPlan.setIsActive((Boolean) updates.get("isActive"));
            }
            if (updates.containsKey("studyProgramId")) {
                Long newProgramId = Long.valueOf(updates.get("studyProgramId").toString());
                StudyProgram newProgram = studyProgramService.getStudyProgramById(newProgramId);
                existingPlan.setStudyProgram(newProgram);
            }

            StudyPlan updatedPlan = studyPlanService.updateStudyPlan(id, existingPlan);
            StudyPlanDto responseDto = convertToDto(updatedPlan);
            return ResponseEntity.ok(responseDto);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "PATCH_ERROR");
            error.put("message", "Error partially updating study plan: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // PUT /api/v1/study-plans/{id}/rename - Rename study plan (with ownership check)
    @PutMapping("/study-plans/{id}/rename")
    public ResponseEntity<?> renameStudyPlan(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authorizationHeader) {
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

            // Validate request body
            String newName = request.get("name");
            if (newName == null || newName.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "INVALID_NAME");
                error.put("message", "New name is required and cannot be empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            if (newName.length() > 200) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "INVALID_NAME");
                error.put("message", "Study plan name cannot exceed 200 characters");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Get study plan and check ownership
            StudyPlan studyPlan = studyPlanService.getStudyPlanById(id);
            if (!studyPlan.getUserId().equals(userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "ACCESS_DENIED");
                error.put("message", "You can only rename your own study plans");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // Update only the name
            String oldName = studyPlan.getName();
            studyPlan.setName(newName.trim());
            StudyPlan updatedPlan = studyPlanService.updateStudyPlan(id, studyPlan);
            
            // Return success response with old and new names
            Map<String, String> response = new HashMap<>();
            response.put("message", "Study plan renamed successfully");
            response.put("id", id.toString());
            response.put("oldName", oldName);
            response.put("newName", updatedPlan.getName());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "RENAME_ERROR");
            error.put("message", "Error renaming study plan: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // DELETE /api/v1/study-plans/{id} - Delete study plan (with ownership check)
    @DeleteMapping("/study-plans/{id}")
    public ResponseEntity<?> deleteStudyPlan(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorizationHeader) {
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

            // Get study plan and check ownership
            StudyPlan studyPlan = studyPlanService.getStudyPlanById(id);
            if (!studyPlan.getUserId().equals(userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "ACCESS_DENIED");
                error.put("message", "You can only delete your own study plans");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // Delete the study plan
            studyPlanService.deleteStudyPlan(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Study plan deleted successfully");
            response.put("deletedId", id.toString());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "DELETE_ERROR");
            error.put("message", "Error deleting study plan: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Exception handlers
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.badRequest().body(errors);
    }
}