package com.stratton_oakmont.study_planer.service;

import com.stratton_oakmont.study_planer.model.StudyPlan;
import com.stratton_oakmont.study_planer.repository.StudyPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class StudyPlanService {

    private final StudyPlanRepository studyPlanRepository;
    private final SemesterService semesterService;
    private final SemesterCourseService semesterCourseService;

    @Autowired
    public StudyPlanService(StudyPlanRepository studyPlanRepository, 
                           SemesterService semesterService,
                           SemesterCourseService semesterCourseService) {
        this.studyPlanRepository = studyPlanRepository;
        this.semesterService = semesterService;
        this.semesterCourseService = semesterCourseService;
    }

    // CREATE operations
    public StudyPlan createStudyPlan(StudyPlan studyPlan) {
        validateStudyPlan(studyPlan);
        return studyPlanRepository.save(studyPlan);
    }

    public StudyPlan createStudyPlanForUser(Long userId, Long studyProgramId, String name) {
        if (userId == null) {
            throw new StudyPlanValidationException("User ID cannot be null");
        }
        if (studyProgramId == null) {
            throw new StudyPlanValidationException("Study program ID cannot be null");
        }
        if (name == null || name.trim().isEmpty()) {
            throw new StudyPlanValidationException("Study plan name cannot be empty");
        }

        StudyPlan studyPlan = new StudyPlan();
        studyPlan.setName(name.trim());
        studyPlan.setUserId(userId);
        studyPlan.setStudyProgramId(studyProgramId);
        studyPlan.setIsActive(true);
        
        return createStudyPlan(studyPlan);
    }

    // READ operations
    public List<StudyPlan> getAllStudyPlans() {
        return studyPlanRepository.findAll();
    }

    public StudyPlan getStudyPlanById(Long id) {
        return studyPlanRepository.findById(id)
            .orElseThrow(() -> new StudyPlanNotFoundException("Study plan not found with id: " + id));
    }

    public List<StudyPlan> getStudyPlansByUserId(Long userId) {
        return studyPlanRepository.findByUserId(userId);
    }

    public List<StudyPlan> getActiveStudyPlansByUserId(Long userId) {
        return studyPlanRepository.findByUserIdAndIsActiveTrue(userId);
    }

    public List<StudyPlan> getStudyPlansByStudyProgramId(Long studyProgramId) {
        return studyPlanRepository.findByStudyProgramId(studyProgramId);
    }

    public List<StudyPlan> searchStudyPlansByName(String keyword) {
        return studyPlanRepository.findByNameContainingIgnoreCase(keyword);
    }

    // UPDATE operations
    public StudyPlan updateStudyPlan(Long id, StudyPlan updatedPlan) {
        StudyPlan existingPlan = getStudyPlanById(id);
        
        // Update allowed fields
        if (updatedPlan.getName() != null) {
            existingPlan.setName(updatedPlan.getName());
        }
        if (updatedPlan.getStudyProgramId() != null) {
            existingPlan.setStudyProgramId(updatedPlan.getStudyProgramId());
        }
        if (updatedPlan.getIsActive() != null) {
            existingPlan.setIsActive(updatedPlan.getIsActive());
        }
        
        validateStudyPlan(existingPlan);
        
        return studyPlanRepository.save(existingPlan);
    }

    public StudyPlan partialUpdateStudyPlan(Long id, StudyPlan partialPlan) {
        return updateStudyPlan(id, partialPlan);
    }

    public StudyPlan renameStudyPlan(Long id, String newName) {
        StudyPlan studyPlan = getStudyPlanById(id);
        studyPlan.setName(newName);
        return studyPlanRepository.save(studyPlan);
    }

    public StudyPlan duplicateStudyPlan(Long originalId, String newName, Long userId) {
        StudyPlan originalPlan = getStudyPlanById(originalId);
        
        StudyPlan duplicatedPlan = new StudyPlan();
        duplicatedPlan.setName(newName);
        duplicatedPlan.setUserId(userId);
        duplicatedPlan.setStudyProgramId(originalPlan.getStudyProgramId());
        duplicatedPlan.setIsActive(true);
        
        StudyPlan savedPlan = createStudyPlan(duplicatedPlan);
        
        // TODO: Duplicate semesters and courses using the new services
        // This will be implemented as part of the migration
        
        return savedPlan;
    }

    // DELETE operations
    public void deleteStudyPlan(Long id) {
        StudyPlan studyPlan = getStudyPlanById(id);
        studyPlanRepository.delete(studyPlan);
    }

    public void softDeleteStudyPlan(Long id) {
        StudyPlan studyPlan = getStudyPlanById(id);
        studyPlan.setIsActive(false);
        studyPlanRepository.save(studyPlan);
    }

    // VALIDATION
    private void validateStudyPlan(StudyPlan studyPlan) {
        if (studyPlan == null) {
            throw new StudyPlanValidationException("Study plan cannot be null");
        }
        
        if (studyPlan.getName() == null || studyPlan.getName().trim().isEmpty()) {
            throw new StudyPlanValidationException("Study plan name is required");
        }
        
        if (studyPlan.getName().length() > 200) {
            throw new StudyPlanValidationException("Study plan name cannot exceed 200 characters");
        }
        
        if (studyPlan.getUserId() == null) {
            throw new StudyPlanValidationException("User ID is required");
        }
        
        if (studyPlan.getStudyProgramId() == null) {
            throw new StudyPlanValidationException("Study program ID is required");
        }
    }

    // UTILITY methods
    public long countStudyPlansByUserId(Long userId) {
        return studyPlanRepository.countByUserId(userId);
    }

    public long countActiveStudyPlansByUserId(Long userId) {
        return studyPlanRepository.countByUserIdAndIsActiveTrue(userId);
    }

    public boolean userHasActiveStudyPlans(Long userId) {
        return studyPlanRepository.existsByUserIdAndIsActiveTrue(userId);
    }
}
