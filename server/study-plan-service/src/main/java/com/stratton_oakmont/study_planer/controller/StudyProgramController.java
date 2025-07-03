package com.stratton_oakmont.study_planer.controller;

import com.stratton_oakmont.study_planer.dto.StudyProgramDto;
import com.stratton_oakmont.study_planer.entity.StudyProgram;
import com.stratton_oakmont.study_planer.service.StudyProgramService;
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
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class StudyProgramController {

    private final StudyProgramService studyProgramService;

    @Autowired
    public StudyProgramController(StudyProgramService studyProgramService) {
        this.studyProgramService = studyProgramService;
    }

    // POST /api/v1/study-programs - Create new study program
    @PostMapping("/study-programs")
    public ResponseEntity<StudyProgramDto> createStudyProgram(
            @Valid @RequestBody StudyProgramDto request) {
        
        // Convert DTO to entity
        StudyProgram studyProgram = convertToEntity(request);
        
        // Create the study program
        StudyProgram createdProgram = studyProgramService.createStudyProgram(studyProgram);
        
        // Convert back to DTO for response
        StudyProgramDto responseDto = convertToDto(createdProgram);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    // GET /api/v1/study-programs/{id} - Get specific study program
    @GetMapping("/study-programs/{id}")
    public ResponseEntity<StudyProgramDto> getStudyProgramById(@PathVariable Long id) {
        StudyProgram studyProgram = studyProgramService.getStudyProgramById(id);
        StudyProgramDto studyProgramDto = convertToDto(studyProgram);
        return ResponseEntity.ok(studyProgramDto);
    }

    // GET /api/v1/study-programs - Get all study programs
    @GetMapping("/study-programs")
    public ResponseEntity<List<StudyProgramDto>> getAllStudyPrograms() {
        List<StudyProgram> studyPrograms = studyProgramService.getAllStudyPrograms();
        List<StudyProgramDto> studyProgramDtos = studyPrograms.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(studyProgramDtos);
    }

    // GET /api/v1/study-programs/degree/{degreeType} - Get programs by degree type
    @GetMapping("/study-programs/degree/{degreeType}")
    public ResponseEntity<List<StudyProgramDto>> getStudyProgramsByDegreeType(@PathVariable String degreeType) {
        List<StudyProgram> studyPrograms = studyProgramService.getStudyProgramsByDegreeType(degreeType);
        List<StudyProgramDto> studyProgramDtos = studyPrograms.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(studyProgramDtos);
    }

    // GET /api/v1/study-programs/search - Search programs by name
    @GetMapping("/study-programs/search")
    public ResponseEntity<List<StudyProgramDto>> searchStudyProgramsByName(@RequestParam String keyword) {
        List<StudyProgram> studyPrograms = studyProgramService.searchStudyProgramsByName(keyword);
        List<StudyProgramDto> studyProgramDtos = studyPrograms.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(studyProgramDtos);
    }

    // PUT /api/v1/study-programs/{id} - Update study program
    @PutMapping("/study-programs/{id}")
    public ResponseEntity<StudyProgramDto> updateStudyProgram(
            @PathVariable Long id,
            @Valid @RequestBody StudyProgramDto request) {
        
        StudyProgram studyProgram = convertToEntity(request);
        StudyProgram updatedProgram = studyProgramService.updateStudyProgram(id, studyProgram);
        StudyProgramDto responseDto = convertToDto(updatedProgram);
        return ResponseEntity.ok(responseDto);
    }

    // PATCH /api/v1/study-programs/{id} - Partial update study program
    @PatchMapping("/study-programs/{id}")
    public ResponseEntity<StudyProgramDto> partialUpdateStudyProgram(
            @PathVariable Long id,
            @RequestBody StudyProgramDto request) {
        
        StudyProgram studyProgram = convertToEntity(request);
        StudyProgram updatedProgram = studyProgramService.partialUpdateStudyProgram(id, studyProgram);
        StudyProgramDto responseDto = convertToDto(updatedProgram);
        return ResponseEntity.ok(responseDto);
    }

    // DELETE /api/v1/study-programs/{id} - Delete study program
    @DeleteMapping("/study-programs/{id}")
    public ResponseEntity<Void> deleteStudyProgram(@PathVariable Long id) {
        studyProgramService.deleteStudyProgram(id);
        return ResponseEntity.noContent().build();
    }

    // Helper method to convert StudyProgram entity to DTO
    private StudyProgramDto convertToDto(StudyProgram studyProgram) {
        StudyProgramDto dto = new StudyProgramDto();
        dto.setId(studyProgram.getId());
        dto.setName(studyProgram.getName());
        dto.setTotalCredits(studyProgram.getTotalCredits());
        dto.setSemesterDuration(studyProgram.getSemesterDuration());
        dto.setDegreeType(studyProgram.getDegreeType());
        dto.setDescription(studyProgram.getDescription());
        return dto;
    }

    // Helper method to convert StudyProgramDto to entity
    private StudyProgram convertToEntity(StudyProgramDto dto) {
        StudyProgram studyProgram = new StudyProgram();
        studyProgram.setId(dto.getId());
        studyProgram.setName(dto.getName());
        studyProgram.setTotalCredits(dto.getTotalCredits());
        studyProgram.setSemesterDuration(dto.getSemesterDuration());
        studyProgram.setDegreeType(dto.getDegreeType());
        studyProgram.setDescription(dto.getDescription());
        return studyProgram;
    }

    // Exception handler for validation errors
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

    // Exception handler for IllegalArgumentException (duplicate programs, etc.)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(
            IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.badRequest().body(error);
    }

    // Exception handler for IllegalStateException (delete with associated plans)
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalStateException(
            IllegalStateException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}