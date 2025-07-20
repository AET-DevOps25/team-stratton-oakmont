package com.stratton_oakmont.study_planer.repository;

import com.stratton_oakmont.study_planer.model.Semester;
import com.stratton_oakmont.study_planer.model.SemesterCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SemesterCourseRepository extends JpaRepository<SemesterCourse, Long> {
    
    // Find all courses for a specific semester
    List<SemesterCourse> findBySemesterId(Long semesterId);
    
    // Find all courses for a specific semester ordered by course order
    List<SemesterCourse> findBySemesterIdOrderByCourseOrder(Long semesterId);
    
    // Find courses for a semester
    List<SemesterCourse> findBySemester(Semester semester);
    
    // Find courses for a semester ordered by course order
    List<SemesterCourse> findBySemesterOrderByCourseOrder(Semester semester);
    
    // Find a specific course in a specific semester
    Optional<SemesterCourse> findBySemesterIdAndCourseId(Long semesterId, String courseId);
    
    // Find all occurrences of a course across all semesters
    List<SemesterCourse> findByCourseId(String courseId);
    
    // Find completed courses in a semester
    List<SemesterCourse> findBySemesterIdAndIsCompletedTrue(Long semesterId);
    
    // Find uncompleted courses in a semester
    List<SemesterCourse> findBySemesterIdAndIsCompletedFalse(Long semesterId);
    
    // Find all courses for a study plan (across all semesters)
    @Query("SELECT sc FROM SemesterCourse sc WHERE sc.semester.studyPlan.id = :studyPlanId")
    List<SemesterCourse> findByStudyPlanId(@Param("studyPlanId") Long studyPlanId);
    
    // Find completed courses for a study plan
    @Query("SELECT sc FROM SemesterCourse sc WHERE sc.semester.studyPlan.id = :studyPlanId AND sc.isCompleted = true")
    List<SemesterCourse> findCompletedCoursesByStudyPlanId(@Param("studyPlanId") Long studyPlanId);
    
    // Count total courses in a semester
    long countBySemesterId(Long semesterId);
    
    // Count completed courses in a semester
    long countBySemesterIdAndIsCompletedTrue(Long semesterId);
    
    // Count uncompleted courses in a semester
    long countBySemesterIdAndIsCompletedFalse(Long semesterId);
    
    // Count total courses for a study plan
    @Query("SELECT COUNT(sc) FROM SemesterCourse sc WHERE sc.semester.studyPlan.id = :studyPlanId")
    long countByStudyPlanId(@Param("studyPlanId") Long studyPlanId);
    
    // Count completed courses for a study plan
    @Query("SELECT COUNT(sc) FROM SemesterCourse sc WHERE sc.semester.studyPlan.id = :studyPlanId AND sc.isCompleted = true")
    long countCompletedByStudyPlanId(@Param("studyPlanId") Long studyPlanId);
    
    // Find courses completed within a date range
    List<SemesterCourse> findByCompletionDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Check if a course exists in a semester
    boolean existsBySemesterIdAndCourseId(Long semesterId, String courseId);
    
    // Find max course order for a semester
    @Query("SELECT COALESCE(MAX(sc.courseOrder), 0) FROM SemesterCourse sc WHERE sc.semester.id = :semesterId")
    Integer findMaxCourseOrderBySemesterId(@Param("semesterId") Long semesterId);
    
    // Delete all courses for a semester
    void deleteBySemesterId(Long semesterId);
    
    // Delete a specific course from a semester
    void deleteBySemesterIdAndCourseId(Long semesterId, String courseId);
}
