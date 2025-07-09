package com.stratton_oakmont.study_planer.controller;

import com.stratton_oakmont.study_planer.dto.StudyProgramDto;
import com.stratton_oakmont.study_planer.entity.studydata.StudyProgram;
import com.stratton_oakmont.study_planer.repository.studydata.StudyProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/study-programs")
@CrossOrigin(origins = {
    "https://tum-study-planner.student.k8s.aet.cit.tum.de",
    "http://localhost:5173", 
    "http://localhost:3000"
})
public class StudyProgramController {

    @Autowired
    private StudyProgramRepository studyProgramRepository;

    @GetMapping
    public ResponseEntity<List<StudyProgramDto>> getAllStudyPrograms() {
        List<StudyProgram> programs = studyProgramRepository.findAll();
        List<StudyProgramDto> dtos = programs.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyProgramDto> getStudyProgramById(@PathVariable Long id) {
        StudyProgram program = studyProgramRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Study program not found with id: " + id));
        return ResponseEntity.ok(convertToDto(program));
    }

    private StudyProgramDto convertToDto(StudyProgram program) {
        StudyProgramDto dto = new StudyProgramDto();
        dto.setId(program.getId());
        dto.setName(program.getDegree()); // Using degree as name
        dto.setDegreeType(program.getDegree());
        dto.setCurriculum(program.getCurriculum());
        dto.setFieldOfStudies(program.getFieldOfStudies());
        dto.setEctsCredits(program.getEctsCredits());
        dto.setSemester(program.getSemester());
        dto.setCurriculumLink(program.getCurriculumLink());
        return dto;
    }
}