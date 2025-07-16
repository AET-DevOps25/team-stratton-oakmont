package com.stratton_oakmont.study_planer.service;

import com.stratton_oakmont.study_planer.entity.Semester;
import com.stratton_oakmont.study_planer.entity.SemesterModule;
import com.stratton_oakmont.study_planer.exception.StudyPlanNotFoundException;
import com.stratton_oakmont.study_planer.exception.StudyPlanValidationException;
import com.stratton_oakmont.study_planer.repository.SemesterModuleRepository;
import com.stratton_oakmont.study_planer.repository.SemesterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SemesterModuleService {
    
    private final SemesterModuleRepository semesterModuleRepository;
    private final SemesterRepository semesterRepository;
    
    @Autowired
    public SemesterModuleService(SemesterModuleRepository semesterModuleRepository, SemesterRepository semesterRepository) {
        this.semesterModuleRepository = semesterModuleRepository;
        this.semesterRepository = semesterRepository;
    }
    
    // CREATE operations
    public SemesterModule addModuleToSemester(Long semesterId, Long moduleId, Integer moduleOrder) {
        
        // Validate semester exists
        Semester semester = semesterRepository.findById(semesterId)
            .orElseThrow(() -> new StudyPlanNotFoundException("Semester not found with id: " + semesterId));
        
        // Check if module already exists in this semester
        if (semesterModuleRepository.existsBySemesterIdAndModuleId(semesterId, moduleId)) {
            throw new StudyPlanValidationException("Module already exists in this semester");
        }
        
        // Auto-assign module order if not provided
        if (moduleOrder == null) {
            Optional<Integer> maxOrder = semesterModuleRepository.findMaxModuleOrderBySemesterId(semesterId);
            moduleOrder = maxOrder.orElse(0) + 1;
        }
        
        SemesterModule semesterModule = new SemesterModule();
        semesterModule.setSemester(semester);
        semesterModule.setModuleId(moduleId);
        semesterModule.setModuleOrder(moduleOrder);
        semesterModule.setIsCompleted(false);
        semesterModule.setAddedDate(LocalDateTime.now());
        
        return semesterModuleRepository.save(semesterModule);
    }
    
    public SemesterModule createSemesterModule(SemesterModule semesterModule) {
        validateSemesterModule(semesterModule);
        semesterModule.setAddedDate(LocalDateTime.now());
        return semesterModuleRepository.save(semesterModule);
    }
    
    // READ operations
    public List<SemesterModule> getModulesBySemesterId(Long semesterId) {
        return semesterModuleRepository.findBySemesterIdOrderByModuleOrder(semesterId);
    }
    
    public SemesterModule getSemesterModuleById(Long id) {
        return semesterModuleRepository.findById(id)
            .orElseThrow(() -> new StudyPlanNotFoundException("Semester module not found with id: " + id));
    }
    
    public Optional<SemesterModule> findModuleInSemester(Long semesterId, Long moduleId) {
        return semesterModuleRepository.findBySemesterIdAndModuleId(semesterId, moduleId);
    }
    
    public List<SemesterModule> getCompletedModulesInSemester(Long semesterId) {
        return semesterModuleRepository.findBySemesterIdAndIsCompleted(semesterId, true);
    }
    
    public List<SemesterModule> getIncompleteModulesInSemester(Long semesterId) {
        return semesterModuleRepository.findBySemesterIdAndIsCompleted(semesterId, false);
    }
    
    // UPDATE operations
    public SemesterModule updateSemesterModule(Long id, SemesterModule updatedModule) {
        SemesterModule existingModule = getSemesterModuleById(id);
        
        // Update allowed fields
        if (updatedModule.getModuleOrder() != null) {
            existingModule.setModuleOrder(updatedModule.getModuleOrder());
        }
        if (updatedModule.getIsCompleted() != null) {
            existingModule.setIsCompleted(updatedModule.getIsCompleted());
        }
        
        return semesterModuleRepository.save(existingModule);
    }
    
    public SemesterModule toggleModuleCompletion(Long id) {
        SemesterModule module = getSemesterModuleById(id);
        module.setIsCompleted(!module.getIsCompleted());
        
        if (module.getIsCompleted()) {
            module.setCompletedDate(LocalDateTime.now());
        } else {
            module.setCompletedDate(null);
        }
        
        return semesterModuleRepository.save(module);
    }
    
    public SemesterModule updateModuleOrder(Long id, Integer newOrder) {
        SemesterModule module = getSemesterModuleById(id);
        module.setModuleOrder(newOrder);
        return semesterModuleRepository.save(module);
    }
    
    // DELETE operations
    public void removeSemesterModule(Long id) {
        SemesterModule module = getSemesterModuleById(id);
        semesterModuleRepository.delete(module);
    }
    
    public void removeModuleFromSemester(Long semesterId, Long moduleId) {
        Optional<SemesterModule> module = semesterModuleRepository.findBySemesterIdAndModuleId(semesterId, moduleId);
        if (module.isPresent()) {
            semesterModuleRepository.delete(module.get());
        } else {
            throw new StudyPlanNotFoundException("Module not found in semester");
        }
    }
    
    public void removeAllModulesFromSemester(Long semesterId) {
        semesterModuleRepository.deleteBySemesterId(semesterId);
    }
    
    // BATCH operations
    public List<SemesterModule> addMultipleModulesToSemester(Long semesterId, List<Long> moduleIds) {
        
        // Validate semester exists
        Semester semester = semesterRepository.findById(semesterId)
            .orElseThrow(() -> new StudyPlanNotFoundException("Semester not found with id: " + semesterId));
        
        // Get current max order
        Optional<Integer> maxOrder = semesterModuleRepository.findMaxModuleOrderBySemesterId(semesterId);
        int startOrder = maxOrder.orElse(0);
        
        List<SemesterModule> modules = new java.util.ArrayList<>();
        
        for (int i = 0; i < moduleIds.size(); i++) {
            Long moduleId = moduleIds.get(i);
            
            // Skip if module already exists in semester
            if (semesterModuleRepository.existsBySemesterIdAndModuleId(semesterId, moduleId)) {
                continue;
            }
            
            SemesterModule semesterModule = new SemesterModule();
            semesterModule.setSemester(semester);
            semesterModule.setModuleId(moduleId);
            semesterModule.setModuleOrder(startOrder + i + 1);
            semesterModule.setIsCompleted(false);
            semesterModule.setAddedDate(LocalDateTime.now());
            
            modules.add(semesterModule);
        }
        
        return semesterModuleRepository.saveAll(modules);
    }
    
    // VALIDATION
    private void validateSemesterModule(SemesterModule semesterModule) {
        if (semesterModule == null) {
            throw new StudyPlanValidationException("Semester module cannot be null");
        }
        
        if (semesterModule.getSemester() == null) {
            throw new StudyPlanValidationException("Semester is required");
        }
        
        if (semesterModule.getModuleId() == null) {
            throw new StudyPlanValidationException("Module ID is required");
        }
    }
}
