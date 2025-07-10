package com.stratton_oakmont.program_catalog_service.service;

import com.stratton_oakmont.program_catalog_service.entity.ModuleDetails;
import com.stratton_oakmont.program_catalog_service.repository.ModuleDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ModuleDetailsService {
    
    private final ModuleDetailsRepository moduleDetailsRepository;
    
    @Autowired
    public ModuleDetailsService(ModuleDetailsRepository moduleDetailsRepository) {
        this.moduleDetailsRepository = moduleDetailsRepository;
    }
    
    // Get all modules
    public List<ModuleDetails> getAllModules() {
        return moduleDetailsRepository.findAll();
    }
    
    // Get module by ID
    public Optional<ModuleDetails> getModuleById(String id) {
        return moduleDetailsRepository.findById(id);
    }
    
    // Search modules by name
    public List<ModuleDetails> searchModulesByName(String name) {
        return moduleDetailsRepository.findByNameContainingIgnoreCase(name);
    }
    
    // Filter modules by language
    public List<ModuleDetails> getModulesByLanguage(String language) {
        return moduleDetailsRepository.findByLanguage(language);
    }
    
    // Filter modules by credits
    public List<ModuleDetails> getModulesByCredits(String credits) {
        return moduleDetailsRepository.findByCredits(credits);
    }
    
    // Filter modules by occurrence
    public List<ModuleDetails> getModulesByOccurrence(String occurrence) {
        return moduleDetailsRepository.findByOccurrence(occurrence);
    }
    
    // Filter modules by module level
    public List<ModuleDetails> getModulesByModuleLevel(String moduleLevel) {
        return moduleDetailsRepository.findByModuleLevel(moduleLevel);
    }
    
    // Search across multiple fields
    public List<ModuleDetails> searchModules(String searchTerm) {
        return moduleDetailsRepository.searchModules(searchTerm);
    }
}