package com.stratton_oakmont.study_planer.repository;

import com.stratton_oakmont.study_planer.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {
    
    // Find all semesters for a specific study plan
    List<Semester> findByStudyPlanIdOrderBySemesterOrder(Long studyPlanId);
    
    // Find semesters by study plan ID
    List<Semester> findByStudyPlanId(Long studyPlanId);
    
    // Find semester by study plan ID and semester order
    Optional<Semester> findByStudyPlanIdAndSemesterOrder(Long studyPlanId, Integer semesterOrder);
    
    // Find semester by study plan ID and name
    Optional<Semester> findByStudyPlanIdAndName(Long studyPlanId, String name);
    
    // Count semesters for a study plan
    long countByStudyPlanId(Long studyPlanId);
    
    // Find maximum semester order for a study plan
    @Query("SELECT MAX(s.semesterOrder) FROM Semester s WHERE s.studyPlanId = :studyPlanId")
    Optional<Integer> findMaxSemesterOrderByStudyPlanId(@Param("studyPlanId") Long studyPlanId);
    
    // Delete all semesters for a study plan (cascade delete)
    void deleteByStudyPlanId(Long studyPlanId);
    
    // Find semesters by type (Winter/Summer)
    List<Semester> findByStudyPlanIdAndWOrS(Long studyPlanId, String wOrS);
    
    // Check if a semester name already exists for a study plan
    boolean existsByStudyPlanIdAndName(Long studyPlanId, String name);
}
