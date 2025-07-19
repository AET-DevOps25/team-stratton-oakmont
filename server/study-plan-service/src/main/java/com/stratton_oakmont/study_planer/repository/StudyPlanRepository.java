package com.stratton_oakmont.study_planer.repository;

import com.stratton_oakmont.study_planer.model.StudyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyPlanRepository extends JpaRepository<StudyPlan, Long> {
    
    // Find all study plans for a specific user
    List<StudyPlan> findByUserId(Long userId);
    
    // Find active study plans for a user
    List<StudyPlan> findByUserIdAndIsActiveTrue(Long userId);
    
    // Find study plans by user and study program ID
    List<StudyPlan> findByUserIdAndStudyProgramId(Long userId, Long studyProgramId);
    
    // Find study plans by study program ID
    List<StudyPlan> findByStudyProgramId(Long studyProgramId);
    
    // Find study plans by name containing keyword (case-insensitive)
    @Query("SELECT sp FROM StudyPlan sp WHERE LOWER(sp.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<StudyPlan> findByNameContainingIgnoreCase(@Param("keyword") String keyword);
    
    // Count total active study plans for a user
    long countByUserIdAndIsActiveTrue(Long userId);
    
    // Count total study plans for a user
    long countByUserId(Long userId);
    
    // Count total study plans for a specific program ID
    long countByStudyProgramId(Long studyProgramId);
    
    // Check if user has any active study plans
    boolean existsByUserIdAndIsActiveTrue(Long userId);
}