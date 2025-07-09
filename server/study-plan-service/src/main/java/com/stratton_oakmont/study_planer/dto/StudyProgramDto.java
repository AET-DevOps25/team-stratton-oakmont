package com.stratton_oakmont.study_planer.dto;

public class StudyProgramDto {
    private Long id;
    private String name;
    private String degreeType;
    private String curriculum;
    private String fieldOfStudies;
    private Integer ectsCredits;
    private Integer semester;
    private String curriculumLink;
    
    // Constructors
    public StudyProgramDto() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDegreeType() { return degreeType; }
    public void setDegreeType(String degreeType) { this.degreeType = degreeType; }
    
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
}