package com.stratton_oakmont.program_catalog_service.controller;

import com.stratton_oakmont.program_catalog_service.dto.CategoryStatisticsDto;
import com.stratton_oakmont.program_catalog_service.dto.CurriculumOverviewDto;
import com.stratton_oakmont.program_catalog_service.dto.ModuleSummaryDto;
import com.stratton_oakmont.program_catalog_service.model.ModuleDetails;
import com.stratton_oakmont.program_catalog_service.service.ModuleDetailsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/modules")
@Tag(name = "Module Details", description = "API for managing module details and curriculum information")
public class ModuleDetailsController {
    
    @Autowired
    private ModuleDetailsService moduleDetailsService;

    @Value("${admin.api.key:default-admin-key-change-me}")
    private String adminApiKey;

    @Operation(summary = "Get all module details", description = "Retrieve all module details from the database")
    @GetMapping
    public ResponseEntity<List<ModuleDetails>> getAllModuleDetails() {
        List<ModuleDetails> modules = moduleDetailsService.getAllModuleDetails();
        return ResponseEntity.ok(modules);
    }
    
    @Operation(summary = "Get module details by ID", description = "Retrieve module details by database ID (e.g., 1)")
    @GetMapping("/{id}")
    public ResponseEntity<ModuleDetails> getModuleDetailsById(
            @Parameter(description = "Database ID of the module (e.g., 1)") @PathVariable Integer id) {
        Optional<ModuleDetails> moduleDetails = moduleDetailsService.getModuleDetailsById(id);
        return moduleDetails.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @Operation(summary = "Get module details by module ID", description = "Retrieve module details by module ID (e.g., IN2003)")
    @GetMapping("/module/{moduleId}")
    public ResponseEntity<ModuleDetails> getModuleDetailsByModuleId(
            @Parameter(description = "Module ID (e.g., IN2003)") @PathVariable String moduleId) {
        Optional<ModuleDetails> moduleDetails = moduleDetailsService.getModuleDetailsByModuleId(moduleId);
        return moduleDetails.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get curriculum overview", description = "Get comprehensive curriculum overview with statistics")
    @GetMapping("/study-program/{studyProgramId}/overview")
    public ResponseEntity<CurriculumOverviewDto> getCurriculumOverview(
            @Parameter(description = "Study program ID") @PathVariable Integer studyProgramId) {
        CurriculumOverviewDto overview = moduleDetailsService.getCurriculumOverview(studyProgramId);
        return ResponseEntity.ok(overview);
    }
    
    @Operation(summary = "Get category statistics", description = "Get statistics for each category including module counts and total credits")
    @GetMapping("/study-program/{studyProgramId}/category-stats")
    public ResponseEntity<List<CategoryStatisticsDto>> getCategoryStatistics(
            @Parameter(description = "Study program ID") @PathVariable Integer studyProgramId) {
        List<CategoryStatisticsDto> stats = moduleDetailsService.getCategoryStatistics(studyProgramId);
        return ResponseEntity.ok(stats);
    }
    
    @Operation(summary = "Get module summaries by category", description = "Get simplified module information for a specific category")
    @GetMapping("/study-program/{studyProgramId}/category/{category}/summaries")
    public ResponseEntity<List<ModuleSummaryDto>> getModuleSummariesByCategory(
            @Parameter(description = "Study program ID") @PathVariable Integer studyProgramId,
            @Parameter(description = "Category name") @PathVariable String category) {
        List<ModuleSummaryDto> summaries = moduleDetailsService.getModuleSummariesByCategory(studyProgramId, category);
        return ResponseEntity.ok(summaries);
    }
    
    @Operation(summary = "Advanced search with filters", description = "Search modules with multiple filter options")
    @GetMapping("/study-program/{studyProgramId}/advanced-search")
    public ResponseEntity<List<ModuleDetails>> advancedSearch(
            @Parameter(description = "Study program ID") @PathVariable Integer studyProgramId,
            @Parameter(description = "Category filter") @RequestParam(required = false) String category,
            @Parameter(description = "Subcategory filter") @RequestParam(required = false) String subcategory,
            @Parameter(description = "Language filter") @RequestParam(required = false) String language,
            @Parameter(description = "Occurrence filter") @RequestParam(required = false) String occurrence,
            @Parameter(description = "Minimum credits") @RequestParam(required = false) Integer minCredits,
            @Parameter(description = "Maximum credits") @RequestParam(required = false) Integer maxCredits,
            @Parameter(description = "Search term") @RequestParam(required = false) String searchTerm) {
        
        List<ModuleDetails> modules = moduleDetailsService.searchWithFilters(
            studyProgramId, category, subcategory, language, occurrence, minCredits, maxCredits, searchTerm);
        return ResponseEntity.ok(modules);
    }
    
    @Operation(summary = "Get modules by semester", description = "Get modules available in a specific semester")
    @GetMapping("/study-program/{studyProgramId}/semester/{semester}")
    public ResponseEntity<List<ModuleDetails>> getModulesBySemester(
            @Parameter(description = "Study program ID") @PathVariable Integer studyProgramId,
            @Parameter(description = "Semester (winter/summer)") @PathVariable String semester) {
        List<ModuleDetails> modules = moduleDetailsService.getModulesBySemester(studyProgramId, semester);
        return ResponseEntity.ok(modules);
    }
    
    @Operation(summary = "Get distinct languages", description = "Get all unique languages for a study program")
    @GetMapping("/study-program/{studyProgramId}/languages")
    public ResponseEntity<List<String>> getDistinctLanguages(
            @Parameter(description = "Study program ID") @PathVariable Integer studyProgramId) {
        List<String> languages = moduleDetailsService.getDistinctLanguages(studyProgramId);
        return ResponseEntity.ok(languages);
    }
    
    @Operation(summary = "Get distinct occurrences", description = "Get all unique semester occurrences for a study program")
    @GetMapping("/study-program/{studyProgramId}/occurrences")
    public ResponseEntity<List<String>> getDistinctOccurrences(
            @Parameter(description = "Study program ID") @PathVariable Integer studyProgramId) {
        List<String> occurrences = moduleDetailsService.getDistinctOccurrences(studyProgramId);
        return ResponseEntity.ok(occurrences);
    }

    
    @Operation(summary = "Get modules by study program", description = "Retrieve all modules for a specific study program")
    @GetMapping("/study-program/{studyProgramId}")
    public ResponseEntity<List<ModuleDetails>> getModulesByStudyProgram(
            @Parameter(description = "Study program ID") @PathVariable Integer studyProgramId) {
        List<ModuleDetails> modules = moduleDetailsService.getModuleDetailsByStudyProgramId(studyProgramId);
        return ResponseEntity.ok(modules);
    }
    
    @Operation(summary = "Get modules by study program and category", description = "Retrieve modules filtered by study program and category")
    @GetMapping("/study-program/{studyProgramId}/category/{category}")
    public ResponseEntity<List<ModuleDetails>> getModulesByStudyProgramAndCategory(
            @Parameter(description = "Study program ID") @PathVariable Integer studyProgramId,
            @Parameter(description = "Module category") @PathVariable String category) {
        List<ModuleDetails> modules = moduleDetailsService.getModuleDetailsByStudyProgramIdAndCategory(studyProgramId, category);
        return ResponseEntity.ok(modules);
    }
    
    @Operation(summary = "Search modules", description = "Search modules by name or module ID within a study program")
    @GetMapping("/study-program/{studyProgramId}/search")
    public ResponseEntity<List<ModuleDetails>> searchModules(
            @Parameter(description = "Study program ID") @PathVariable Integer studyProgramId,
            @Parameter(description = "Search term") @RequestParam String q) {
        List<ModuleDetails> modules = moduleDetailsService.searchModuleDetails(studyProgramId, q);
        return ResponseEntity.ok(modules);
    }
    
    @Operation(summary = "Get modules by occurrence", description = "Retrieve modules by semester occurrence (e.g., 'winter semester', 'summer semester')")
    @GetMapping("/study-program/{studyProgramId}/occurrence/{occurrence}")
    public ResponseEntity<List<ModuleDetails>> getModulesByOccurrence(
            @Parameter(description = "Study program ID") @PathVariable Integer studyProgramId,
            @Parameter(description = "Semester occurrence") @PathVariable String occurrence) {
        List<ModuleDetails> modules = moduleDetailsService.getModuleDetailsByOccurrence(studyProgramId, occurrence);
        return ResponseEntity.ok(modules);
    }
    
    @Operation(summary = "Get modules by credits range", description = "Retrieve modules within a specific credits range")
    @GetMapping("/study-program/{studyProgramId}/credits")
    public ResponseEntity<List<ModuleDetails>> getModulesByCreditsRange(
            @Parameter(description = "Study program ID") @PathVariable Integer studyProgramId,
            @Parameter(description = "Minimum credits") @RequestParam Integer minCredits,
            @Parameter(description = "Maximum credits") @RequestParam Integer maxCredits) {
        List<ModuleDetails> modules = moduleDetailsService.getModuleDetailsByCreditsRange(studyProgramId, minCredits, maxCredits);
        return ResponseEntity.ok(modules);
    }
    
    @Operation(summary = "Get distinct categories", description = "Get all unique categories for a study program")
    @GetMapping("/study-program/{studyProgramId}/categories")
    public ResponseEntity<List<String>> getDistinctCategories(
            @Parameter(description = "Study program ID") @PathVariable Integer studyProgramId) {
        List<String> categories = moduleDetailsService.getDistinctCategories(studyProgramId);
        return ResponseEntity.ok(categories);
    }
    
    @Operation(summary = "Get distinct subcategories", description = "Get all unique subcategories for a study program and category")
    @GetMapping("/study-program/{studyProgramId}/categories/{category}/subcategories")
    public ResponseEntity<List<String>> getDistinctSubcategories(
            @Parameter(description = "Study program ID") @PathVariable Integer studyProgramId,
            @Parameter(description = "Category") @PathVariable String category) {
        List<String> subcategories = moduleDetailsService.getDistinctSubcategories(studyProgramId, category);
        return ResponseEntity.ok(subcategories);
    }
    
    @Operation(summary = "Create module details", description = "Create new module details (Admin only)")
    @PostMapping
    public ResponseEntity<?> createModuleDetails(
            @RequestBody ModuleDetails moduleDetails,
            @RequestHeader(value = "X-Admin-API-Key", required = false) String apiKey) {
        
        if (!isValidAdminApiKey(apiKey)) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "UNAUTHORIZED");
            error.put("message", "Valid admin API key required for this operation");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
        
        try {
            ModuleDetails created = moduleDetailsService.createModuleDetails(moduleDetails);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "CREATE_ERROR");
            error.put("message", "Error creating module: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @Operation(summary = "Update module details", description = "Update existing module details (Admin only)")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateModuleDetails(
            @Parameter(description = "Database ID of the module") @PathVariable Integer id,
            @RequestBody ModuleDetails moduleDetails,
            @RequestHeader(value = "X-Admin-API-Key", required = false) String apiKey) {
        
        if (!isValidAdminApiKey(apiKey)) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "UNAUTHORIZED");
            error.put("message", "Valid admin API key required for this operation");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
        
        try {
            ModuleDetails updated = moduleDetailsService.updateModuleDetails(id, moduleDetails);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "NOT_FOUND");
            error.put("message", "Module not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "UPDATE_ERROR");
            error.put("message", "Error updating module: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @Operation(summary = "Delete module details", description = "Delete module details by ID (Admin only)")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteModuleDetails(
            @Parameter(description = "Database ID of the module") @PathVariable Integer id,
            @RequestHeader(value = "X-Admin-API-Key", required = false) String apiKey) {
        
        if (!isValidAdminApiKey(apiKey)) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "UNAUTHORIZED");
            error.put("message", "Valid admin API key required for this operation");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
        
        try {
            moduleDetailsService.deleteModuleDetails(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Module deleted successfully");
            response.put("deletedId", id.toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "DELETE_ERROR");
            error.put("message", "Error deleting module: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Validates the admin API key
     */
    private boolean isValidAdminApiKey(String apiKey) {
        return apiKey != null && !apiKey.trim().isEmpty() && adminApiKey.equals(apiKey);
    }
}