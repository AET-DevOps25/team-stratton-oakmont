package com.stratton_oakmont.study_planer.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "semester_modules")
public class SemesterModule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;
    
    @Column(name = "module_id", nullable = false)
    private Long moduleId; // Reference to module in program-catalog-service
    
    @Column(name = "module_order")
    private Integer moduleOrder; // Order within the semester
    
    @Column(name = "is_completed")
    private Boolean isCompleted = false;
    
    @Column(name = "added_date", nullable = false)
    private LocalDateTime addedDate;
    
    @Column(name = "completed_date")
    private LocalDateTime completedDate;
    
    // Constructors
    public SemesterModule() {
        this.addedDate = LocalDateTime.now();
    }
    
    public SemesterModule(Semester semester, Long moduleId, Integer moduleOrder) {
        this();
        this.semester = semester;
        this.moduleId = moduleId;
        this.moduleOrder = moduleOrder;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Semester getSemester() {
        return semester;
    }
    
    public void setSemester(Semester semester) {
        this.semester = semester;
    }
    
    public Long getModuleId() {
        return moduleId;
    }
    
    public void setModuleId(Long moduleId) {
        this.moduleId = moduleId;
    }
    
    public Integer getModuleOrder() {
        return moduleOrder;
    }
    
    public void setModuleOrder(Integer moduleOrder) {
        this.moduleOrder = moduleOrder;
    }
    
    public Boolean getIsCompleted() {
        return isCompleted;
    }
    
    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
        if (isCompleted != null && isCompleted && this.completedDate == null) {
            this.completedDate = LocalDateTime.now();
        } else if (isCompleted != null && !isCompleted) {
            this.completedDate = null;
        }
    }
    
    public LocalDateTime getAddedDate() {
        return addedDate;
    }
    
    public void setAddedDate(LocalDateTime addedDate) {
        this.addedDate = addedDate;
    }
    
    public LocalDateTime getCompletedDate() {
        return completedDate;
    }
    
    public void setCompletedDate(LocalDateTime completedDate) {
        this.completedDate = completedDate;
    }
    
    @Override
    public String toString() {
        return "SemesterModule{" +
                "id=" + id +
                ", moduleId=" + moduleId +
                ", isCompleted=" + isCompleted +
                '}';
    }
}
