package com.stratton_oakmont.study_planer.dto;

import jakarta.validation.constraints.NotNull;

public class AddModuleToSemesterRequest {
    
    @NotNull(message = "Module ID cannot be null")
    private Long moduleId;
    
    private Integer moduleOrder;
    
    // Constructors
    public AddModuleToSemesterRequest() {}
    
    public AddModuleToSemesterRequest(Long moduleId, Integer moduleOrder) {
        this.moduleId = moduleId;
        this.moduleOrder = moduleOrder;
    }
    
    // Getters and Setters
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
}
