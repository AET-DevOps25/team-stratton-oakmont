package com.stratton_oakmont.program_catalog_service.repository;

import com.stratton_oakmont.program_catalog_service.entity.ModuleDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleDetailsRepository extends JpaRepository<ModuleDetails, String> {
    
    // Find by name containing (case insensitive)
    List<ModuleDetails> findByNameContainingIgnoreCase(String name);
    
    // Find by language
    List<ModuleDetails> findByLanguage(String language);
    
    // Find by credits
    List<ModuleDetails> findByCredits(String credits);
    
    // Find by occurrence
    List<ModuleDetails> findByOccurrence(String occurrence);
    
    // Find by module level
    List<ModuleDetails> findByModuleLevel(String moduleLevel);
    
    // Custom query to search across multiple fields
    @Query("SELECT m FROM ModuleDetails m WHERE " +
           "LOWER(m.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.responsible) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<ModuleDetails> searchModules(@Param("searchTerm") String searchTerm);
}