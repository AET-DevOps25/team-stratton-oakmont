package com.stratton_oakmont.study_planer.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "study_plans")
public class StudyPlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Study plan name cannot be blank")
    @Column(nullable = false, length = 200)
    private String name;
    
    @NotNull(message = "User ID cannot be null")
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    // Store only the study program ID (foreign key reference)
    @Column(name = "study_program_id", nullable = true)
    private Long studyProgramId;

    // Store the study program name for easier access
    @Column(name = "study_program_name", length = 255)
    private String studyProgramName;

    // Relationship to semesters - replace the JSON planData
    @OneToMany(mappedBy = "studyPlan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Semester> semesters = new ArrayList<>();
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    // Constructors
    public StudyPlan() {
    }
    
    public StudyPlan(String name, Long userId) {
        this();
        this.name = name;
        this.userId = userId;
    }
    
    public StudyPlan(String name, Long userId, Long studyProgramId) {
        this();
        this.name = name;
        this.userId = userId;
        this.studyProgramId = studyProgramId;
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
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getStudyProgramId() {
        return studyProgramId;
    }
    
    public void setStudyProgramId(Long studyProgramId) {
        this.studyProgramId = studyProgramId;
    }
    
    public String getStudyProgramName() {
        return studyProgramName;
    }
    
    public void setStudyProgramName(String studyProgramName) {
        this.studyProgramName = studyProgramName;
    }
    
    public List<Semester> getSemesters() {
        return semesters;
    }
    
    public void setSemesters(List<Semester> semesters) {
        this.semesters = semesters;
    }
    
    // Utility methods for semester management
    public void addSemester(Semester semester) {
        semesters.add(semester);
        semester.setStudyPlan(this);
    }
    
    public void removeSemester(Semester semester) {
        semesters.remove(semester);
        semester.setStudyPlan(null);
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    @Override
    public String toString() {
        return "StudyPlan{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", userId=" + userId +
                ", isActive=" + isActive +
                '}';
    }
}