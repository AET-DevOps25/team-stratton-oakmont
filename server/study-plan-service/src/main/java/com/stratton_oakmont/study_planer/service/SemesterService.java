package com.stratton_oakmont.study_planer.service;

import com.stratton_oakmont.study_planer.entity.Semester;
import com.stratton_oakmont.study_planer.entity.SemesterModule;
import com.stratton_oakmont.study_planer.exception.StudyPlanNotFoundException;
import com.stratton_oakmont.study_planer.exception.StudyPlanValidationException;
import com.stratton_oakmont.study_planer.repository.SemesterRepository;
import com.stratton_oakmont.study_planer.repository.SemesterModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SemesterService {
    
    private final SemesterRepository semesterRepository;
    private final SemesterModuleRepository semesterModuleRepository;
    
    @Autowired
    public SemesterService(SemesterRepository semesterRepository, SemesterModuleRepository semesterModuleRepository) {
        this.semesterRepository = semesterRepository;
        this.semesterModuleRepository = semesterModuleRepository;
    }
    
    // CREATE operations
    public Semester createSemester(Semester semester) {
        validateSemester(semester);
        
        // Auto-assign semester order if not provided
        if (semester.getSemesterOrder() == null) {
            Optional<Integer> maxOrder = semesterRepository.findMaxSemesterOrderByStudyPlanId(semester.getStudyPlanId());
            semester.setSemesterOrder(maxOrder.orElse(0) + 1);
        }
        
        semester.setCreatedDate(LocalDateTime.now());
        semester.setLastModified(LocalDateTime.now());
        return semesterRepository.save(semester);
    }
    
    public Semester createSemesterForStudyPlan(Long studyPlanId, String name, String wOrS) {
        if (studyPlanId == null) {
            throw new StudyPlanValidationException("Study plan ID cannot be null");
        }
        if (name == null || name.trim().isEmpty()) {
            throw new StudyPlanValidationException("Semester name cannot be empty");
        }
        
        // Check if semester name already exists for this study plan
        if (semesterRepository.existsByStudyPlanIdAndName(studyPlanId, name.trim())) {
            throw new StudyPlanValidationException("Semester with name '" + name + "' already exists in this study plan");
        }
        
        Semester semester = new Semester();
        semester.setName(name.trim());
        semester.setWOrS(wOrS);
        semester.setStudyPlanId(studyPlanId);
        semester.setIsExpanded(true);
        
        return createSemester(semester);
    }
    
    // READ operations
    public List<Semester> getSemestersByStudyPlanId(Long studyPlanId) {
        return semesterRepository.findByStudyPlanIdOrderBySemesterOrder(studyPlanId);
    }
    
    public Semester getSemesterById(Long id) {
        return semesterRepository.findById(id)
            .orElseThrow(() -> new StudyPlanNotFoundException("Semester not found with id: " + id));
    }
    
    public Optional<Semester> findSemesterByStudyPlanIdAndOrder(Long studyPlanId, Integer semesterOrder) {
        return semesterRepository.findByStudyPlanIdAndSemesterOrder(studyPlanId, semesterOrder);
    }
    
    public Optional<Semester> findSemesterByStudyPlanIdAndName(Long studyPlanId, String name) {
        return semesterRepository.findByStudyPlanIdAndName(studyPlanId, name);
    }
    
    public long countSemestersByStudyPlanId(Long studyPlanId) {
        return semesterRepository.countByStudyPlanId(studyPlanId);
    }
    
    // UPDATE operations
    public Semester updateSemester(Long id, Semester updatedSemester) {
        Semester existingSemester = getSemesterById(id);
        
        // Update allowed fields
        if (updatedSemester.getName() != null) {
            // Check if new name conflicts with existing semester names
            if (!existingSemester.getName().equals(updatedSemester.getName()) &&
                semesterRepository.existsByStudyPlanIdAndName(existingSemester.getStudyPlanId(), updatedSemester.getName())) {
                throw new StudyPlanValidationException("Semester with name '" + updatedSemester.getName() + "' already exists in this study plan");
            }
            existingSemester.setName(updatedSemester.getName());
        }
        if (updatedSemester.getWOrS() != null) {
            existingSemester.setWOrS(updatedSemester.getWOrS());
        }
        if (updatedSemester.getSemesterOrder() != null) {
            existingSemester.setSemesterOrder(updatedSemester.getSemesterOrder());
        }
        if (updatedSemester.getIsExpanded() != null) {
            existingSemester.setIsExpanded(updatedSemester.getIsExpanded());
        }
        
        existingSemester.setLastModified(LocalDateTime.now());
        validateSemester(existingSemester);
        
        return semesterRepository.save(existingSemester);
    }
    
    public Semester renameSemester(Long id, String newName) {
        if (newName == null || newName.trim().isEmpty()) {
            throw new StudyPlanValidationException("Semester name cannot be empty");
        }
        
        Semester existingSemester = getSemesterById(id);
        
        // Check if new name conflicts with existing semester names
        if (!existingSemester.getName().equals(newName.trim()) &&
            semesterRepository.existsByStudyPlanIdAndName(existingSemester.getStudyPlanId(), newName.trim())) {
            throw new StudyPlanValidationException("Semester with name '" + newName + "' already exists in this study plan");
        }
        
        existingSemester.setName(newName.trim());
        existingSemester.setLastModified(LocalDateTime.now());
        
        return semesterRepository.save(existingSemester);
    }
    
    public Semester toggleSemesterExpanded(Long id) {
        Semester semester = getSemesterById(id);
        semester.setIsExpanded(!semester.getIsExpanded());
        semester.setLastModified(LocalDateTime.now());
        
        return semesterRepository.save(semester);
    }
    
    // DELETE operations
    public void deleteSemester(Long id) {
        Semester semester = getSemesterById(id);
        semesterRepository.delete(semester);
    }
    
    public void deleteAllSemestersByStudyPlanId(Long studyPlanId) {
        semesterRepository.deleteByStudyPlanId(studyPlanId);
    }
    
    // VALIDATION
    private void validateSemester(Semester semester) {
        if (semester == null) {
            throw new StudyPlanValidationException("Semester cannot be null");
        }
        
        if (semester.getName() == null || semester.getName().trim().isEmpty()) {
            throw new StudyPlanValidationException("Semester name is required");
        }
        
        if (semester.getName().length() > 100) {
            throw new StudyPlanValidationException("Semester name cannot exceed 100 characters");
        }
        
        if (semester.getStudyPlanId() == null) {
            throw new StudyPlanValidationException("Study plan ID is required");
        }
        
        if (semester.getWOrS() != null && !semester.getWOrS().matches("[WS]")) {
            throw new StudyPlanValidationException("Semester type must be 'W' (Winter) or 'S' (Summer)");
        }
    }
}
