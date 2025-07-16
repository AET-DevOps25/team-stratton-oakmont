package com.stratton_oakmont.study_planer.repository;

import com.stratton_oakmont.study_planer.entity.SemesterModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SemesterModuleRepository extends JpaRepository<SemesterModule, Long> {
    
    // Find all modules for a specific semester
    List<SemesterModule> findBySemesterIdOrderByModuleOrder(Long semesterId);
    
    // Find modules by semester ID
    List<SemesterModule> findBySemesterId(Long semesterId);
    
    // Find a specific module in a specific semester
    Optional<SemesterModule> findBySemesterIdAndModuleId(Long semesterId, Long moduleId);
    
    // Find all instances of a module across all semesters for a study plan
    @Query("SELECT sm FROM SemesterModule sm JOIN sm.semester s WHERE s.studyPlanId = :studyPlanId AND sm.moduleId = :moduleId")
    List<SemesterModule> findByStudyPlanIdAndModuleId(@Param("studyPlanId") Long studyPlanId, @Param("moduleId") Long moduleId);
    
    // Find completed modules for a semester
    List<SemesterModule> findBySemesterIdAndIsCompleted(Long semesterId, Boolean isCompleted);
    
    // Count modules in a semester
    long countBySemesterId(Long semesterId);
    
    // Count completed modules in a semester
    long countBySemesterIdAndIsCompleted(Long semesterId, Boolean isCompleted);
    
    // Get maximum module order for a semester
    @Query("SELECT MAX(sm.moduleOrder) FROM SemesterModule sm WHERE sm.semester.id = :semesterId")
    Optional<Integer> findMaxModuleOrderBySemesterId(@Param("semesterId") Long semesterId);
    
    // Calculate total credits for a semester
    @Query("SELECT SUM(sm.credits) FROM SemesterModule sm WHERE sm.semester.id = :semesterId")
    Optional<Integer> calculateTotalCreditsBySemesterId(@Param("semesterId") Long semesterId);
    
    // Calculate completed credits for a semester
    @Query("SELECT SUM(sm.credits) FROM SemesterModule sm WHERE sm.semester.id = :semesterId AND sm.isCompleted = true")
    Optional<Integer> calculateCompletedCreditsBySemesterId(@Param("semesterId") Long semesterId);
    
    // Calculate total credits for a study plan
    @Query("SELECT SUM(sm.credits) FROM SemesterModule sm JOIN sm.semester s WHERE s.studyPlanId = :studyPlanId")
    Optional<Integer> calculateTotalCreditsByStudyPlanId(@Param("studyPlanId") Long studyPlanId);
    
    // Calculate completed credits for a study plan
    @Query("SELECT SUM(sm.credits) FROM SemesterModule sm JOIN sm.semester s WHERE s.studyPlanId = :studyPlanId AND sm.isCompleted = true")
    Optional<Integer> calculateCompletedCreditsByStudyPlanId(@Param("studyPlanId") Long studyPlanId);
    
    // Delete all modules for a semester
    void deleteBySemesterId(Long semesterId);
    
    // Check if a module already exists in a semester
    boolean existsBySemesterIdAndModuleId(Long semesterId, Long moduleId);
    
    // Find modules by module IDs for a semester (for batch operations)
    List<SemesterModule> findBySemesterIdAndModuleIdIn(Long semesterId, List<Long> moduleIds);
}
