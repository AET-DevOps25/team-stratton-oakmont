package com.stratton_oakmont.program_catalog_service.controller;

import com.stratton_oakmont.program_catalog_service.dto.StudyProgramDto;
import com.stratton_oakmont.program_catalog_service.model.StudyProgram;
import com.stratton_oakmont.program_catalog_service.service.StudyProgramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/study-programs")
@CrossOrigin(origins = {
    "https://tum-study-planner.student.k8s.aet.cit.tum.de",
    "http://localhost:5173", 
    "http://localhost:3000"
})
public class StudyProgramController {
    
    private final StudyProgramService studyProgramService;
    
    @Autowired
    public StudyProgramController(StudyProgramService studyProgramService) {
        this.studyProgramService = studyProgramService;
    }
    
    // GET /api/v1/study-programs - Get all study programs
    @GetMapping({"", "/"})
    public ResponseEntity<List<StudyProgramDto>> getAllStudyPrograms() {
        try {
            List<StudyProgram> programs = studyProgramService.getAllStudyPrograms();
            List<StudyProgramDto> dtos = programs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // GET /api/v1/study-programs/{id} - Get study program by ID
    @GetMapping("/{id}")
    public ResponseEntity<StudyProgramDto> getStudyProgramById(@PathVariable Long id) {
        try {
            Optional<StudyProgram> program = studyProgramService.getStudyProgramById(id);
            if (program.isPresent()) {
                StudyProgramDto dto = convertToDto(program.get());
                return ResponseEntity.ok(dto);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // GET /api/v1/study-programs/search?degree=... - Search by degree
    @GetMapping("/search")
    public ResponseEntity<List<StudyProgramDto>> searchStudyPrograms(
            @RequestParam(required = false) String degree,
            @RequestParam(required = false) String curriculum,
            @RequestParam(required = false) String fieldOfStudies) {
        try {
            List<StudyProgram> programs;
            
            if (degree != null && !degree.trim().isEmpty()) {
                programs = studyProgramService.searchStudyProgramsByDegree(degree);
            } else if (curriculum != null && !curriculum.trim().isEmpty()) {
                programs = studyProgramService.searchStudyProgramsByCurriculum(curriculum);
            } else if (fieldOfStudies != null && !fieldOfStudies.trim().isEmpty()) {
                programs = studyProgramService.getStudyProgramsByFieldOfStudies(fieldOfStudies);
            } else {
                programs = studyProgramService.getAllStudyPrograms();
            }
            
            List<StudyProgramDto> dtos = programs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    private StudyProgramDto convertToDto(StudyProgram program) {
        StudyProgramDto dto = new StudyProgramDto();
        dto.setId(program.getId());
        dto.setDegree(program.getDegree());
        dto.setCurriculum(program.getCurriculum());
        dto.setFieldOfStudies(program.getFieldOfStudies());
        dto.setEctsCredits(program.getEctsCredits());
        dto.setSemester(program.getSemester());
        dto.setCurriculumLink(program.getCurriculumLink());
        return dto;
    }
}
