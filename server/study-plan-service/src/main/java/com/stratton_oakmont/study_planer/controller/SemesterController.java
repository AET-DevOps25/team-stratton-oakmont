package com.stratton_oakmont.study_planer.controller;

import com.stratton_oakmont.study_planer.dto.CreateSemesterRequest;
import com.stratton_oakmont.study_planer.dto.SemesterDto;
import com.stratton_oakmont.study_planer.dto.SemesterModuleDto;
import com.stratton_oakmont.study_planer.dto.AddModuleToSemesterRequest;
import com.stratton_oakmont.study_planer.entity.Semester;
import com.stratton_oakmont.study_planer.entity.SemesterModule;
import com.stratton_oakmont.study_planer.service.SemesterService;
import com.stratton_oakmont.study_planer.service.SemesterModuleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/semesters")
@CrossOrigin(origins = "*")
public class SemesterController {
    
    private final SemesterService semesterService;
    private final SemesterModuleService semesterModuleService;
    
    @Autowired
    public SemesterController(SemesterService semesterService, SemesterModuleService semesterModuleService) {
        this.semesterService = semesterService;
        this.semesterModuleService = semesterModuleService;
    }
    
    // SEMESTER CRUD operations
    
    @PostMapping
    public ResponseEntity<SemesterDto> createSemester(@Valid @RequestBody CreateSemesterRequest request) {
        Semester createdSemester = semesterService.createSemesterForStudyPlan(
            request.getStudyPlanId(), 
            request.getName(), 
            request.getWOrS()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(createdSemester));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SemesterDto> getSemesterById(@PathVariable Long id) {
        Semester semester = semesterService.getSemesterById(id);
        return ResponseEntity.ok(convertToDto(semester));
    }
    
    @GetMapping("/study-plan/{studyPlanId}")
    public ResponseEntity<List<SemesterDto>> getSemestersByStudyPlan(@PathVariable Long studyPlanId) {
        List<Semester> semesters = semesterService.getSemestersByStudyPlanId(studyPlanId);
        List<SemesterDto> semesterDtos = semesters.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(semesterDtos);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<SemesterDto> updateSemester(@PathVariable Long id,
                                                     @Valid @RequestBody CreateSemesterRequest request) {
        Semester updatedSemester = new Semester();
        updatedSemester.setName(request.getName());
        updatedSemester.setWOrS(request.getWOrS());
        updatedSemester.setSemesterOrder(request.getSemesterOrder());
        
        Semester semester = semesterService.updateSemester(id, updatedSemester);
        return ResponseEntity.ok(convertToDto(semester));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSemester(@PathVariable Long id) {
        semesterService.deleteSemester(id);
        return ResponseEntity.noContent().build();
    }
    
    // MODULE operations within semesters
    
    @PostMapping("/{semesterId}/modules")
    public ResponseEntity<SemesterModuleDto> addModuleToSemester(@PathVariable Long semesterId,
                                                                @Valid @RequestBody AddModuleToSemesterRequest request) {
        SemesterModule semesterModule = semesterModuleService.addModuleToSemester(
                semesterId, 
                request.getModuleId(), 
                request.getModuleOrder()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToModuleDto(semesterModule));
    }
    
    @GetMapping("/{semesterId}/modules")
    public ResponseEntity<List<SemesterModuleDto>> getModulesInSemester(@PathVariable Long semesterId) {
        List<SemesterModule> modules = semesterModuleService.getModulesBySemesterId(semesterId);
        List<SemesterModuleDto> moduleDtos = modules.stream()
                .map(this::convertToModuleDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(moduleDtos);
    }
    
    @DeleteMapping("/{semesterId}/modules/{moduleId}")
    public ResponseEntity<Void> removeModuleFromSemester(@PathVariable Long semesterId,
                                                         @PathVariable Long moduleId) {
        semesterModuleService.removeModuleFromSemester(semesterId, moduleId);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/modules/{moduleRecordId}")
    public ResponseEntity<SemesterModuleDto> updateSemesterModule(@PathVariable Long moduleRecordId,
                                                                 @Valid @RequestBody AddModuleToSemesterRequest request) {
        SemesterModule updatedModule = new SemesterModule();
        updatedModule.setModuleOrder(request.getModuleOrder());
        
        SemesterModule semesterModule = semesterModuleService.updateSemesterModule(moduleRecordId, updatedModule);
        return ResponseEntity.ok(convertToModuleDto(semesterModule));
    }
    
    @PutMapping("/modules/{moduleRecordId}/completion")
    public ResponseEntity<SemesterModuleDto> toggleModuleCompletion(@PathVariable Long moduleRecordId) {
        SemesterModule semesterModule = semesterModuleService.toggleModuleCompletion(moduleRecordId);
        return ResponseEntity.ok(convertToModuleDto(semesterModule));
    }
    
    // DTO conversion methods
    private SemesterDto convertToDto(Semester semester) {
        SemesterDto dto = new SemesterDto();
        dto.setId(semester.getId());
        dto.setName(semester.getName());
        dto.setWOrS(semester.getWOrS());
        dto.setSemesterOrder(semester.getSemesterOrder());
        dto.setStudyPlanId(semester.getStudyPlanId());
        dto.setCreatedDate(semester.getCreatedDate());
        dto.setLastModified(semester.getLastModified());
        return dto;
    }
    
    private SemesterModuleDto convertToModuleDto(SemesterModule semesterModule) {
        SemesterModuleDto dto = new SemesterModuleDto();
        dto.setId(semesterModule.getId());
        dto.setSemesterId(semesterModule.getSemester().getId());
        dto.setModuleId(semesterModule.getModuleId());
        dto.setModuleOrder(semesterModule.getModuleOrder());
        dto.setIsCompleted(semesterModule.getIsCompleted());
        dto.setAddedDate(semesterModule.getAddedDate());
        dto.setCompletedDate(semesterModule.getCompletedDate());
        // Note: Module details (name, code, credits) should be fetched from program-catalog-service
        return dto;
    }
}
