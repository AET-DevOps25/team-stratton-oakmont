package com.stratton_oakmont.program_catalog_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "module_details_scraped")
public class ModuleDetails {
    
    @Id
    @Column(name = "id")
    private String id;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "credits")
    private String credits;
    
    @Column(name = "version")
    private String version;
    
    @Column(name = "valid")
    private String valid;
    
    @Column(name = "responsible")
    private String responsible;
    
    @Column(name = "organisation")
    private String organisation;
    
    @Column(name = "note")
    private String note;
    
    @Column(name = "module_level")
    private String moduleLevel;
    
    @Column(name = "abbreviation")
    private String abbreviation;
    
    @Column(name = "subtitle")
    private String subtitle;
    
    @Column(name = "duration")
    private String duration;
    
    @Column(name = "occurrence")
    private String occurrence;
    
    @Column(name = "language")
    private String language;
    
    @Column(name = "related_programs")
    private String relatedPrograms;
    
    @Column(name = "total_hours")
    private String totalHours;
    
    @Column(name = "contact_hours")
    private String contactHours;
    
    @Column(name = "self_study_hours")
    private String selfStudyHours;
    
    @Column(name = "description_of_achievement_and_assessment_methods", columnDefinition = "TEXT")
    private String descriptionOfAchievementAndAssessmentMethods;
    
    @Column(name = "exam_retake_next_semester")
    private String examRetakeNextSemester;
    
    @Column(name = "exam_retake_at_the_end_of_semester")
    private String examRetakeAtTheEndOfSemester;
    
    @Column(name = "prerequisites_recommended", columnDefinition = "TEXT")
    private String prerequisitesRecommended;
    
    @Column(name = "intended_learning_outcomes", columnDefinition = "TEXT")
    private String intendedLearningOutcomes;
    
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "teaching_and_learning_methods", columnDefinition = "TEXT")
    private String teachingAndLearningMethods;
    
    @Column(name = "media", columnDefinition = "TEXT")
    private String media;
    
    @Column(name = "reading_list", columnDefinition = "TEXT")
    private String readingList;
    
    @Column(name = "curriculum_id")
    private String curriculumId;
    
    @Column(name = "transformed_link")
    private String transformedLink;
    
    @Column(name = "extraction_method")
    private String extractionMethod;
    
    // Constructors
    public ModuleDetails() {}
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getCredits() { return credits; }
    public void setCredits(String credits) { this.credits = credits; }
    
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    
    public String getValid() { return valid; }
    public void setValid(String valid) { this.valid = valid; }
    
    public String getResponsible() { return responsible; }
    public void setResponsible(String responsible) { this.responsible = responsible; }
    
    public String getOrganisation() { return organisation; }
    public void setOrganisation(String organisation) { this.organisation = organisation; }
    
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    
    public String getModuleLevel() { return moduleLevel; }
    public void setModuleLevel(String moduleLevel) { this.moduleLevel = moduleLevel; }
    
    public String getAbbreviation() { return abbreviation; }
    public void setAbbreviation(String abbreviation) { this.abbreviation = abbreviation; }
    
    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }
    
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    
    public String getOccurrence() { return occurrence; }
    public void setOccurrence(String occurrence) { this.occurrence = occurrence; }
    
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    
    public String getRelatedPrograms() { return relatedPrograms; }
    public void setRelatedPrograms(String relatedPrograms) { this.relatedPrograms = relatedPrograms; }
    
    public String getTotalHours() { return totalHours; }
    public void setTotalHours(String totalHours) { this.totalHours = totalHours; }
    
    public String getContactHours() { return contactHours; }
    public void setContactHours(String contactHours) { this.contactHours = contactHours; }
    
    public String getSelfStudyHours() { return selfStudyHours; }
    public void setSelfStudyHours(String selfStudyHours) { this.selfStudyHours = selfStudyHours; }
    
    public String getDescriptionOfAchievementAndAssessmentMethods() { return descriptionOfAchievementAndAssessmentMethods; }
    public void setDescriptionOfAchievementAndAssessmentMethods(String descriptionOfAchievementAndAssessmentMethods) { 
        this.descriptionOfAchievementAndAssessmentMethods = descriptionOfAchievementAndAssessmentMethods; 
    }
    
    public String getExamRetakeNextSemester() { return examRetakeNextSemester; }
    public void setExamRetakeNextSemester(String examRetakeNextSemester) { this.examRetakeNextSemester = examRetakeNextSemester; }
    
    public String getExamRetakeAtTheEndOfSemester() { return examRetakeAtTheEndOfSemester; }
    public void setExamRetakeAtTheEndOfSemester(String examRetakeAtTheEndOfSemester) { this.examRetakeAtTheEndOfSemester = examRetakeAtTheEndOfSemester; }
    
    public String getPrerequisitesRecommended() { return prerequisitesRecommended; }
    public void setPrerequisitesRecommended(String prerequisitesRecommended) { this.prerequisitesRecommended = prerequisitesRecommended; }
    
    public String getIntendedLearningOutcomes() { return intendedLearningOutcomes; }
    public void setIntendedLearningOutcomes(String intendedLearningOutcomes) { this.intendedLearningOutcomes = intendedLearningOutcomes; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getTeachingAndLearningMethods() { return teachingAndLearningMethods; }
    public void setTeachingAndLearningMethods(String teachingAndLearningMethods) { this.teachingAndLearningMethods = teachingAndLearningMethods; }
    
    public String getMedia() { return media; }
    public void setMedia(String media) { this.media = media; }
    
    public String getReadingList() { return readingList; }
    public void setReadingList(String readingList) { this.readingList = readingList; }
    
    public String getCurriculumId() { return curriculumId; }
    public void setCurriculumId(String curriculumId) { this.curriculumId = curriculumId; }
    
    public String getTransformedLink() { return transformedLink; }
    public void setTransformedLink(String transformedLink) { this.transformedLink = transformedLink; }
    
    public String getExtractionMethod() { return extractionMethod; }
    public void setExtractionMethod(String extractionMethod) { this.extractionMethod = extractionMethod; }
}