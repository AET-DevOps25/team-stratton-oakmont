package com.stratton_oakmont.program_catalog_service.dto;

import java.util.List;

public class CurriculumOverviewDto {
    private Integer studyProgramId;
    private String programName;
    private Integer totalCredits;
    private Integer totalModules;
    private List<CategoryStatisticsDto> categories;
    private List<String> availableLanguages;
    private List<String> availableOccurrences;
    
    public CurriculumOverviewDto() {}
    
    public CurriculumOverviewDto(Integer studyProgramId, String programName, Integer totalCredits, Integer totalModules) {
        this.studyProgramId = studyProgramId;
        this.programName = programName;
        this.totalCredits = totalCredits;
        this.totalModules = totalModules;
    }
    
    // Getters and Setters
    public Integer getStudyProgramId() { return studyProgramId; }
    public void setStudyProgramId(Integer studyProgramId) { this.studyProgramId = studyProgramId; }
    
    public String getProgramName() { return programName; }
    public void setProgramName(String programName) { this.programName = programName; }
    
    public Integer getTotalCredits() { return totalCredits; }
    public void setTotalCredits(Integer totalCredits) { this.totalCredits = totalCredits; }
    
    public Integer getTotalModules() { return totalModules; }
    public void setTotalModules(Integer totalModules) { this.totalModules = totalModules; }
    
    public List<CategoryStatisticsDto> getCategories() { return categories; }
    public void setCategories(List<CategoryStatisticsDto> categories) { this.categories = categories; }
    
    public List<String> getAvailableLanguages() { return availableLanguages; }
    public void setAvailableLanguages(List<String> availableLanguages) { this.availableLanguages = availableLanguages; }
    
    public List<String> getAvailableOccurrences() { return availableOccurrences; }
    public void setAvailableOccurrences(List<String> availableOccurrences) { this.availableOccurrences = availableOccurrences; }
}