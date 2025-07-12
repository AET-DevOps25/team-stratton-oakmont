package com.stratton_oakmont.program_catalog_service.service;

import com.stratton_oakmont.program_catalog_service.model.StudyProgram;
import com.stratton_oakmont.program_catalog_service.repository.StudyProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudyProgramService {
    
    private final StudyProgramRepository studyProgramRepository;
    
    @Autowired
    public StudyProgramService(StudyProgramRepository studyProgramRepository) {
        this.studyProgramRepository = studyProgramRepository;
    }
    
    public List<StudyProgram> getAllStudyPrograms() {
        return studyProgramRepository.findAll();
    }
    
    public Optional<StudyProgram> getStudyProgramById(Long id) {
        return studyProgramRepository.findById(id);
    }
    
    public Optional<StudyProgram> getStudyProgramByDegree(String degree) {
        return studyProgramRepository.findByDegree(degree);
    }
    
    public List<StudyProgram> searchStudyProgramsByDegree(String degree) {
        return studyProgramRepository.findByDegreeContainingIgnoreCase(degree);
    }
    
    public List<StudyProgram> searchStudyProgramsByCurriculum(String curriculum) {
        return studyProgramRepository.findByCurriculumContainingIgnoreCase(curriculum);
    }
    
    public List<StudyProgram> getStudyProgramsByFieldOfStudies(String fieldOfStudies) {
        return studyProgramRepository.findByFieldOfStudies(fieldOfStudies);
    }
}
