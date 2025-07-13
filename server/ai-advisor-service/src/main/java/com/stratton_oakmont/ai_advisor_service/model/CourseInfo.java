package com.stratton_oakmont.ai_advisor_service.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CourseInfo {
    @JsonProperty("course_code")
    private String courseCode;
    
    @JsonProperty("course_name")
    private String courseName;
    
    private String description;
    private String semester;
    private Integer ects;

    // Constructors
    public CourseInfo() {}

    public CourseInfo(String courseCode, String courseName, String description, String semester, Integer ects) {
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.description = description;
        this.semester = semester;
        this.ects = ects;
    }

    // Getters and Setters
    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public Integer getEcts() {
        return ects;
    }

    public void setEcts(Integer ects) {
        this.ects = ects;
    }
}
