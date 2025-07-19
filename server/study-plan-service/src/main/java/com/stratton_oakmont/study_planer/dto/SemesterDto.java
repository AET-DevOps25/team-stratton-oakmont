package com.stratton_oakmont.study_planer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public class SemesterDto {
    
    private Long id;
    
    @NotBlank(message = "Semester name is required")
    @Size(max = 100, message = "Semester name cannot exceed 100 characters")
    private String name;
    
    @NotNull(message = "Study plan ID is required")
    private Long studyPlanId;
    
    private Integer semesterOrder;
    
    private List<SemesterCourseDto> courses;
    
    // Constructors
    public SemesterDto() {}
    
    public SemesterDto(String name, Long studyPlanId, Integer semesterOrder) {
        this.name = name;
        this.studyPlanId = studyPlanId;
        this.semesterOrder = semesterOrder;
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
    
    public Long getStudyPlanId() {
        return studyPlanId;
    }
    
    public void setStudyPlanId(Long studyPlanId) {
        this.studyPlanId = studyPlanId;
    }
    
    public Integer getSemesterOrder() {
        return semesterOrder;
    }
    
    public void setSemesterOrder(Integer semesterOrder) {
        this.semesterOrder = semesterOrder;
    }
    
    public List<SemesterCourseDto> getCourses() {
        return courses;
    }
    
    public void setCourses(List<SemesterCourseDto> courses) {
        this.courses = courses;
    }
}
