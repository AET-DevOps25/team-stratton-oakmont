package com.stratton_oakmont.program_catalog_service.model;

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
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }
    
    public String getCurriculum() { return curriculum; }
    public void setCurriculum(String curriculum) { this.curriculum = curriculum; }
    
    public String getFieldOfStudies() { return fieldOfStudies; }
    public void setFieldOfStudies(String fieldOfStudies) { this.fieldOfStudies = fieldOfStudies; }
    
    public Integer getEctsCredits() { return ectsCredits; }
    public void setEctsCredits(Integer ectsCredits) { this.ectsCredits = ectsCredits; }
    
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    
    public String getCurriculumLink() { return curriculumLink; }
    public void setCurriculumLink(String curriculumLink) { this.curriculumLink = curriculumLink; }
    
    // Convenience methods for compatibility
    public String getName() { return curriculum; }
}
