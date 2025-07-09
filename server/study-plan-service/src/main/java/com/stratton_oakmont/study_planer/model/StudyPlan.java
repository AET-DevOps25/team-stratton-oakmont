package com.stratton_oakmont.study_planer.entity;

import com.stratton_oakmont.study_planer.entity.studydata.StudyProgram; 
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

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
    
    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;
    
    @Column(name = "last_modified")
    private LocalDateTime lastModified;
    
    // Many-to-one relationship with StudyProgram
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_program_id", nullable = false)
    @NotNull(message = "Study program cannot be null")
    private StudyProgram studyProgram;
    
    // Additional fields for study plan data (JSON for now)
    @Column(name = "plan_data", columnDefinition = "TEXT")
    private String planData; // JSON string containing semester structure, selected courses, etc.
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    // Constructors
    public StudyPlan() {
        this.createdDate = LocalDateTime.now();
        this.lastModified = LocalDateTime.now();
    }
    
    public StudyPlan(String name, Long userId, StudyProgram studyProgram) {
        this();
        this.name = name;
        this.userId = userId;
        this.studyProgram = studyProgram;
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
    
    public StudyProgram getStudyProgram() {
        return studyProgram;
    }
    
    public void setStudyProgram(StudyProgram studyProgram) {
        this.studyProgram = studyProgram;
    }
    
    public String getPlanData() {
        return planData;
    }
    
    public void setPlanData(String planData) {
        this.planData = planData;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    // Lifecycle callbacks
    @PreUpdate
    public void preUpdate() {
        this.lastModified = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "StudyPlan{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", userId=" + userId +
                ", createdDate=" + createdDate +
                ", isActive=" + isActive +
                '}';
    }
}