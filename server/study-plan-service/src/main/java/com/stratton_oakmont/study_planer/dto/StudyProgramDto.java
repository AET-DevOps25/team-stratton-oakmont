package com.stratton_oakmont.study_planer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class StudyProgramDto {
    
    private Long id;
    
    @NotBlank(message = "Study program name is required")
    @Size(max = 200, message = "Study program name cannot exceed 200 characters")
    private String name;
    
    @NotNull(message = "Total credits is required")
    @Positive(message = "Total credits must be positive")
    private Integer totalCredits;
    
    @NotNull(message = "Semester duration is required")
    @Positive(message = "Semester duration must be positive")
    private Integer semesterDuration;
    
    @NotBlank(message = "Degree type is required")
    @Size(max = 50, message = "Degree type cannot exceed 50 characters")
    private String degreeType;
    
    private String description;

    // Constructors
    public StudyProgramDto() {}

    public StudyProgramDto(Long id, String name, String degreeType) {
        this.id = id;
        this.name = name;
        this.degreeType = degreeType;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getTotalCredits() { return totalCredits; }
    public void setTotalCredits(Integer totalCredits) { this.totalCredits = totalCredits; }

    public Integer getSemesterDuration() { return semesterDuration; }
    public void setSemesterDuration(Integer semesterDuration) { this.semesterDuration = semesterDuration; }

    public String getDegreeType() { return degreeType; }
    public void setDegreeType(String degreeType) { this.degreeType = degreeType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}