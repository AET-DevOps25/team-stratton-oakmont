package com.stratton_oakmont.study_planer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateStudyPlanRequest {
    
    @NotBlank(message = "Study plan name is required")
    @Size(max = 200, message = "Study plan name cannot exceed 200 characters")
    private String name;
    
    @NotNull(message = "Study program ID is required")
    private Long studyProgramId;

    @Size(max = 255, message = "Study program name cannot exceed 255 characters")
    private String studyProgramName;

    // Constructors
    public CreateStudyPlanRequest() {}

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getStudyProgramId() { return studyProgramId; }
    public void setStudyProgramId(Long studyProgramId) { this.studyProgramId = studyProgramId; }

    public String getStudyProgramName() { return studyProgramName; }
    public void setStudyProgramName(String studyProgramName) { this.studyProgramName = studyProgramName; }
}