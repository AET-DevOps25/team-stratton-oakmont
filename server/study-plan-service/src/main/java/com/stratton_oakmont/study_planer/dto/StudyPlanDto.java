package com.stratton_oakmont.study_planer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class StudyPlanDto {
    
    private Long id;
    
    @NotBlank(message = "Study plan name is required")
    @Size(max = 200, message = "Study plan name cannot exceed 200 characters")
    private String name;
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotNull(message = "Study program ID is required")
    private Long studyProgramId;
    
    private String studyProgramName;
    
    private String planData;
    
    private Boolean isActive;
    
    private LocalDateTime createdDate;
    
    private LocalDateTime lastModified;

    // Constructors
    public StudyPlanDto() {}

    public StudyPlanDto(String name, Long userId, Long studyProgramId) {
        this.name = name;
        this.userId = userId;
        this.studyProgramId = studyProgramId;
        this.isActive = true;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getStudyProgramId() { return studyProgramId; }
    public void setStudyProgramId(Long studyProgramId) { this.studyProgramId = studyProgramId; }

    public String getStudyProgramName() { return studyProgramName; }
    public void setStudyProgramName(String studyProgramName) { this.studyProgramName = studyProgramName; }

    public String getPlanData() { return planData; }
    public void setPlanData(String planData) { this.planData = planData; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getLastModified() { return lastModified; }
    public void setLastModified(LocalDateTime lastModified) { this.lastModified = lastModified; }
}