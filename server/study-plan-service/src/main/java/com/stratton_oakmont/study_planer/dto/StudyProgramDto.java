package com.stratton_oakmont.study_planer.dto;

public class StudyProgramDto {
    
    private Long id;
    private String name;
    private Integer totalCredits;
    private Integer semesterDuration;
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