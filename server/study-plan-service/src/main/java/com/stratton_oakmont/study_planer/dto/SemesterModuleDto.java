package com.stratton_oakmont.study_planer.dto;

import java.time.LocalDateTime;

public class SemesterModuleDto {
    private Long id;
    private Long semesterId;
    private Long moduleId;
    private Integer moduleOrder;
    private Boolean isCompleted;
    private LocalDateTime addedDate;
    private LocalDateTime completedDate;
    
    // Module details from program-catalog-service (not stored in DB)
    private Integer credits;
    private String moduleName;
    private String moduleCode;
    private String professor;
    private String description;
    private String category;
    private String language;
    private String occurrence;
    
    // Constructors
    public SemesterModuleDto() {}
    
    public SemesterModuleDto(Long id, Long semesterId, Long moduleId, String moduleName, Integer credits) {
        this.id = id;
        this.semesterId = semesterId;
        this.moduleId = moduleId;
        this.moduleName = moduleName;
        this.credits = credits;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getSemesterId() {
        return semesterId;
    }
    
    public void setSemesterId(Long semesterId) {
        this.semesterId = semesterId;
    }
    
    public Long getModuleId() {
        return moduleId;
    }
    
    public void setModuleId(Long moduleId) {
        this.moduleId = moduleId;
    }
    
    public Integer getModuleOrder() {
        return moduleOrder;
    }
    
    public void setModuleOrder(Integer moduleOrder) {
        this.moduleOrder = moduleOrder;
    }
    
    public Boolean getIsCompleted() {
        return isCompleted;
    }
    
    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }
    
    public Integer getCredits() {
        return credits;
    }
    
    public void setCredits(Integer credits) {
        this.credits = credits;
    }
    
    public String getModuleName() {
        return moduleName;
    }
    
    public void setModuleName(String moduleName) {
        this.moduleName = moduleName;
    }
    
    public String getModuleCode() {
        return moduleCode;
    }
    
    public void setModuleCode(String moduleCode) {
        this.moduleCode = moduleCode;
    }
    
    public String getProfessor() {
        return professor;
    }
    
    public void setProfessor(String professor) {
        this.professor = professor;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public void setLanguage(String language) {
        this.language = language;
    }
    
    public String getOccurrence() {
        return occurrence;
    }
    
    public void setOccurrence(String occurrence) {
        this.occurrence = occurrence;
    }
    
    public LocalDateTime getAddedDate() {
        return addedDate;
    }
    
    public void setAddedDate(LocalDateTime addedDate) {
        this.addedDate = addedDate;
    }
    
    public LocalDateTime getCompletedDate() {
        return completedDate;
    }
    
    public void setCompletedDate(LocalDateTime completedDate) {
        this.completedDate = completedDate;
    }
}
