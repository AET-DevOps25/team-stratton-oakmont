package com.stratton_oakmont.study_planer.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "study_programs")
public class StudyProgram {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Program name cannot be blank")
    @Column(nullable = false, length = 200)
    private String name;
    
    @NotNull(message = "Total credits cannot be null")
    @Positive(message = "Total credits must be positive")
    @Column(name = "total_credits", nullable = false)
    private Integer totalCredits;
    
    @NotNull(message = "Semester duration cannot be null")
    @Positive(message = "Semester duration must be positive")
    @Column(name = "semester_duration", nullable = false)
    private Integer semesterDuration;
    
    @Column(name = "mandatory_courses", columnDefinition = "TEXT")
    private String mandatoryCourses; // JSON string for now, can be improved later
    
    @Column(name = "available_courses", columnDefinition = "TEXT")
    private String availableCourses; // JSON string for now, can be improved later
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotBlank(message = "Degree type cannot be blank")
    @Column(name = "degree_type", nullable = false, length = 50)
    private String degreeType; // e.g., "Bachelor", "Master"
    
    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;
    
    @Column(name = "last_modified")
    private LocalDateTime lastModified;
    
    // One-to-many relationship with StudyPlan
    @OneToMany(mappedBy = "studyProgram", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<StudyPlan> studyPlans = new ArrayList<>();
    
    // Constructors
    public StudyProgram() {
        this.createdDate = LocalDateTime.now();
        this.lastModified = LocalDateTime.now();
    }
    
    public StudyProgram(String name, Integer totalCredits, Integer semesterDuration, String degreeType) {
        this();
        this.name = name;
        this.totalCredits = totalCredits;
        this.semesterDuration = semesterDuration;
        this.degreeType = degreeType;
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
    
    public Integer getTotalCredits() {
        return totalCredits;
    }
    
    public void setTotalCredits(Integer totalCredits) {
        this.totalCredits = totalCredits;
    }
    
    public Integer getSemesterDuration() {
        return semesterDuration;
    }
    
    public void setSemesterDuration(Integer semesterDuration) {
        this.semesterDuration = semesterDuration;
    }
    
    public String getMandatoryCourses() {
        return mandatoryCourses;
    }
    
    public void setMandatoryCourses(String mandatoryCourses) {
        this.mandatoryCourses = mandatoryCourses;
    }
    
    public String getAvailableCourses() {
        return availableCourses;
    }
    
    public void setAvailableCourses(String availableCourses) {
        this.availableCourses = availableCourses;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getDegreeType() {
        return degreeType;
    }
    
    public void setDegreeType(String degreeType) {
        this.degreeType = degreeType;
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
    
    public List<StudyPlan> getStudyPlans() {
        return studyPlans;
    }
    
    public void setStudyPlans(List<StudyPlan> studyPlans) {
        this.studyPlans = studyPlans;
    }
    
    // Lifecycle callbacks
    @PreUpdate
    public void preUpdate() {
        this.lastModified = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "StudyProgram{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", totalCredits=" + totalCredits +
                ", semesterDuration=" + semesterDuration +
                ", degreeType='" + degreeType + '\'' +
                '}';
    }
}