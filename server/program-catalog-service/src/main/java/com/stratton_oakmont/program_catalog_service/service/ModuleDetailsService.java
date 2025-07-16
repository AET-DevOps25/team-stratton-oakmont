package com.stratton_oakmont.program_catalog_service.service;

import com.stratton_oakmont.program_catalog_service.model.ModuleDetails;
import com.stratton_oakmont.program_catalog_service.repository.ModuleDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ModuleDetailsService {
    
    @Autowired
    private ModuleDetailsRepository moduleDetailsRepository;
    
    /**
     * Get all module details
     */
    public List<ModuleDetails> getAllModuleDetails() {
        return moduleDetailsRepository.findAll();
    }
    
    /**
     * Get module details by ID
     */
    public Optional<ModuleDetails> getModuleDetailsById(Integer id) {
        return moduleDetailsRepository.findById(id);
    }
    
    /**
     * Get module details by module ID
     */
    public Optional<ModuleDetails> getModuleDetailsByModuleId(String moduleId) {
        return moduleDetailsRepository.findByModuleId(moduleId);
    }
    
    /**
     * Get all module details for a specific study program
     */
    public List<ModuleDetails> getModuleDetailsByStudyProgramId(Integer studyProgramId) {
        return moduleDetailsRepository.findByStudyProgramId(studyProgramId);
    }
    
    /**
     * Get module details by study program and category
     */
    public List<ModuleDetails> getModuleDetailsByStudyProgramIdAndCategory(Integer studyProgramId, String category) {
        return moduleDetailsRepository.findByStudyProgramIdAndCategory(studyProgramId, category);
    }
    
    /**
     * Get module details by category and subcategory
     */
    public List<ModuleDetails> getModuleDetailsByCategoryAndSubcategory(String category, String subcategory) {
        return moduleDetailsRepository.findByCategoryAndSubcategory(category, subcategory);
    }
    
    /**
     * Search module details by name or module ID
     */
    public List<ModuleDetails> searchModuleDetails(Integer studyProgramId, String searchTerm) {
        return moduleDetailsRepository.searchByNameOrModuleId(studyProgramId, searchTerm);
    }
    
    /**
     * Get module details by occurrence (semester availability)
     */
    public List<ModuleDetails> getModuleDetailsByOccurrence(Integer studyProgramId, String occurrence) {
        return moduleDetailsRepository.findByStudyProgramIdAndOccurrence(studyProgramId, occurrence);
    }
    
    /**
     * Get module details by credits range
     */
    public List<ModuleDetails> getModuleDetailsByCreditsRange(Integer studyProgramId, Integer minCredits, Integer maxCredits) {
        return moduleDetailsRepository.findByStudyProgramIdAndCreditsBetween(studyProgramId, minCredits, maxCredits);
    }
    
    /**
     * Get all distinct categories for a study program
     */
    public List<String> getDistinctCategories(Integer studyProgramId) {
        return moduleDetailsRepository.findDistinctCategoriesByStudyProgramId(studyProgramId);
    }
    
    /**
     * Get all distinct subcategories for a study program and category
     */
    public List<String> getDistinctSubcategories(Integer studyProgramId, String category) {
        return moduleDetailsRepository.findDistinctSubcategoriesByStudyProgramIdAndCategory(studyProgramId, category);
    }
    
    /**
     * Create new module details
     */
    public ModuleDetails createModuleDetails(ModuleDetails moduleDetails) {
        return moduleDetailsRepository.save(moduleDetails);
    }
    
    /**
     * Update existing module details
     */
    public ModuleDetails updateModuleDetails(Integer id, ModuleDetails moduleDetails) {
        Optional<ModuleDetails> existingModule = moduleDetailsRepository.findById(id);
        if (existingModule.isPresent()) {
            ModuleDetails existing = existingModule.get();
            
            // Update fields
            existing.setName(moduleDetails.getName());
            existing.setCredits(moduleDetails.getCredits());
            existing.setCategory(moduleDetails.getCategory());
            existing.setSubcategory(moduleDetails.getSubcategory());
            existing.setResponsible(moduleDetails.getResponsible());
            existing.setOrganisation(moduleDetails.getOrganisation());
            existing.setModuleLevel(moduleDetails.getModuleLevel());
            existing.setOccurrence(moduleDetails.getOccurrence());
            existing.setLanguage(moduleDetails.getLanguage());
            existing.setTotalHours(moduleDetails.getTotalHours());
            existing.setContactHours(moduleDetails.getContactHours());
            existing.setSelfStudyHours(moduleDetails.getSelfStudyHours());
            existing.setDescriptionOfAchievementAndAssessmentMethods(moduleDetails.getDescriptionOfAchievementAndAssessmentMethods());
            existing.setExamRetakeNextSemester(moduleDetails.getExamRetakeNextSemester());
            existing.setExamRetakeAtTheEndOfSemester(moduleDetails.getExamRetakeAtTheEndOfSemester());
            existing.setPrerequisitesRecommended(moduleDetails.getPrerequisitesRecommended());
            existing.setIntendedLearningOutcomes(moduleDetails.getIntendedLearningOutcomes());
            existing.setContent(moduleDetails.getContent());
            existing.setTeachingAndLearningMethods(moduleDetails.getTeachingAndLearningMethods());
            existing.setMedia(moduleDetails.getMedia());
            existing.setReadingList(moduleDetails.getReadingList());
            
            return moduleDetailsRepository.save(existing);
        }
        throw new RuntimeException("Module details not found with id: " + id);
    }
    
    /**
     * Delete module details
     */
    public void deleteModuleDetails(Integer id) {
        moduleDetailsRepository.deleteById(id);
    }
}