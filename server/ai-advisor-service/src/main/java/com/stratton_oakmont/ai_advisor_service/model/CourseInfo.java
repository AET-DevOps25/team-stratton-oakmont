package com.stratton_oakmont.ai_advisor_service.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Objects;

public class CourseInfo {
    @JsonProperty("module_id")
    private String moduleId;
    private String name;
    private String content;
    private String category;
    private String subcategory;
    private Double credits;
    private String responsible;
    @JsonProperty("module_level")
    private String moduleLevel;
    private String occurrence;
    @JsonProperty("description_of_achievement_and_assessment_methods")
    private String descriptionOfAchievementAndAssessmentMethods;
    @JsonProperty("intended_learning_outcomes")
    private String intendedLearningOutcomes;
    private Double certainty;
    private Integer study_program_id;
    private String course_id_and_name;
    private String link;
    private String version;
    private String valid;
    private String organisation;
    private String note;
    private String abbreviation;
    private String subtitle;
    private String duration;
    private String language;
    private String related_programs;
    private Double total_hours;
    private Double contact_hours;
    private Double self_study_hours;
    private String exam_retake_next_semester;
    private String exam_retake_at_the_end_of_semester;
    private String prerequisites_recommended;
    private String teaching_and_learning_methods;
    private String media;
    private String reading_list;
    private Integer curriculum_id;
    private String transformed_link;
    private String extraction_method;
    private Integer csv_id;

    public CourseInfo() {}

    public String getModuleId() { return moduleId; }
    public void setModuleId(String moduleId) { this.moduleId = moduleId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }

    public Double getCredits() { return credits; }
    public void setCredits(Double credits) { this.credits = credits; }

    public String getResponsible() { return responsible; }
    public void setResponsible(String responsible) { this.responsible = responsible; }

    public String getModuleLevel() { return moduleLevel; }
    public void setModuleLevel(String moduleLevel) { this.moduleLevel = moduleLevel; }

    public String getOccurrence() { return occurrence; }
    public void setOccurrence(String occurrence) { this.occurrence = occurrence; }

    public String getDescriptionOfAchievementAndAssessmentMethods() { return descriptionOfAchievementAndAssessmentMethods; }
    public void setDescriptionOfAchievementAndAssessmentMethods(String descriptionOfAchievementAndAssessmentMethods) { this.descriptionOfAchievementAndAssessmentMethods = descriptionOfAchievementAndAssessmentMethods; }

    public String getIntendedLearningOutcomes() { return intendedLearningOutcomes; }
    public void setIntendedLearningOutcomes(String intendedLearningOutcomes) { this.intendedLearningOutcomes = intendedLearningOutcomes; }

    public Double getCertainty() { return certainty; }
    public void setCertainty(Double certainty) { this.certainty = certainty; }

    public Integer getStudy_program_id() { return study_program_id; }
    public void setStudy_program_id(Integer study_program_id) { this.study_program_id = study_program_id; }

    public String getCourse_id_and_name() { return course_id_and_name; }
    public void setCourse_id_and_name(String course_id_and_name) { this.course_id_and_name = course_id_and_name; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getValid() { return valid; }
    public void setValid(String valid) { this.valid = valid; }

    public String getOrganisation() { return organisation; }
    public void setOrganisation(String organisation) { this.organisation = organisation; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getAbbreviation() { return abbreviation; }
    public void setAbbreviation(String abbreviation) { this.abbreviation = abbreviation; }

    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getRelated_programs() { return related_programs; }
    public void setRelated_programs(String related_programs) { this.related_programs = related_programs; }

    public Double getTotal_hours() { return total_hours; }
    public void setTotal_hours(Double total_hours) { this.total_hours = total_hours; }

    public Double getContact_hours() { return contact_hours; }
    public void setContact_hours(Double contact_hours) { this.contact_hours = contact_hours; }

    public Double getSelf_study_hours() { return self_study_hours; }
    public void setSelf_study_hours(Double self_study_hours) { this.self_study_hours = self_study_hours; }

    public String getExam_retake_next_semester() { return exam_retake_next_semester; }
    public void setExam_retake_next_semester(String exam_retake_next_semester) { this.exam_retake_next_semester = exam_retake_next_semester; }

    public String getExam_retake_at_the_end_of_semester() { return exam_retake_at_the_end_of_semester; }
    public void setExam_retake_at_the_end_of_semester(String exam_retake_at_the_end_of_semester) { this.exam_retake_at_the_end_of_semester = exam_retake_at_the_end_of_semester; }

    public String getPrerequisites_recommended() { return prerequisites_recommended; }
    public void setPrerequisites_recommended(String prerequisites_recommended) { this.prerequisites_recommended = prerequisites_recommended; }

    public String getTeaching_and_learning_methods() { return teaching_and_learning_methods; }
    public void setTeaching_and_learning_methods(String teaching_and_learning_methods) { this.teaching_and_learning_methods = teaching_and_learning_methods; }

    public String getMedia() { return media; }
    public void setMedia(String media) { this.media = media; }

    public String getReading_list() { return reading_list; }
    public void setReading_list(String reading_list) { this.reading_list = reading_list; }

    public Integer getCurriculum_id() { return curriculum_id; }
    public void setCurriculum_id(Integer curriculum_id) { this.curriculum_id = curriculum_id; }

    public String getTransformed_link() { return transformed_link; }
    public void setTransformed_link(String transformed_link) { this.transformed_link = transformed_link; }

    public String getExtraction_method() { return extraction_method; }
    public void setExtraction_method(String extraction_method) { this.extraction_method = extraction_method; }

    public Integer getCsv_id() { return csv_id; }
    public void setCsv_id(Integer csv_id) { this.csv_id = csv_id; }
}

