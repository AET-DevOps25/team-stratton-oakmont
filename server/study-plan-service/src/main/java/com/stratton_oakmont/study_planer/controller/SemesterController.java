package com.stratton_oakmont.study_planer.controller;

import com.stratton_oakmont.study_planer.dto.SemesterDto;
import com.stratton_oakmont.study_planer.model.Semester;
import com.stratton_oakmont.study_planer.model.StudyPlan;
import com.stratton_oakmont.study_planer.service.SemesterService;
import com.stratton_oakmont.study_planer.service.StudyPlanService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/semesters")
@CrossOrigin(origins = {
    "https://tum-study-planner.student.k8s.aet.cit.tum.de",
    "http://localhost:5173", 
    "http://localhost:3000"
})
public class SemesterController {

    private final SemesterService semesterService;
    private final StudyPlanService studyPlanService;
    private static final Logger logger = LoggerFactory.getLogger(SemesterController.class);

    @Autowired
    public SemesterController(SemesterService semesterService, StudyPlanService studyPlanService) {
        this.semesterService = semesterService;
        this.studyPlanService = studyPlanService;
        logger.info("LOG: SemesterController initialized successfully");
    }

    // Helper method to get current user ID from SecurityContext
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Long) {
            return (Long) authentication.getPrincipal();
        }
        throw new RuntimeException("User not authenticated");
    }

    // Helper method to verify study plan ownership
    private boolean verifyStudyPlanOwnership(Long studyPlanId, Long userId) {
        try {
            StudyPlan studyPlan = studyPlanService.getStudyPlanById(studyPlanId);
            return studyPlan.getUserId().equals(userId);
        } catch (Exception e) {
            return false;
        }
    }

    // POST /api/v1/semesters - Create a new semester (with ownership check)
    @PostMapping
    public ResponseEntity<?> createSemester(@Valid @RequestBody SemesterDto semesterDto) {
        try {
            // Get user ID from SecurityContext (set by JWT filter)
            Long userId = getCurrentUserId();
            
            // Verify ownership of the study plan
            if (!verifyStudyPlanOwnership(semesterDto.getStudyPlanId(), userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "ACCESS_DENIED");
                error.put("message", "You can only create semesters for your own study plans");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            // Get the study plan to verify it exists
            StudyPlan studyPlan = studyPlanService.getStudyPlanById(semesterDto.getStudyPlanId());
            
            // Create semester with all fields
            Semester semester = new Semester(
                semesterDto.getName(),
                studyPlan,
                semesterDto.getSemesterOrder(),
                semesterDto.getWinterOrSummer()
            );
            
            Semester savedSemester = semesterService.createSemester(semester);
            SemesterDto responseDto = convertToDto(savedSemester);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "CREATION_FAILED");
            error.put("message", "Failed to create semester: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // GET /api/v1/semesters/study-plan/{studyPlanId} - Get all semesters for a study plan (with ownership check)
    @GetMapping("/study-plan/{studyPlanId}")
    public ResponseEntity<?> getSemestersByStudyPlan(@PathVariable Long studyPlanId) {
        try {
            // Get user ID from SecurityContext (set by JWT filter)
            Long userId = getCurrentUserId();
            
            // Verify ownership of the study plan
            if (!verifyStudyPlanOwnership(studyPlanId, userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "ACCESS_DENIED");
                error.put("message", "You can only access semesters for your own study plans");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            List<Semester> semesters = semesterService.getSemestersByStudyPlanId(studyPlanId);
            List<SemesterDto> semesterDtos = semesters.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(semesterDtos);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "FETCH_FAILED");
            error.put("message", "Failed to fetch semesters: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // GET /api/v1/semesters/{id} - Get specific semester (with ownership check)
    @GetMapping("/{id}")
    public ResponseEntity<?> getSemesterById(@PathVariable Long id) {
        try {
            // Get user ID from SecurityContext (set by JWT filter)
            Long userId = getCurrentUserId();
            
            // Get semester and verify ownership through study plan
            Semester semester = semesterService.getSemesterById(id);
            if (!verifyStudyPlanOwnership(semester.getStudyPlan().getId(), userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "ACCESS_DENIED");
                error.put("message", "You can only access your own semesters");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            SemesterDto semesterDto = convertToDto(semester);
            return ResponseEntity.ok(semesterDto);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "NOT_FOUND");
            error.put("message", "Semester not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // PUT /api/v1/semesters/{id} - Update semester (with ownership check)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSemester(
            @PathVariable Long id,
            @Valid @RequestBody SemesterDto semesterDto) {
        try {
            // Get user ID from SecurityContext (set by JWT filter)
            Long userId = getCurrentUserId();
            
            // Get existing semester and verify ownership through study plan
            Semester existingSemester = semesterService.getSemesterById(id);
            if (!verifyStudyPlanOwnership(existingSemester.getStudyPlan().getId(), userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "ACCESS_DENIED");
                error.put("message", "You can only update your own semesters");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            // Update fields
            existingSemester.setName(semesterDto.getName());
            if (semesterDto.getSemesterOrder() != null) {
                existingSemester.setSemesterOrder(semesterDto.getSemesterOrder());
            }
            if (semesterDto.getWinterOrSummer() != null) {
                existingSemester.setWinterOrSummer(semesterDto.getWinterOrSummer());
            }
            
            Semester updatedSemester = semesterService.updateSemester(id, existingSemester);
            SemesterDto responseDto = convertToDto(updatedSemester);
            return ResponseEntity.ok(responseDto);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "UPDATE_FAILED");
            error.put("message", "Failed to update semester: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // DELETE /api/v1/semesters/{id} - Delete semester (with ownership check)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSemester(@PathVariable Long id) {
        try {
            // Get user ID from SecurityContext (set by JWT filter)
            Long userId = getCurrentUserId();
            
            // Get semester and verify ownership through study plan
            Semester semester = semesterService.getSemesterById(id);
            if (!verifyStudyPlanOwnership(semester.getStudyPlan().getId(), userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "ACCESS_DENIED");
                error.put("message", "You can only delete your own semesters");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            semesterService.deleteSemester(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Semester deleted successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "DELETE_FAILED");
            error.put("message", "Failed to delete semester: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // POST /api/v1/semesters/reorder - Reorder semesters within a study plan (with ownership check)
    @PostMapping("/reorder")
    public ResponseEntity<?> reorderSemesters(@RequestBody Map<String, Object> request) {
        try {
            // Get user ID from SecurityContext (set by JWT filter)
            Long userId = getCurrentUserId();
            
            Long studyPlanId = Long.valueOf(request.get("studyPlanId").toString());
            
            // Verify ownership of the study plan
            if (!verifyStudyPlanOwnership(studyPlanId, userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "ACCESS_DENIED");
                error.put("message", "You can only reorder semesters for your own study plans");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            @SuppressWarnings("unchecked")
            List<Long> semesterIds = (List<Long>) request.get("semesterIds");
            
            semesterService.reorderSemesters(studyPlanId, semesterIds);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Semesters reordered successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "REORDER_FAILED");
            error.put("message", "Failed to reorder semesters: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Helper method to convert entity to DTO
    private SemesterDto convertToDto(Semester semester) {
        SemesterDto dto = new SemesterDto();
        dto.setId(semester.getId());
        dto.setName(semester.getName());
        dto.setStudyPlanId(semester.getStudyPlan().getId());
        dto.setSemesterOrder(semester.getSemesterOrder());
        dto.setWinterOrSummer(semester.getWinterOrSummer());
        
        // TODO: Add courses conversion when needed
        // dto.setCourses(semester.getCourses().stream()
        //     .map(this::convertCourseToDto)
        //     .collect(Collectors.toList()));
        
        return dto;
    }
}
