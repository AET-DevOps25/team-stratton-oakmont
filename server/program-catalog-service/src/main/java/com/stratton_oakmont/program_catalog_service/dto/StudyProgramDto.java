package com.stratton_oakmont.program_catalog_service.dto;

public class StudyProgramDto {
    private Long id;
    private String degree;
    private String curriculum;
    private String fieldOfStudies;
    private Integer ectsCredits;
    private Integer semester;
    private String curriculumLink;
    
    // Constructors
    public StudyProgramDto() {}
    
    public StudyProgramDto(Long id, String degree, String curriculum) {
        this.id = id;
        this.degree = degree;
        this.curriculum = curriculum;
    }
    
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
    
    // Convenience methods
    public String getName() { return curriculum; }
}
