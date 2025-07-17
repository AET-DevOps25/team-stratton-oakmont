package com.stratton_oakmont.program_catalog_service.dto;

public class ModuleSummaryDto {
    private Integer id;
    private String moduleId;
    private String name;
    private Integer credits;
    private String category;
    private String subcategory;
    private String occurrence;
    private String language;
    private String responsible;
    private String description;
    
    public ModuleSummaryDto() {}
    
    public ModuleSummaryDto(Integer id, String moduleId, String name, Integer credits, String category, 
                           String subcategory, String occurrence, String language, String responsible) {
        this.id = id;
        this.moduleId = moduleId;
        this.name = name;
        this.credits = credits;
        this.category = category;
        this.subcategory = subcategory;
        this.occurrence = occurrence;
        this.language = language;
        this.responsible = responsible;
    }
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public String getModuleId() { return moduleId; }
    public void setModuleId(String moduleId) { this.moduleId = moduleId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }
    
    public String getOccurrence() { return occurrence; }
    public void setOccurrence(String occurrence) { this.occurrence = occurrence; }
    
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    
    public String getResponsible() { return responsible; }
    public void setResponsible(String responsible) { this.responsible = responsible; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}