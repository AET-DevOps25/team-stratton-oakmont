package com.stratton_oakmont.study_planer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class SemesterCourseDto {
    
    private Long id;
    
    @NotNull(message = "Semester ID is required")
    private Long semesterId;
    
    @NotBlank(message = "Course ID is required")
    private String courseId;
    
    private Boolean isCompleted = false;
    
    private LocalDateTime completionDate;
    
    private Integer courseOrder;
    
    // Optional: Course details fetched from other service (not persisted)
    private String courseName;
    private String courseCode;
    private Integer credits;
    private String professor;
    private String occurrence;
    private String category;
    private String subcategory;
    
    // Constructors
    public SemesterCourseDto() {}
    
    public SemesterCourseDto(Long semesterId, String courseId) {
        this.semesterId = semesterId;
        this.courseId = courseId;
    }
    
    public SemesterCourseDto(Long semesterId, String courseId, Integer courseOrder) {
        this.semesterId = semesterId;
        this.courseId = courseId;
        this.courseOrder = courseOrder;
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
    
    public String getCourseId() {
        return courseId;
    }
    
    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }
    
    public Boolean getIsCompleted() {
        return isCompleted;
    }
    
    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }
    
    public LocalDateTime getCompletionDate() {
        return completionDate;
    }
    
    public void setCompletionDate(LocalDateTime completionDate) {
        this.completionDate = completionDate;
    }
    
    public Integer getCourseOrder() {
        return courseOrder;
    }
    
    public void setCourseOrder(Integer courseOrder) {
        this.courseOrder = courseOrder;
    }
    
    // Course detail getters and setters (fetched from other service)
    public String getCourseName() {
        return courseName;
    }
    
    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }
    
    public String getCourseCode() {
        return courseCode;
    }
    
    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }
    
    public Integer getCredits() {
        return credits;
    }
    
    public void setCredits(Integer credits) {
        this.credits = credits;
    }
    
    public String getProfessor() {
        return professor;
    }
    
    public void setProfessor(String professor) {
        this.professor = professor;
    }
    
    public String getOccurrence() {
        return occurrence;
    }
    
    public void setOccurrence(String occurrence) {
        this.occurrence = occurrence;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getSubcategory() {
        return subcategory;
    }
    
    public void setSubcategory(String subcategory) {
        this.subcategory = subcategory;
    }
}
