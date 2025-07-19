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
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    @Autowired
    public SemesterController(SemesterService semesterService, StudyPlanService studyPlanService) {
        this.semesterService = semesterService;
        this.studyPlanService = studyPlanService;
    }

    // POST /api/v1/semesters - Create a new semester
    @PostMapping
    public ResponseEntity<?> createSemester(@Valid @RequestBody SemesterDto semesterDto) {
        try {
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

    // GET /api/v1/semesters/study-plan/{studyPlanId} - Get all semesters for a study plan
    @GetMapping("/study-plan/{studyPlanId}")
    public ResponseEntity<?> getSemestersByStudyPlan(@PathVariable Long studyPlanId) {
        try {
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

    // GET /api/v1/semesters/{id} - Get specific semester
    @GetMapping("/{id}")
    public ResponseEntity<?> getSemesterById(@PathVariable Long id) {
        try {
            Semester semester = semesterService.getSemesterById(id);
            SemesterDto semesterDto = convertToDto(semester);
            return ResponseEntity.ok(semesterDto);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "NOT_FOUND");
            error.put("message", "Semester not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // PUT /api/v1/semesters/{id} - Update semester
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSemester(
            @PathVariable Long id,
            @Valid @RequestBody SemesterDto semesterDto) {
        try {
            Semester existingSemester = semesterService.getSemesterById(id);
            
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

    // DELETE /api/v1/semesters/{id} - Delete semester
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSemester(@PathVariable Long id) {
        try {
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

    // POST /api/v1/semesters/reorder - Reorder semesters within a study plan
    @PostMapping("/reorder")
    public ResponseEntity<?> reorderSemesters(@RequestBody Map<String, Object> request) {
        try {
            Long studyPlanId = Long.valueOf(request.get("studyPlanId").toString());
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
