package com.stratton_oakmont.study_planer.controller;

import com.stratton_oakmont.study_planer.dto.SemesterCourseDto;
import com.stratton_oakmont.study_planer.model.Semester;
import com.stratton_oakmont.study_planer.model.SemesterCourse;
import com.stratton_oakmont.study_planer.service.SemesterCourseService;
import com.stratton_oakmont.study_planer.service.SemesterService;
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
@RequestMapping("/api/v1/semester-courses")
@CrossOrigin(origins = {
    "https://tum-study-planner.student.k8s.aet.tum.de",
    "http://localhost:5173", 
    "http://localhost:3000"
})
public class SemesterCourseController {

    private final SemesterCourseService semesterCourseService;
    private final SemesterService semesterService;

    @Autowired
    public SemesterCourseController(SemesterCourseService semesterCourseService, SemesterService semesterService) {
        this.semesterCourseService = semesterCourseService;
        this.semesterService = semesterService;
    }

    // POST /api/v1/semester-courses - Add course to semester
    @PostMapping
    public ResponseEntity<?> addCourseToSemester(@Valid @RequestBody SemesterCourseDto courseDto) {
        try {
            Semester semester = semesterService.getSemesterById(courseDto.getSemesterId());
            
            SemesterCourse semesterCourse = semesterCourseService.addCourseToSemester(
                semester, 
                courseDto.getCourseId(),
                courseDto.getCourseOrder()
            );
            
            SemesterCourseDto responseDto = convertToDto(semesterCourse);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);

        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "DUPLICATE_COURSE");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "CREATION_FAILED");
            error.put("message", "Failed to add course to semester: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // GET /api/v1/semester-courses/semester/{semesterId} - Get all courses for a semester
    @GetMapping("/semester/{semesterId}")
    public ResponseEntity<?> getCoursesBySemester(@PathVariable Long semesterId) {
        try {
            List<SemesterCourse> courses = semesterCourseService.getCoursesBySemesterId(semesterId);
            List<SemesterCourseDto> courseDtos = courses.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(courseDtos);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "FETCH_FAILED");
            error.put("message", "Failed to fetch courses: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // GET /api/v1/semester-courses/study-plan/{studyPlanId} - Get all courses for a study plan
    @GetMapping("/study-plan/{studyPlanId}")
    public ResponseEntity<?> getCoursesByStudyPlan(@PathVariable Long studyPlanId) {
        try {
            List<SemesterCourse> courses = semesterCourseService.getAllCoursesForStudyPlan(studyPlanId);
            List<SemesterCourseDto> courseDtos = courses.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(courseDtos);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "FETCH_FAILED");
            error.put("message", "Failed to fetch courses: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // PUT /api/v1/semester-courses/{id}/completion - Toggle course completion
    @PutMapping("/{id}/completion")
    public ResponseEntity<?> toggleCourseCompletion(@PathVariable Long id) {
        try {
            SemesterCourse updatedCourse = semesterCourseService.toggleCourseCompletion(id);
            SemesterCourseDto responseDto = convertToDto(updatedCourse);
            return ResponseEntity.ok(responseDto);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "UPDATE_FAILED");
            error.put("message", "Failed to update course completion: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // PUT /api/v1/semester-courses/{id}/move - Move course to different semester
    @PutMapping("/{id}/move")
    public ResponseEntity<?> moveCourseTo(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request) {
        try {
            Long targetSemesterId = request.get("targetSemesterId");
            Semester targetSemester = semesterService.getSemesterById(targetSemesterId);
            
            SemesterCourse movedCourse = semesterCourseService.moveCourseToSemester(id, targetSemester);
            SemesterCourseDto responseDto = convertToDto(movedCourse);
            return ResponseEntity.ok(responseDto);

        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "DUPLICATE_COURSE");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "MOVE_FAILED");
            error.put("message", "Failed to move course: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // DELETE /api/v1/semester-courses/{id} - Remove course from semester
    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeCourseFromSemester(@PathVariable Long id) {
        try {
            semesterCourseService.removeCourseFromSemester(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Course removed from semester successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "DELETE_FAILED");
            error.put("message", "Failed to remove course: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // POST /api/v1/semester-courses/reorder - Reorder courses within a semester
    @PostMapping("/reorder")
    public ResponseEntity<?> reorderCourses(@RequestBody Map<String, Object> request) {
        try {
            Long semesterId = Long.valueOf(request.get("semesterId").toString());
            @SuppressWarnings("unchecked")
            List<Long> courseIds = (List<Long>) request.get("courseIds");
            
            semesterCourseService.reorderCoursesInSemester(semesterId, courseIds);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Courses reordered successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "REORDER_FAILED");
            error.put("message", "Failed to reorder courses: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Helper method to convert entity to DTO
    private SemesterCourseDto convertToDto(SemesterCourse semesterCourse) {
        SemesterCourseDto dto = new SemesterCourseDto();
        dto.setId(semesterCourse.getId());
        dto.setSemesterId(semesterCourse.getSemester().getId());
        dto.setCourseId(semesterCourse.getCourseId());
        dto.setIsCompleted(semesterCourse.getIsCompleted());
        dto.setCompletionDate(semesterCourse.getCompletionDate());
        dto.setCourseOrder(semesterCourse.getCourseOrder());
        dto.setCreatedDate(semesterCourse.getCreatedDate());
        dto.setLastModified(semesterCourse.getLastModified());
        
        // TODO: Fetch course details from other service and populate:
        // dto.setCourseName(...)
        // dto.setCourseCode(...)
        // dto.setCredits(...)
        // etc.
        
        return dto;
    }
}
