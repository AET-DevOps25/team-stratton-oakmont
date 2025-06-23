package com.stratton_oakmont.study_planer.repository;

import com.stratton_oakmont.study_planer.entity.StudyProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyProgramRepository extends JpaRepository<StudyProgram, Long> {
    
    // Basic query methods
    Optional<StudyProgram> findByName(String name);
    
    List<StudyProgram> findByDegreeType(String degreeType);
    
    List<StudyProgram> findByDegreeTypeAndTotalCreditsGreaterThan(String degreeType, Integer credits);
    
    // Custom query to find programs by name containing keyword (case-insensitive)
    @Query("SELECT sp FROM StudyProgram sp WHERE LOWER(sp.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<StudyProgram> findByNameContainingIgnoreCase(@Param("keyword") String keyword);
    
    // Custom query to find programs by description containing keyword
    @Query("SELECT sp FROM StudyProgram sp WHERE LOWER(sp.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<StudyProgram> findByDescriptionContainingIgnoreCase(@Param("keyword") String keyword);
    
    // Count total programs by degree type
    long countByDegreeType(String degreeType);
    
    // Find all programs ordered by creation date (newest first)
    List<StudyProgram> findAllByOrderByCreatedDateDesc();
    
    // Check if program exists by name and degree type
    boolean existsByNameAndDegreeType(String name, String degreeType);
}