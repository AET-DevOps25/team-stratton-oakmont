package com.stratton_oakmont.study_planer.service;

import com.stratton_oakmont.study_planer.entity.StudyPlan;
import com.stratton_oakmont.study_planer.entity.studydata.StudyProgram;
import com.stratton_oakmont.study_planer.exception.StudyPlanNotFoundException;
import com.stratton_oakmont.study_planer.exception.StudyPlanValidationException;
import com.stratton_oakmont.study_planer.repository.StudyPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class StudyPlanService {

    private final StudyPlanRepository studyPlanRepository;
    private final StudyProgramService studyProgramService;

    @Autowired
    public StudyPlanService(StudyPlanRepository studyPlanRepository, StudyProgramService studyProgramService) {
        this.studyPlanRepository = studyPlanRepository;
        this.studyProgramService = studyProgramService;
    }

    // CREATE operations
    public StudyPlan createStudyPlan(StudyPlan studyPlan) {
        validateStudyPlan(studyPlan);
        
        // Validate that the study program exists
        if (studyPlan.getStudyProgram() != null && studyPlan.getStudyProgram().getId() != null) {
            StudyProgram program = studyProgramService.getStudyProgramById(studyPlan.getStudyProgram().getId());
            studyPlan.setStudyProgram(program);
        }
        
        return studyPlanRepository.save(studyPlan);
    }

    public StudyPlan createStudyPlanForUser(Long userId, Long studyProgramId, String planName) {
        StudyProgram studyProgram = studyProgramService.getStudyProgramById(studyProgramId);
        
        StudyPlan studyPlan = new StudyPlan(planName, userId, studyProgram);
        return studyPlanRepository.save(studyPlan);
    }

    // READ operations
    @Transactional(readOnly = true)
    public List<StudyPlan> getAllStudyPlans() {
        return studyPlanRepository.findAll();
    }

    @Transactional(readOnly = true)
    public StudyPlan getStudyPlanById(Long id) {
        return studyPlanRepository.findById(id)
                .orElseThrow(() -> new StudyPlanNotFoundException(id));
    }

    @Transactional(readOnly = true)
    public List<StudyPlan> getStudyPlansByUserId(Long userId) {
        return studyPlanRepository.findByUserIdOrderByCreatedDateDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<StudyPlan> getActiveStudyPlansByUserId(Long userId) {
        return studyPlanRepository.findByUserIdAndIsActiveTrue(userId);
    }

    @Transactional(readOnly = true)
    public List<StudyPlan> getStudyPlansByUserAndProgram(Long userId, Long studyProgramId) {
        StudyProgram studyProgram = studyProgramService.getStudyProgramById(studyProgramId);
        return studyPlanRepository.findByUserIdAndStudyProgram(userId, studyProgram);
    }

    @Transactional(readOnly = true)
    public List<StudyPlan> getStudyPlansByProgram(Long studyProgramId) {
        StudyProgram studyProgram = studyProgramService.getStudyProgramById(studyProgramId);
        return studyPlanRepository.findByStudyProgram(studyProgram);
    }

    @Transactional(readOnly = true)
    public List<StudyPlan> searchStudyPlansByName(String keyword) {
        return studyPlanRepository.findByNameContainingIgnoreCase(keyword);
    }

    @Transactional(readOnly = true)
    public List<StudyPlan> getRecentStudyPlans(LocalDateTime since) {
        return studyPlanRepository.findByCreatedDateAfter(since);
    }

    @Transactional(readOnly = true)
    public List<StudyPlan> getRecentlyModifiedStudyPlans(LocalDateTime since) {
        return studyPlanRepository.findByLastModifiedAfter(since);
    }

    @Transactional(readOnly = true)
    public List<StudyPlan> getUserStudyPlansOrderedByCreatedDate(Long userId) {
        return studyPlanRepository.findByUserIdOrderByCreatedDateDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<StudyPlan> getUserStudyPlansOrderedByLastModified(Long userId) {
        return studyPlanRepository.findByUserIdOrderByLastModifiedDesc(userId);
    }

    @Transactional(readOnly = true)
    public Optional<StudyPlan> getMostRecentStudyPlanForUser(Long userId) {
        List<StudyPlan> plans = studyPlanRepository.findByUserIdOrderByLastModifiedDesc(userId);
        return plans.isEmpty() ? Optional.empty() : Optional.of(plans.get(0));
    }

    @Transactional(readOnly = true)
    public List<StudyPlan> getStudyPlansByUserAndProgramName(Long userId, String programName) {
        return studyPlanRepository.findByUserIdAndStudyProgramName(userId, programName);
    }

    // UPDATE operations
    public StudyPlan updateStudyPlan(Long id, StudyPlan updatedPlan) {
        StudyPlan existingPlan = getStudyPlanById(id);
        
        // Update fields
        existingPlan.setName(updatedPlan.getName());
        existingPlan.setPlanData(updatedPlan.getPlanData());
        existingPlan.setIsActive(updatedPlan.getIsActive());
        existingPlan.setLastModified(LocalDateTime.now());
        
        // Update study program if provided
        if (updatedPlan.getStudyProgram() != null && updatedPlan.getStudyProgram().getId() != null) {
            StudyProgram program = studyProgramService.getStudyProgramById(updatedPlan.getStudyProgram().getId());
            existingPlan.setStudyProgram(program);
        }
        
        validateStudyPlan(existingPlan);
        return studyPlanRepository.save(existingPlan);
    }

    public StudyPlan partialUpdateStudyPlan(Long id, StudyPlan partialPlan) {
        StudyPlan existingPlan = getStudyPlanById(id);
        
        // Update only non-null fields
        if (partialPlan.getName() != null) {
            existingPlan.setName(partialPlan.getName());
        }
        if (partialPlan.getPlanData() != null) {
            existingPlan.setPlanData(partialPlan.getPlanData());
        }
        if (partialPlan.getIsActive() != null) {
            existingPlan.setIsActive(partialPlan.getIsActive());
        }
        if (partialPlan.getStudyProgram() != null && partialPlan.getStudyProgram().getId() != null) {
            StudyProgram program = studyProgramService.getStudyProgramById(partialPlan.getStudyProgram().getId());
            existingPlan.setStudyProgram(program);
        }
        
        existingPlan.setLastModified(LocalDateTime.now());
        validateStudyPlan(existingPlan);
        return studyPlanRepository.save(existingPlan);
    }

    public StudyPlan updateStudyPlanData(Long id, String planData) {
        StudyPlan existingPlan = getStudyPlanById(id);
        existingPlan.setPlanData(planData);
        existingPlan.setLastModified(LocalDateTime.now());
        return studyPlanRepository.save(existingPlan);
    }

    public StudyPlan activateStudyPlan(Long id) {
        StudyPlan studyPlan = getStudyPlanById(id);
        studyPlan.setIsActive(true);
        studyPlan.setLastModified(LocalDateTime.now());
        return studyPlanRepository.save(studyPlan);
    }

    public StudyPlan deactivateStudyPlan(Long id) {
        StudyPlan studyPlan = getStudyPlanById(id);
        studyPlan.setIsActive(false);
        studyPlan.setLastModified(LocalDateTime.now());
        return studyPlanRepository.save(studyPlan);
    }

    // DELETE operations
    public void deleteStudyPlan(Long id) {
        StudyPlan studyPlan = getStudyPlanById(id);
        studyPlanRepository.delete(studyPlan);
    }

    public void deleteAllStudyPlansForUser(Long userId) {
        List<StudyPlan> userPlans = studyPlanRepository.findByUserId(userId);
        studyPlanRepository.deleteAll(userPlans);
    }

    // UTILITY methods
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        return studyPlanRepository.existsById(id);
    }

    @Transactional(readOnly = true)
    public boolean userHasActiveStudyPlans(Long userId) {
        return studyPlanRepository.existsByUserIdAndIsActiveTrue(userId);
    }

    @Transactional(readOnly = true)
    public long countActiveStudyPlansForUser(Long userId) {
        return studyPlanRepository.countByUserIdAndIsActiveTrue(userId);
    }

    @Transactional(readOnly = true)
    public long countStudyPlansForProgram(Long studyProgramId) {
        StudyProgram studyProgram = studyProgramService.getStudyProgramById(studyProgramId);
        return studyPlanRepository.countByStudyProgram(studyProgram);
    }

    // BUSINESS LOGIC methods
    public StudyPlan duplicateStudyPlan(Long id, String newName) {
        StudyPlan originalPlan = getStudyPlanById(id);
        
        StudyPlan duplicatedPlan = new StudyPlan();
        duplicatedPlan.setName(newName);
        duplicatedPlan.setUserId(originalPlan.getUserId());
        duplicatedPlan.setStudyProgram(originalPlan.getStudyProgram());
        duplicatedPlan.setPlanData(originalPlan.getPlanData());
        duplicatedPlan.setIsActive(true);
        
        return studyPlanRepository.save(duplicatedPlan);
    }

    // VALIDATION methods
    private void validateStudyPlan(StudyPlan studyPlan) {
        if (studyPlan == null) {
            throw new StudyPlanValidationException("Study plan cannot be null");
        }
        
        if (studyPlan.getName() == null || studyPlan.getName().trim().isEmpty()) {
            throw new StudyPlanValidationException("Study plan name cannot be null or empty");
        }
        
        if (studyPlan.getUserId() == null) {
            throw new StudyPlanValidationException("User ID cannot be null");
        }
        
        if (studyPlan.getStudyProgram() == null) {
            throw new StudyPlanValidationException("Study program cannot be null");
        }
        
        // Validate name length
        if (studyPlan.getName().length() > 200) {
            throw new StudyPlanValidationException("Study plan name cannot exceed 200 characters");
        }
        
        // Validate that user doesn't have too many active plans
        if (studyPlan.getIsActive() != null && studyPlan.getIsActive()) {
            long activePlansCount = studyPlanRepository.countByUserIdAndIsActiveTrue(studyPlan.getUserId());
            if (activePlansCount >= 5 && (studyPlan.getId() == null)) { // New plan
                throw new StudyPlanValidationException("User cannot have more than 5 active study plans");
            }
        }
    }
}