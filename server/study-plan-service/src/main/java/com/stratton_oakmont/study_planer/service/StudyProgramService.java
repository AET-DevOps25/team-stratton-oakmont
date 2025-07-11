package com.stratton_oakmont.study_planer.service;

import com.stratton_oakmont.study_planer.entity.studydata.StudyProgram;
import com.stratton_oakmont.study_planer.exception.StudyProgramNotFoundException;
import com.stratton_oakmont.study_planer.repository.studydata.StudyProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)  // All operations are read-only
public class StudyProgramService {

    private final StudyProgramRepository studyProgramRepository;

    @Autowired
    public StudyProgramService(StudyProgramRepository studyProgramRepository) {
        this.studyProgramRepository = studyProgramRepository;
    }

    // Only READ operations 
    
    public List<StudyProgram> getAllStudyPrograms() {
        return studyProgramRepository.findAll();
    }

    public StudyProgram getStudyProgramById(Long id) {
        return studyProgramRepository.findById(id)
                .orElseThrow(() -> new StudyProgramNotFoundException(id));
    }

    public Optional<StudyProgram> findStudyProgramByDegree(String degree) {
        return studyProgramRepository.findByDegree(degree);
    }

    public List<StudyProgram> searchStudyProgramsByDegree(String keyword) {
        return studyProgramRepository.findByDegreeContainingIgnoreCase(keyword);
    }

    public List<StudyProgram> searchStudyProgramsByFieldOfStudy(String keyword) {
        return studyProgramRepository.findByFieldOfStudiesContainingIgnoreCase(keyword);
    }

    public boolean existsById(Long id) {
        return studyProgramRepository.existsById(id);
    }
}