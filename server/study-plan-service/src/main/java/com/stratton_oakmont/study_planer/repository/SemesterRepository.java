package com.stratton_oakmont.study_planer.repository;

import com.stratton_oakmont.study_planer.model.Semester;
import com.stratton_oakmont.study_planer.model.StudyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {
    
    // Find all semesters for a specific study plan
    List<Semester> findByStudyPlanId(Long studyPlanId);
    
    // Find semesters for a study plan ordered by semester order
    List<Semester> findByStudyPlanIdOrderBySemesterOrder(Long studyPlanId);
    
    // Find all semesters for a specific study plan
    List<Semester> findByStudyPlan(StudyPlan studyPlan);
    
    // Find semesters by study plan ordered by semester order
    List<Semester> findByStudyPlanOrderBySemesterOrder(StudyPlan studyPlan);
    
    // Find semesters by name containing keyword (case-insensitive)
    @Query("SELECT s FROM Semester s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Semester> findByNameContainingIgnoreCase(@Param("keyword") String keyword);
    
    // Count semesters for a study plan
    long countByStudyPlanId(Long studyPlanId);
    
    // Find semester by study plan and order
    Semester findByStudyPlanIdAndSemesterOrder(Long studyPlanId, Integer semesterOrder);
    
    // Check if a semester order already exists for a study plan
    boolean existsByStudyPlanIdAndSemesterOrder(Long studyPlanId, Integer semesterOrder);
    
    // Find max semester order for a study plan
    @Query("SELECT COALESCE(MAX(s.semesterOrder), 0) FROM Semester s WHERE s.studyPlan.id = :studyPlanId")
    Integer findMaxSemesterOrderByStudyPlanId(@Param("studyPlanId") Long studyPlanId);
}
