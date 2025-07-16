package com.stratton_oakmont.study_planer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateSemesterRequest {
    
    @NotBlank(message = "Semester name cannot be blank")
    private String name;
    
    private String wOrS; // "W" for Winter, "S" for Summer
    
    private Integer semesterOrder;
    
    @NotNull(message = "Study plan ID cannot be null")
    private Long studyPlanId;
    
    private Boolean isExpanded = true;
    
    // Constructors
    public CreateSemesterRequest() {}
    
    public CreateSemesterRequest(String name, String wOrS, Integer semesterOrder, Long studyPlanId) {
        this.name = name;
        this.wOrS = wOrS;
        this.semesterOrder = semesterOrder;
        this.studyPlanId = studyPlanId;
    }
    
    // Getters and Setters
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
}
