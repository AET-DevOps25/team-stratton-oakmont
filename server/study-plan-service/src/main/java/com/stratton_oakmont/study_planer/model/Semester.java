package com.stratton_oakmont.study_planer.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "semesters")
public class Semester {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Semester name cannot be blank")
    @Column(nullable = false, length = 100)
    private String name;
    
    @NotNull(message = "Study plan ID cannot be null")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_plan_id", nullable = false)
    private StudyPlan studyPlan;
    
    @Column(name = "semester_order", nullable = false)
    private Integer semesterOrder = 1; // Order within the study plan (1st semester, 2nd semester, etc.)

    @Column(name = "winter_or_summer", length = 10)
    private String winterOrSummer; // "WINTER" or "SUMMER"
    
    @OneToMany(mappedBy = "semester", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SemesterCourse> courses = new ArrayList<>();
    
    // Constructors
    public Semester() {
    }
    
    public Semester(String name, StudyPlan studyPlan, Integer semesterOrder) {
        this();
        this.name = name;
        this.studyPlan = studyPlan;
        this.semesterOrder = semesterOrder;
    }
    
    public Semester(String name, StudyPlan studyPlan, Integer semesterOrder, String winterOrSummer) {
        this(name, studyPlan, semesterOrder);
        this.winterOrSummer = winterOrSummer;
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
    
    public StudyPlan getStudyPlan() {
        return studyPlan;
    }
    
    public void setStudyPlan(StudyPlan studyPlan) {
        this.studyPlan = studyPlan;
    }
    
    public Integer getSemesterOrder() {
        return semesterOrder;
    }
    
    public void setSemesterOrder(Integer semesterOrder) {
        this.semesterOrder = semesterOrder;
    }
    
    public String getWinterOrSummer() {
        return winterOrSummer;
    }
    
    public void setWinterOrSummer(String winterOrSummer) {
        this.winterOrSummer = winterOrSummer;
    }
    
    public List<SemesterCourse> getCourses() {
        return courses;
    }
    
    public void setCourses(List<SemesterCourse> courses) {
        this.courses = courses;
    }
    
    // Utility methods
    public void addCourse(SemesterCourse course) {
        courses.add(course);
        course.setSemester(this);
    }
    
    public void removeCourse(SemesterCourse course) {
        courses.remove(course);
        course.setSemester(null);
    }
    
    @Override
    public String toString() {
        return "Semester{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", semesterOrder=" + semesterOrder +
                ", coursesCount=" + (courses != null ? courses.size() : 0) +
                '}';
    }
}
