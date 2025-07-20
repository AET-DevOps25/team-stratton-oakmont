package com.stratton_oakmont.study_planer.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "semester_courses",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"course_id", "semester_id"}, 
                         name = "uk_semester_course_unique")
    }
)
public class SemesterCourse {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Semester cannot be null")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;
    
    @NotNull(message = "Course ID cannot be null")
    @Column(name = "course_id", nullable = false)
    private String courseId; // Reference to course in the other database - just store the ID
    
    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;
    
    @Column(name = "completion_date")
    private LocalDateTime completionDate;
    
    // Optional: Store course order within the semester
    @Column(name = "course_order")
    private Integer courseOrder;
    
    // Constructors
    public SemesterCourse() {
    }
    
    public SemesterCourse(Semester semester, String courseId) {
        this();
        this.semester = semester;
        this.courseId = courseId;
    }
    
    public SemesterCourse(Semester semester, String courseId, Integer courseOrder) {
        this(semester, courseId);
        this.courseOrder = courseOrder;
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
        // Auto-set completion date when marking as completed
        if (isCompleted != null && isCompleted && this.completionDate == null) {
            this.completionDate = LocalDateTime.now();
        } else if (isCompleted != null && !isCompleted) {
            this.completionDate = null;
        }
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
    
    // Lifecycle callbacks
    @Override
    public String toString() {
        return "SemesterCourse{" +
                "id=" + id +
                ", courseId='" + courseId + '\'' +
                ", isCompleted=" + isCompleted +
                ", courseOrder=" + courseOrder +
                '}';
    }
}
