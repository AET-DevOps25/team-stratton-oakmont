package com.stratton_oakmont.study_planer.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SemesterDto {
    private Long id;
    private String name;
    private String wOrS; // "W" for Winter, "S" for Summer
    private Integer semesterOrder;
    private Long studyPlanId;
    private Boolean isExpanded;
    private LocalDateTime createdDate;
    private LocalDateTime lastModified;
    private List<SemesterModuleDto> modules;
    
    // Constructors
    public SemesterDto() {}
    
    public SemesterDto(Long id, String name, String wOrS, Integer semesterOrder, Long studyPlanId) {
        this.id = id;
        this.name = name;
        this.wOrS = wOrS;
        this.semesterOrder = semesterOrder;
        this.studyPlanId = studyPlanId;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getWOrS() {
        return wOrS;
    }
    
    public void setWOrS(String wOrS) {
        this.wOrS = wOrS;
    }
    
    public Integer getSemesterOrder() {
        return semesterOrder;
    }
    
    public void setSemesterOrder(Integer semesterOrder) {
        this.semesterOrder = semesterOrder;
    }
    
    public Long getStudyPlanId() {
        return studyPlanId;
    }
    
    public void setStudyPlanId(Long studyPlanId) {
        this.studyPlanId = studyPlanId;
    }
    
    public Boolean getIsExpanded() {
        return isExpanded;
    }
    
    public void setIsExpanded(Boolean isExpanded) {
        this.isExpanded = isExpanded;
    }
    
    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
    
    public LocalDateTime getLastModified() {
        return lastModified;
    }
    
    public void setLastModified(LocalDateTime lastModified) {
        this.lastModified = lastModified;
    }
    
    public List<SemesterModuleDto> getModules() {
        return modules;
    }
    
    public void setModules(List<SemesterModuleDto> modules) {
        this.modules = modules;
    }
}
