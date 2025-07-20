package com.stratton_oakmont.study_planer.service;

import com.stratton_oakmont.study_planer.model.StudyPlan;
import com.stratton_oakmont.study_planer.model.Semester;
import com.stratton_oakmont.study_planer.repository.SemesterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

/**
 * Service to handle migration and persistence of study plan data.
 * This service helps transition from JSON-based storage to database entities
 * without affecting JWT security in other services.
 */
@Service
public class StudyPlanMigrationService {
    
    private static final Logger logger = LoggerFactory.getLogger(StudyPlanMigrationService.class);
    
    @Autowired
    private SemesterRepository semesterRepository;
    
    /**
     * Migrate study plan data if needed - simplified version
     */
    @Transactional
    public void migratePlanDataIfNeeded(StudyPlan studyPlan) {
        try {
            // Check if this study plan already has semesters in the database
            List<Semester> existingSemesters = semesterRepository.findByStudyPlanIdOrderBySemesterOrder(studyPlan.getId());
            
            if (!existingSemesters.isEmpty()) {
                logger.debug("Study plan {} already has {} semesters in database, skipping migration", 
                    studyPlan.getId(), existingSemesters.size());
                return;
            }
            
            logger.debug("No existing semesters found for study plan {}", studyPlan.getId());
        } catch (Exception e) {
            logger.warn("Failed to check migration status for study plan {}: {}", studyPlan.getId(), e.getMessage());
        }
    }
    
    /**
     * Ensure study plan has basic semester structure
     */
    @Transactional
    public void ensureBasicSemesterStructure(StudyPlan studyPlan) {
        try {
            List<Semester> existingSemesters = semesterRepository.findByStudyPlanIdOrderBySemesterOrder(studyPlan.getId());
            
            if (existingSemesters.isEmpty()) {
                logger.info("Creating default semester structure for study plan {}", studyPlan.getId());
                
                // Create a default first semester
                Semester defaultSemester = new Semester();
                defaultSemester.setStudyPlan(studyPlan);
                defaultSemester.setName("Winter " + java.time.LocalDate.now().getYear());
                defaultSemester.setSemesterOrder(1);
                defaultSemester.setWinterOrSummer("WINTER");
                
                semesterRepository.save(defaultSemester);
                logger.info("Created default semester for study plan {}", studyPlan.getId());
            }
        } catch (Exception e) {
            logger.warn("Failed to ensure basic semester structure for study plan {}: {}", 
                studyPlan.getId(), e.getMessage());
        }
    }
}
