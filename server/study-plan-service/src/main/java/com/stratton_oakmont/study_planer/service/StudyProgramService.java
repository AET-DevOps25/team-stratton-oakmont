package com.stratton_oakmont.study_planer.service;

import com.stratton_oakmont.study_planer.entity.StudyProgram;
import com.stratton_oakmont.study_planer.exception.StudyProgramNotFoundException;
import com.stratton_oakmont.study_planer.repository.StudyProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class StudyProgramService {

    private final StudyProgramRepository studyProgramRepository;

    @Autowired
    public StudyProgramService(StudyProgramRepository studyProgramRepository) {
        this.studyProgramRepository = studyProgramRepository;
    }

    // CREATE operations
    public StudyProgram createStudyProgram(StudyProgram studyProgram) {
        validateStudyProgram(studyProgram);
        
        // Check if program with same name and degree type already exists
        if (studyProgramRepository.existsByNameAndDegreeType(studyProgram.getName(), studyProgram.getDegreeType())) {
            throw new IllegalArgumentException(
                "Study program with name '" + studyProgram.getName() + 
                "' and degree type '" + studyProgram.getDegreeType() + "' already exists"
            );
        }
        
        return studyProgramRepository.save(studyProgram);
    }

    // READ operations
    @Transactional(readOnly = true)
    public List<StudyProgram> getAllStudyPrograms() {
        return studyProgramRepository.findAll();
    }

    @Transactional(readOnly = true)
    public StudyProgram getStudyProgramById(Long id) {
        return studyProgramRepository.findById(id)
                .orElseThrow(() -> new StudyProgramNotFoundException(id));
    }

    @Transactional(readOnly = true)
    public Optional<StudyProgram> findStudyProgramByName(String name) {
        return studyProgramRepository.findByName(name);
    }

    @Transactional(readOnly = true)
    public List<StudyProgram> getStudyProgramsByDegreeType(String degreeType) {
        return studyProgramRepository.findByDegreeType(degreeType);
    }

    @Transactional(readOnly = true)
    public List<StudyProgram> searchStudyProgramsByName(String keyword) {
        return studyProgramRepository.findByNameContainingIgnoreCase(keyword);
    }

    @Transactional(readOnly = true)
    public List<StudyProgram> searchStudyProgramsByDescription(String keyword) {
        return studyProgramRepository.findByDescriptionContainingIgnoreCase(keyword);
    }

    @Transactional(readOnly = true)
    public List<StudyProgram> getStudyProgramsByDegreeTypeAndMinCredits(String degreeType, Integer minCredits) {
        return studyProgramRepository.findByDegreeTypeAndTotalCreditsGreaterThan(degreeType, minCredits);
    }

    @Transactional(readOnly = true)
    public List<StudyProgram> getAllStudyProgramsOrderedByDate() {
        return studyProgramRepository.findAllByOrderByCreatedDateDesc();
    }

    // UPDATE operations
    public StudyProgram updateStudyProgram(Long id, StudyProgram updatedProgram) {
        StudyProgram existingProgram = getStudyProgramById(id);
        
        // Update fields
        existingProgram.setName(updatedProgram.getName());
        existingProgram.setTotalCredits(updatedProgram.getTotalCredits());
        existingProgram.setSemesterDuration(updatedProgram.getSemesterDuration());
        existingProgram.setMandatoryCourses(updatedProgram.getMandatoryCourses());
        existingProgram.setAvailableCourses(updatedProgram.getAvailableCourses());
        existingProgram.setDescription(updatedProgram.getDescription());
        existingProgram.setDegreeType(updatedProgram.getDegreeType());
        existingProgram.setLastModified(LocalDateTime.now());
        
        validateStudyProgram(existingProgram);
        return studyProgramRepository.save(existingProgram);
    }

    public StudyProgram partialUpdateStudyProgram(Long id, StudyProgram partialProgram) {
        StudyProgram existingProgram = getStudyProgramById(id);
        
        // Update only non-null fields
        if (partialProgram.getName() != null) {
            existingProgram.setName(partialProgram.getName());
        }
        if (partialProgram.getTotalCredits() != null) {
            existingProgram.setTotalCredits(partialProgram.getTotalCredits());
        }
        if (partialProgram.getSemesterDuration() != null) {
            existingProgram.setSemesterDuration(partialProgram.getSemesterDuration());
        }
        if (partialProgram.getMandatoryCourses() != null) {
            existingProgram.setMandatoryCourses(partialProgram.getMandatoryCourses());
        }
        if (partialProgram.getAvailableCourses() != null) {
            existingProgram.setAvailableCourses(partialProgram.getAvailableCourses());
        }
        if (partialProgram.getDescription() != null) {
            existingProgram.setDescription(partialProgram.getDescription());
        }
        if (partialProgram.getDegreeType() != null) {
            existingProgram.setDegreeType(partialProgram.getDegreeType());
        }
        
        existingProgram.setLastModified(LocalDateTime.now());
        validateStudyProgram(existingProgram);
        return studyProgramRepository.save(existingProgram);
    }

    // DELETE operations
    public void deleteStudyProgram(Long id) {
        StudyProgram program = getStudyProgramById(id);
        
        // Check if there are any study plans associated with this program
        long planCount = studyProgramRepository.findById(id)
                .map(p -> p.getStudyPlans().size())
                .orElse(0);
        
        if (planCount > 0) {
            throw new IllegalStateException(
                "Cannot delete study program with id " + id + 
                " because it has " + planCount + " associated study plans"
            );
        }
        
        studyProgramRepository.delete(program);
    }

    // UTILITY methods
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        return studyProgramRepository.existsById(id);
    }

    @Transactional(readOnly = true)
    public boolean existsByNameAndDegreeType(String name, String degreeType) {
        return studyProgramRepository.existsByNameAndDegreeType(name, degreeType);
    }

    @Transactional(readOnly = true)
    public long countStudyProgramsByDegreeType(String degreeType) {
        return studyProgramRepository.countByDegreeType(degreeType);
    }

    // VALIDATION methods
    private void validateStudyProgram(StudyProgram studyProgram) {
        if (studyProgram == null) {
            throw new IllegalArgumentException("Study program cannot be null");
        }
        
        if (studyProgram.getName() == null || studyProgram.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Study program name cannot be null or empty");
        }
        
        if (studyProgram.getTotalCredits() == null || studyProgram.getTotalCredits() <= 0) {
            throw new IllegalArgumentException("Total credits must be positive");
        }
        
        if (studyProgram.getSemesterDuration() == null || studyProgram.getSemesterDuration() <= 0) {
            throw new IllegalArgumentException("Semester duration must be positive");
        }
        
        if (studyProgram.getDegreeType() == null || studyProgram.getDegreeType().trim().isEmpty()) {
            throw new IllegalArgumentException("Degree type cannot be null or empty");
        }
        
        // Validate degree type values
        String degreeType = studyProgram.getDegreeType().toLowerCase();
        if (!degreeType.equals("bachelor") && !degreeType.equals("master") && !degreeType.equals("phd")) {
            throw new IllegalArgumentException("Degree type must be one of: Bachelor, Master, PhD");
        }
    }
}