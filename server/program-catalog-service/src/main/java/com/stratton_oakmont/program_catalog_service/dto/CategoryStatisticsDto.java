package com.stratton_oakmont.program_catalog_service.dto;

import java.util.List;

public class CategoryStatisticsDto {
    private String category;
    private Integer totalCredits;
    private Integer moduleCount;
    private List<String> subcategories;
    private List<ModuleSummaryDto> modules;
    
    public CategoryStatisticsDto() {}
    
    public CategoryStatisticsDto(String category, Integer totalCredits, Integer moduleCount) {
        this.category = category;
        this.totalCredits = totalCredits;
        this.moduleCount = moduleCount;
    }
    
    // Getters and Setters
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public Integer getTotalCredits() { return totalCredits; }
    public void setTotalCredits(Integer totalCredits) { this.totalCredits = totalCredits; }
    
    public Integer getModuleCount() { return moduleCount; }
    public void setModuleCount(Integer moduleCount) { this.moduleCount = moduleCount; }
    
    public List<String> getSubcategories() { return subcategories; }
    public void setSubcategories(List<String> subcategories) { this.subcategories = subcategories; }
    
    public List<ModuleSummaryDto> getModules() { return modules; }
    public void setModules(List<ModuleSummaryDto> modules) { this.modules = modules; }
}