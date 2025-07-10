package com.stratton_oakmont.program_catalog_service.controller;

import com.stratton_oakmont.program_catalog_service.dto.ModuleDetailsDto;
import com.stratton_oakmont.program_catalog_service.entity.ModuleDetails;
import com.stratton_oakmont.program_catalog_service.service.ModuleDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = {
    "https://tum-study-planner.student.k8s.aet.cit.tum.de",
    "http://localhost:5173", 
    "http://localhost:3000"
})
public class ModuleDetailsController {
    
    private final ModuleDetailsService moduleDetailsService;
    
    @Autowired
    public ModuleDetailsController(ModuleDetailsService moduleDetailsService) {
        this.moduleDetailsService = moduleDetailsService;
    }
    
    // GET /api/v1/module-details-scraped - Get all modules
    @GetMapping("/module-details-scraped")
    public ResponseEntity<List<ModuleDetailsDto>> getAllModules() {
        List<ModuleDetails> modules = moduleDetailsService.getAllModules();
        List<ModuleDetailsDto> moduleDtos = modules.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(moduleDtos);
    }
    
    // GET /api/v1/module-details-scraped/{id} - Get specific module
    @GetMapping("/module-details-scraped/{id}")
    public ResponseEntity<ModuleDetailsDto> getModuleById(@PathVariable String id) {
        Optional<ModuleDetails> module = moduleDetailsService.getModuleById(id);
        if (module.isPresent()) {
            return ResponseEntity.ok(convertToDto(module.get()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // GET /api/v1/module-details-scraped/search - Search modules
    @GetMapping("/module-details-scraped/search")
    public ResponseEntity<List<ModuleDetailsDto>> searchModules(@RequestParam String q) {
        List<ModuleDetails> modules = moduleDetailsService.searchModules(q);
        List<ModuleDetailsDto> moduleDtos = modules.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(moduleDtos);
    }
    
    // GET /api/v1/module-details-scraped/filter/language/{language} - Filter by language
    @GetMapping("/module-details-scraped/filter/language/{language}")
    public ResponseEntity<List<ModuleDetailsDto>> getModulesByLanguage(@PathVariable String language) {
        List<ModuleDetails> modules = moduleDetailsService.getModulesByLanguage(language);
        List<ModuleDetailsDto> moduleDtos = modules.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(moduleDtos);
    }
    
    // GET /api/v1/module-details-scraped/filter/credits/{credits} - Filter by credits
    @GetMapping("/module-details-scraped/filter/credits/{credits}")
    public ResponseEntity<List<ModuleDetailsDto>> getModulesByCredits(@PathVariable String credits) {
        List<ModuleDetails> modules = moduleDetailsService.getModulesByCredits(credits);
        List<ModuleDetailsDto> moduleDtos = modules.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(moduleDtos);
    }
    
    // Helper method to convert ModuleDetails entity to DTO
    private ModuleDetailsDto convertToDto(ModuleDetails module) {
        ModuleDetailsDto dto = new ModuleDetailsDto();
        dto.setId(module.getId());
        dto.setName(module.getName());
        dto.setCredits(module.getCredits());
        dto.setVersion(module.getVersion());
        dto.setValid(module.getValid());
        dto.setResponsible(module.getResponsible());
        dto.setOrganisation(module.getOrganisation());
        dto.setNote(module.getNote());
        dto.setModuleLevel(module.getModuleLevel());
        dto.setAbbreviation(module.getAbbreviation());
        dto.setSubtitle(module.getSubtitle());
        dto.setDuration(module.getDuration());
        dto.setOccurrence(module.getOccurrence());
        dto.setLanguage(module.getLanguage());
        dto.setRelatedPrograms(module.getRelatedPrograms());
        dto.setTotalHours(module.getTotalHours());
        dto.setContactHours(module.getContactHours());
        dto.setSelfStudyHours(module.getSelfStudyHours());
        dto.setDescriptionOfAchievementAndAssessmentMethods(module.getDescriptionOfAchievementAndAssessmentMethods());
        dto.setExamRetakeNextSemester(module.getExamRetakeNextSemester());
        dto.setExamRetakeAtTheEndOfSemester(module.getExamRetakeAtTheEndOfSemester());
        dto.setPrerequisitesRecommended(module.getPrerequisitesRecommended());
        dto.setIntendedLearningOutcomes(module.getIntendedLearningOutcomes());
        dto.setContent(module.getContent());
        dto.setTeachingAndLearningMethods(module.getTeachingAndLearningMethods());
        dto.setMedia(module.getMedia());
        dto.setReadingList(module.getReadingList());
        dto.setCurriculumId(module.getCurriculumId());
        dto.setTransformedLink(module.getTransformedLink());
        dto.setExtractionMethod(module.getExtractionMethod());
        return dto;
    }
}