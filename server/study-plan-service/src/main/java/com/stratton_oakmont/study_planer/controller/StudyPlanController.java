package com.stratton_oakmont.study_planer.controller;

import com.stratton_oakmont.study_planer.dto.CreateStudyPlanRequest;
import com.stratton_oakmont.study_planer.dto.StudyPlanDto;
import com.stratton_oakmont.study_planer.dto.StudyProgramDto;
import com.stratton_oakmont.study_planer.model.StudyPlan;
import com.stratton_oakmont.study_planer.service.StudyPlanService;
import com.stratton_oakmont.study_planer.service.StudyPlanMigrationService;
import com.stratton_oakmont.study_planer.client.ProgramCatalogClient;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("")
@CrossOrigin(origins = {
    "https://tum-study-planner.student.k8s.aet.cit.tum.de",
    "http://localhost:5173", 
    "http://localhost:3000"
})
public class StudyPlanController {

    private final StudyPlanService studyPlanService;
    private final StudyPlanMigrationService migrationService;
    private final ProgramCatalogClient programCatalogClient;
    private static final Logger logger = LoggerFactory.getLogger(StudyPlanController.class);

    @Autowired
    public StudyPlanController(StudyPlanService studyPlanService, StudyPlanMigrationService migrationService, ProgramCatalogClient programCatalogClient) {
        this.studyPlanService = studyPlanService;
        this.migrationService = migrationService;
        this.programCatalogClient = programCatalogClient;
        logger.info("LOG: StudyPlanController initialized successfully");
    }

    // Helper method to get current user ID from SecurityContext
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Long) {
            return (Long) authentication.getPrincipal();
        }
        throw new RuntimeException("User not authenticated");
    }

    // POST /api/v1/ - Create new study plan
    @PostMapping({""})
    public ResponseEntity<StudyPlanDto> createStudyPlan(@Valid @RequestBody CreateStudyPlanRequest request) {
        try {
            // Get user ID from SecurityContext (set by JWT filter)
            Long userId = getCurrentUserId();

            // Create StudyPlan entity using user ID from token
            StudyPlan newPlan = studyPlanService.createStudyPlanForUser(
                userId,
                request.getStudyProgramId(), 
                request.getName()
            );
            
            // Ensure basic semester structure for new plan
            migrationService.ensureBasicSemesterStructure(newPlan);
            
            StudyPlanDto responseDto = convertToDto(newPlan);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);

        } catch (Exception e) {
            logger.error("Error creating study plan: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // GET /my-study-plans - Get study plans for authenticated user
    @GetMapping("/my-study-plans")
    public ResponseEntity<?> getMyStudyPlans() {
        try {
            // Get user ID from SecurityContext (set by JWT filter)
            Long userId = getCurrentUserId();

            // Get study plans for authenticated user
            List<StudyPlan> studyPlans = studyPlanService.getStudyPlansByUserId(userId);
            List<StudyPlanDto> studyPlanDtos = studyPlans.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(studyPlanDtos);

        } catch (Exception e) {
            logger.error("Error fetching user study plans: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "FETCH_FAILED");
            error.put("message", "Failed to fetch study plans: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // GET /api/v1/study-plans - List all study plans (admin only - for now keep as is)
    // TODO [ ]: remove this API path before deploying, unsecure endpoint !! 
    @GetMapping("/")
    public ResponseEntity<List<StudyPlanDto>> getAllStudyPlans() {
        List<StudyPlan> studyPlans = studyPlanService.getAllStudyPlans();
        List<StudyPlanDto> studyPlanDtos = studyPlans.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(studyPlanDtos);
    }

    // GET /api/v1/study-plans/{id} - Get specific study plan (with ownership check)
    @GetMapping("/{id}")
    public ResponseEntity<?> getStudyPlanById(@PathVariable Long id) {
        try {
            // Get user ID from SecurityContext (set by JWT filter)
            Long userId = getCurrentUserId();
            
            // Get study plan by ID
            StudyPlan studyPlan = studyPlanService.getStudyPlanById(id);
            
            // Check ownership - users can only access their own study plans
            if (!studyPlan.getUserId().equals(userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "ACCESS_DENIED");
                error.put("message", "You can only access your own study plans");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            // Ensure persistence migration if needed
            migrationService.migratePlanDataIfNeeded(studyPlan);
            migrationService.ensureBasicSemesterStructure(studyPlan);
            
            StudyPlanDto studyPlanDto = convertToDto(studyPlan);
            return ResponseEntity.ok(studyPlanDto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "FETCH_FAILED");
            error.put("message", "Failed to fetch study plan: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Helper method to convert StudyPlan entity to DTO
    private StudyPlanDto convertToDto(StudyPlan studyPlan) {
        StudyPlanDto dto = new StudyPlanDto();
        dto.setId(studyPlan.getId());
        dto.setName(studyPlan.getName());
        dto.setUserId(studyPlan.getUserId());
        dto.setIsActive(studyPlan.getIsActive());
        
        // Set study program info
        dto.setStudyProgramId(studyPlan.getStudyProgramId());
        
        // First, try to use the stored study program name
        if (studyPlan.getStudyProgramName() != null && !studyPlan.getStudyProgramName().trim().isEmpty()) {
            dto.setStudyProgramName(studyPlan.getStudyProgramName());
        } else if (studyPlan.getStudyProgramId() != null) {
            // Fallback to fetching from external service if no stored name
            try {
                StudyProgramDto studyProgram = programCatalogClient.getStudyProgramById(studyPlan.getStudyProgramId()).orElse(null);
                if (studyProgram != null) {
                    dto.setStudyProgramName(studyProgram.getDegree());
                }
            } catch (Exception e) {
                logger.warn("Failed to fetch study program details for ID: {}", studyPlan.getStudyProgramId(), e);
            }
        }
        
        return dto;
    }

    // PUT /api/v1/study-plans/{id} - Update study plan (with ownership check)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudyPlan(
            @PathVariable Long id,
            @Valid @RequestBody CreateStudyPlanRequest request) {
        try {
            // Get user ID from SecurityContext (set by JWT filter)
            Long userId = getCurrentUserId();

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
            
            // Update study program ID if different
            if (!existingPlan.getStudyProgramId().equals(request.getStudyProgramId())) {
                existingPlan.setStudyProgramId(request.getStudyProgramId());
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
    @PatchMapping("/{id}")
    public ResponseEntity<?> partialUpdateStudyPlan(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        try {
            // Get user ID from SecurityContext (set by JWT filter)
            Long userId = getCurrentUserId();

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
            if (updates.containsKey("isActive")) {
                existingPlan.setIsActive((Boolean) updates.get("isActive"));
            }
            if (updates.containsKey("studyProgramId")) {
                Long newProgramId = Long.valueOf(updates.get("studyProgramId").toString());
                existingPlan.setStudyProgramId(newProgramId);
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
    @PutMapping("/{id}/rename")
    public ResponseEntity<?> renameStudyPlan(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            // Get user ID from SecurityContext (set by JWT filter)
            Long userId = getCurrentUserId();

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
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudyPlan(@PathVariable Long id) {
        try {
            // Get user ID from SecurityContext (set by JWT filter)
            Long userId = getCurrentUserId();

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