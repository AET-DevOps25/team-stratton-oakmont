package com.stratton_oakmont.study_planer.entity.studydata;

import jakarta.persistence.*;

@Entity
@Table(name = "study_programs")
public class StudyProgram {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "degree")
    private String degree;
    
    @Column(name = "curriculum")
    private String curriculum;
    
    @Column(name = "field_of_studies")
    private String fieldOfStudies;
    
    @Column(name = "ects_credits")
    private Integer ectsCredits;
    
    @Column(name = "semester")
    private Integer semester;
    
    @Column(name = "curriculum_link")
    private String curriculumLink;
    
    // Constructors
    public StudyProgram() {}
    
    // Getters only (read-only)
    public Long getId() { return id; }
    public String getDegree() { return degree; }
    public String getCurriculum() { return curriculum; }
    public String getFieldOfStudies() { return fieldOfStudies; }
    public Integer getEctsCredits() { return ectsCredits; }
    public Integer getSemester() { return semester; }
    public String getCurriculumLink() { return curriculumLink; }
    
    // Convenience methods for compatibility with existing code
    public String getName() { return curriculum; }  // Maps curriculum to name
}