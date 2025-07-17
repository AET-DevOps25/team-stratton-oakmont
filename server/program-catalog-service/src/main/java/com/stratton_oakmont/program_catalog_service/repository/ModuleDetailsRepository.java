package com.stratton_oakmont.program_catalog_service.repository;

import com.stratton_oakmont.program_catalog_service.model.ModuleDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleDetailsRepository extends JpaRepository<ModuleDetails, Integer> {
    
    // Find by study program ID
    List<ModuleDetails> findByStudyProgramId(Integer studyProgramId);
    
    // Find by module ID
    Optional<ModuleDetails> findByModuleId(String moduleId);
    
    // Find by category
    List<ModuleDetails> findByCategory(String category);
    
    // Find by category and subcategory
    List<ModuleDetails> findByCategoryAndSubcategory(String category, String subcategory);
    
    // Find by study program and category
    List<ModuleDetails> findByStudyProgramIdAndCategory(Integer studyProgramId, String category);
    
    // Find by study program and multiple categories
    @Query("SELECT md FROM ModuleDetails md WHERE md.studyProgramId = :studyProgramId AND md.category IN :categories")
    List<ModuleDetails> findByStudyProgramIdAndCategoryIn(@Param("studyProgramId") Integer studyProgramId, @Param("categories") List<String> categories);
    
    // Search by name or module ID
    @Query("SELECT md FROM ModuleDetails md WHERE md.studyProgramId = :studyProgramId AND (LOWER(md.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(md.moduleId) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<ModuleDetails> searchByNameOrModuleId(@Param("studyProgramId") Integer studyProgramId, @Param("searchTerm") String searchTerm);
    
    // Find by occurrence (semester availability)
    List<ModuleDetails> findByStudyProgramIdAndOccurrence(Integer studyProgramId, String occurrence);
    
    // Find by credits range
    @Query("SELECT md FROM ModuleDetails md WHERE md.studyProgramId = :studyProgramId AND md.credits BETWEEN :minCredits AND :maxCredits")
    List<ModuleDetails> findByStudyProgramIdAndCreditsBetween(@Param("studyProgramId") Integer studyProgramId, @Param("minCredits") Integer minCredits, @Param("maxCredits") Integer maxCredits);
    
    // Get all distinct categories for a study program
    @Query("SELECT DISTINCT md.category FROM ModuleDetails md WHERE md.studyProgramId = :studyProgramId ORDER BY md.category")
    List<String> findDistinctCategoriesByStudyProgramId(@Param("studyProgramId") Integer studyProgramId);
    
    // Get all distinct subcategories for a study program and category
    @Query("SELECT DISTINCT md.subcategory FROM ModuleDetails md WHERE md.studyProgramId = :studyProgramId AND md.category = :category ORDER BY md.subcategory")
    List<String> findDistinctSubcategoriesByStudyProgramIdAndCategory(@Param("studyProgramId") Integer studyProgramId, @Param("category") String category);

    @Query("SELECT DISTINCT md.language FROM ModuleDetails md WHERE md.studyProgramId = :studyProgramId AND md.language IS NOT NULL ORDER BY md.language")
    List<String> findDistinctLanguagesByStudyProgramId(@Param("studyProgramId") Integer studyProgramId);
    
    @Query("SELECT DISTINCT md.occurrence FROM ModuleDetails md WHERE md.studyProgramId = :studyProgramId AND md.occurrence IS NOT NULL ORDER BY md.occurrence")
    List<String> findDistinctOccurrencesByStudyProgramId(@Param("studyProgramId") Integer studyProgramId);
    
    @Query("SELECT md.category, COUNT(md), SUM(md.credits) FROM ModuleDetails md WHERE md.studyProgramId = :studyProgramId GROUP BY md.category ORDER BY md.category")
    List<Object[]> findCategoryStatisticsByStudyProgramId(@Param("studyProgramId") Integer studyProgramId);
    
    @Query("SELECT COUNT(md) FROM ModuleDetails md WHERE md.studyProgramId = :studyProgramId")
    Integer countByStudyProgramId(@Param("studyProgramId") Integer studyProgramId);
    
    @Query("SELECT SUM(md.credits) FROM ModuleDetails md WHERE md.studyProgramId = :studyProgramId")
    Integer sumCreditsByStudyProgramId(@Param("studyProgramId") Integer studyProgramId);
    
    // Enhanced search with multiple filters
    @Query("SELECT md FROM ModuleDetails md WHERE md.studyProgramId = :studyProgramId " +
           "AND (:category IS NULL OR md.category = :category) " +
           "AND (:subcategory IS NULL OR md.subcategory = :subcategory) " +
           "AND (:language IS NULL OR md.language = :language) " +
           "AND (:occurrence IS NULL OR md.occurrence = :occurrence) " +
           "AND (:minCredits IS NULL OR md.credits >= :minCredits) " +
           "AND (:maxCredits IS NULL OR md.credits <= :maxCredits) " +
           "AND (:searchTerm IS NULL OR LOWER(md.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(md.moduleId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(md.responsible) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<ModuleDetails> findWithFilters(@Param("studyProgramId") Integer studyProgramId,
                                       @Param("category") String category,
                                       @Param("subcategory") String subcategory,
                                       @Param("language") String language,
                                       @Param("occurrence") String occurrence,
                                       @Param("minCredits") Integer minCredits,
                                       @Param("maxCredits") Integer maxCredits,
                                       @Param("searchTerm") String searchTerm);
    
    // Semester-based filtering
    @Query("SELECT md FROM ModuleDetails md WHERE md.studyProgramId = :studyProgramId AND " +
           "(LOWER(md.occurrence) LIKE LOWER(CONCAT('%', :semester, '%')) OR " +
           "LOWER(md.occurrence) LIKE '%both%' OR " +
           "LOWER(md.occurrence) LIKE '%winter/summer%' OR " +
           "LOWER(md.occurrence) LIKE '%summer/winter%')")
    List<ModuleDetails> findBySemesterAvailability(@Param("studyProgramId") Integer studyProgramId, @Param("semester") String semester);

}