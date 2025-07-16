package com.stratton_oakmont.study_planer.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "semesters")
public class Semester {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "w_or_s", length = 1)
    private String wOrS; // "W" for Winter, "S" for Summer
    
    @Column(name = "semester_order")
    private Integer semesterOrder; // 1, 2, 3, 4 for ordering
    
    @Column(name = "study_plan_id", nullable = false)
    private Long studyPlanId;
    
    @Column(name = "is_expanded")
    private Boolean isExpanded = true;
    
    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;
    
    @Column(name = "last_modified")
    private LocalDateTime lastModified;
    
    @OneToMany(mappedBy = "semester", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SemesterModule> semesterModules;
    
    // Constructors
    public Semester() {
        this.createdDate = LocalDateTime.now();
        this.lastModified = LocalDateTime.now();
    }
    
    public Semester(String name, String wOrS, Integer semesterOrder, Long studyPlanId) {
        this();
        this.name = name;
        this.wOrS = wOrS;
        this.semesterOrder = semesterOrder;
        this.studyPlanId = studyPlanId;
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
    
    public String getWOrS() {
        return wOrS;
    }
    
    public void setWOrS(String wOrS) {
        this.wOrS = wOrS;
    }
    
    public Integer getSemesterOrder() {
        return semesterOrder;
    }
    
    public void setSemesterOrder(Integer semesterOrder) {
        this.semesterOrder = semesterOrder;
    }
    
    public Long getStudyPlanId() {
        return studyPlanId;
    }
    
    public void setStudyPlanId(Long studyPlanId) {
        this.studyPlanId = studyPlanId;
    }
    
    public Boolean getIsExpanded() {
        return isExpanded;
    }
    
    public void setIsExpanded(Boolean isExpanded) {
        this.isExpanded = isExpanded;
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
    
    public List<SemesterModule> getSemesterModules() {
        return semesterModules;
    }
    
    public void setSemesterModules(List<SemesterModule> semesterModules) {
        this.semesterModules = semesterModules;
    }
    
    // Lifecycle callbacks
    @PreUpdate
    public void preUpdate() {
        this.lastModified = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "Semester{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", wOrS='" + wOrS + '\'' +
                ", semesterOrder=" + semesterOrder +
                ", studyPlanId=" + studyPlanId +
                '}';
    }
}
