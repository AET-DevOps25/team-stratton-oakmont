package com.stratton_oakmont.program_catalog_service.controller;

import com.stratton_oakmont.program_catalog_service.model.ModuleDetails;
import com.stratton_oakmont.program_catalog_service.service.ModuleDetailsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/modules")
@CrossOrigin(origins = {
    "https://tum-study-planner.student.k8s.aet.cit.tum.de",
    "http://localhost:5173", 
    "http://localhost:3000"
})
@Tag(name = "Module Details", description = "API for managing module details and curriculum information")
public class ModuleDetailsController {
    
    @Autowired
    private ModuleDetailsService moduleDetailsService;
    
    @Operation(summary = "Get all module details", description = "Retrieve all module details from the database")
    @GetMapping
    public ResponseEntity<List<ModuleDetails>> getAllModuleDetails() {
        List<ModuleDetails> modules = moduleDetailsService.getAllModuleDetails();
        return ResponseEntity.ok(modules);
    }
    
    @Operation(summary = "Get module details by ID", description = "Retrieve module details by database ID")
    @GetMapping("/{id}")
    public ResponseEntity<ModuleDetails> getModuleDetailsById(
            @Parameter(description = "Database ID of the module") @PathVariable Integer id) {
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
    
    @Operation(summary = "Create module details", description = "Create new module details")
    @PostMapping
    public ResponseEntity<ModuleDetails> createModuleDetails(@RequestBody ModuleDetails moduleDetails) {
        ModuleDetails created = moduleDetailsService.createModuleDetails(moduleDetails);
        return ResponseEntity.ok(created);
    }
    
    @Operation(summary = "Update module details", description = "Update existing module details")
    @PutMapping("/{id}")
    public ResponseEntity<ModuleDetails> updateModuleDetails(
            @Parameter(description = "Database ID of the module") @PathVariable Integer id,
            @RequestBody ModuleDetails moduleDetails) {
        try {
            ModuleDetails updated = moduleDetailsService.updateModuleDetails(id, moduleDetails);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @Operation(summary = "Delete module details", description = "Delete module details by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteModuleDetails(
            @Parameter(description = "Database ID of the module") @PathVariable Integer id) {
        moduleDetailsService.deleteModuleDetails(id);
        return ResponseEntity.noContent().build();
    }
}