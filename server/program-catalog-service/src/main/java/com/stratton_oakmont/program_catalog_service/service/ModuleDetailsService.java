package com.stratton_oakmont.program_catalog_service.service;

import com.stratton_oakmont.program_catalog_service.dto.CategoryStatisticsDto;
import com.stratton_oakmont.program_catalog_service.dto.CurriculumOverviewDto;
import com.stratton_oakmont.program_catalog_service.dto.ModuleSummaryDto;
import com.stratton_oakmont.program_catalog_service.model.ModuleDetails;
import com.stratton_oakmont.program_catalog_service.repository.ModuleDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
     * Get comprehensive curriculum overview with statistics
     */
    public CurriculumOverviewDto getCurriculumOverview(Integer studyProgramId) {
        Integer totalModules = moduleDetailsRepository.countByStudyProgramId(studyProgramId);
        Integer totalCredits = moduleDetailsRepository.sumCreditsByStudyProgramId(studyProgramId);
        
        CurriculumOverviewDto overview = new CurriculumOverviewDto();
        overview.setStudyProgramId(studyProgramId);
        overview.setProgramName("M.Sc. Information Systems"); // This could be dynamic based on study program
        overview.setTotalModules(totalModules != null ? totalModules : 0);
        overview.setTotalCredits(totalCredits != null ? totalCredits : 0);
        
        // Get category statistics
        List<CategoryStatisticsDto> categoryStats = getCategoryStatistics(studyProgramId);
        overview.setCategories(categoryStats);
        
        // Get available languages and occurrences
        overview.setAvailableLanguages(getDistinctLanguages(studyProgramId));
        overview.setAvailableOccurrences(getDistinctOccurrences(studyProgramId));
        
        return overview;
    }
    
    /**
     * Get category statistics with module counts and credits
     */
    public List<CategoryStatisticsDto> getCategoryStatistics(Integer studyProgramId) {
        List<Object[]> rawStats = moduleDetailsRepository.findCategoryStatisticsByStudyProgramId(studyProgramId);
        List<CategoryStatisticsDto> categoryStats = new ArrayList<>();
        
        for (Object[] stat : rawStats) {
            String category = (String) stat[0];
            Long moduleCount = (Long) stat[1];
            Long totalCredits = (Long) stat[2];
            
            CategoryStatisticsDto categoryDto = new CategoryStatisticsDto();
            categoryDto.setCategory(category);
            categoryDto.setModuleCount(moduleCount != null ? moduleCount.intValue() : 0);
            categoryDto.setTotalCredits(totalCredits != null ? totalCredits.intValue() : 0);
            
            // Get subcategories for this category
            List<String> subcategories = getDistinctSubcategories(studyProgramId, category);
            categoryDto.setSubcategories(subcategories);
            
            // Get module summaries for this category
            List<ModuleDetails> modules = getModuleDetailsByStudyProgramIdAndCategory(studyProgramId, category);
            List<ModuleSummaryDto> moduleSummaries = modules.stream()
                .map(this::convertToModuleSummary)
                .collect(Collectors.toList());
            categoryDto.setModules(moduleSummaries);
            
            categoryStats.add(categoryDto);
        }
        
        return categoryStats;
    }
    
    /**
     * Get distinct languages available in the study program
     */
    public List<String> getDistinctLanguages(Integer studyProgramId) {
        return moduleDetailsRepository.findDistinctLanguagesByStudyProgramId(studyProgramId);
    }
    
    /**
     * Get distinct occurrences (semesters) available in the study program
     */
    public List<String> getDistinctOccurrences(Integer studyProgramId) {
        return moduleDetailsRepository.findDistinctOccurrencesByStudyProgramId(studyProgramId);
    }
    
    /**
     * Advanced search with multiple filters
     */
    public List<ModuleDetails> searchWithFilters(Integer studyProgramId, String category, String subcategory,
                                                 String language, String occurrence, Integer minCredits,
                                                 Integer maxCredits, String searchTerm) {
        return moduleDetailsRepository.findWithFilters(studyProgramId, category, subcategory, language,
                                                      occurrence, minCredits, maxCredits, searchTerm);
    }
    
    /**
     * Get modules available in a specific semester
     */
    public List<ModuleDetails> getModulesBySemester(Integer studyProgramId, String semester) {
        return moduleDetailsRepository.findBySemesterAvailability(studyProgramId, semester);
    }
    
    /**
     * Get module summaries by category
     */
    public List<ModuleSummaryDto> getModuleSummariesByCategory(Integer studyProgramId, String category) {
        List<ModuleDetails> modules = getModuleDetailsByStudyProgramIdAndCategory(studyProgramId, category);
        return modules.stream()
            .map(this::convertToModuleSummary)
            .collect(Collectors.toList());
    }
    
    /**
     * Convert ModuleDetails to ModuleSummaryDto
     */
    private ModuleSummaryDto convertToModuleSummary(ModuleDetails module) {
        ModuleSummaryDto summary = new ModuleSummaryDto();
        summary.setId(module.getId());
        summary.setModuleId(module.getModuleId());
        summary.setName(module.getName());
        summary.setCredits(module.getCredits());
        summary.setCategory(module.getCategory());
        summary.setSubcategory(module.getSubcategory());
        summary.setOccurrence(module.getOccurrence());
        summary.setLanguage(module.getLanguage());
        summary.setResponsible(module.getResponsible());
        
        // Create a short description from content or learning outcomes
        if (module.getIntendedLearningOutcomes() != null && !module.getIntendedLearningOutcomes().isEmpty()) {
            String description = module.getIntendedLearningOutcomes();
            summary.setDescription(description.length() > 200 ? description.substring(0, 200) + "..." : description);
        }
        
        return summary;
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