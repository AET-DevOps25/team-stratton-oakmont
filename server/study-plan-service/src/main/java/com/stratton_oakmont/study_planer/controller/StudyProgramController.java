package com.stratton_oakmont.study_planer.controller;

import com.stratton_oakmont.study_planer.dto.StudyProgramDto;
import com.stratton_oakmont.study_planer.client.ProgramCatalogClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/study-programs")
@CrossOrigin(origins = {
    "https://tum-study-planner.student.k8s.aet.cit.tum.de",
    "http://localhost:5173", 
    "http://localhost:3000"
})
public class StudyProgramController {
    
    private final ProgramCatalogClient programCatalogClient;
    
    @Autowired
    public StudyProgramController(ProgramCatalogClient programCatalogClient) {
        this.programCatalogClient = programCatalogClient;
    }
    
    // GET /study-programs - Get all study programs (proxy to program-catalog-service)
    @GetMapping({"", "/"})
    public ResponseEntity<List<StudyProgramDto>> getAllStudyPrograms() {
        try {
            List<StudyProgramDto> programs = programCatalogClient.getAllStudyPrograms();
            return ResponseEntity.ok(programs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // GET /study-programs/{id} - Get study program by ID (proxy to program-catalog-service)
    @GetMapping("/{id}")
    public ResponseEntity<StudyProgramDto> getStudyProgramById(@PathVariable Long id) {
        try {
            Optional<StudyProgramDto> program = programCatalogClient.getStudyProgramById(id);
            if (program.isPresent()) {
                return ResponseEntity.ok(program.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // GET /study-programs/search - Search study programs (proxy to program-catalog-service)
    @GetMapping("/search")
    public ResponseEntity<List<StudyProgramDto>> searchStudyPrograms(
            @RequestParam(required = false) String degree,
            @RequestParam(required = false) String curriculum,
            @RequestParam(required = false) String fieldOfStudies) {
        try {
            List<StudyProgramDto> programs = programCatalogClient.searchStudyPrograms(degree, curriculum, fieldOfStudies);
            return ResponseEntity.ok(programs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
