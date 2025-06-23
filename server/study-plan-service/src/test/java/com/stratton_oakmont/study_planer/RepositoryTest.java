package com.stratton_oakmont.study_planer.repository;

import com.stratton_oakmont.study_planer.entity.StudyPlan;
import com.stratton_oakmont.study_planer.entity.StudyProgram;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class RepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private StudyProgramRepository studyProgramRepository;

    @Autowired
    private StudyPlanRepository studyPlanRepository;

    private StudyProgram masterProgram;
    private StudyProgram bachelorProgram;
    private StudyPlan plan1;
    private StudyPlan plan2;

    @BeforeEach
    void setUp() {
        // Create test study programs
        masterProgram = new StudyProgram("M.Sc. Information Systems", 120, 4, "Master");
        masterProgram.setDescription("Advanced Information Systems program");
        masterProgram = entityManager.persistAndFlush(masterProgram);

        bachelorProgram = new StudyProgram("B.Sc. Computer Science", 180, 6, "Bachelor");
        bachelorProgram.setDescription("Fundamental Computer Science program");
        bachelorProgram = entityManager.persistAndFlush(bachelorProgram);

        // Create test study plans
        plan1 = new StudyPlan("My Master Plan", 123L, masterProgram);
        plan1 = entityManager.persistAndFlush(plan1);

        plan2 = new StudyPlan("Alternative Plan", 123L, masterProgram);
        plan2.setIsActive(false);
        plan2 = entityManager.persistAndFlush(plan2);

        // Clear persistence context
        entityManager.clear();
    }

    // StudyProgramRepository Tests
    @Test
    void testStudyProgramRepository_findByName() {
        // When
        Optional<StudyProgram> found = studyProgramRepository.findByName("M.Sc. Information Systems");

        // Then
        assertTrue(found.isPresent());
        assertEquals("M.Sc. Information Systems", found.get().getName());
        assertEquals("Master", found.get().getDegreeType());
    }

    @Test
    void testStudyProgramRepository_findByDegreeType() {
        // When
        List<StudyProgram> masterPrograms = studyProgramRepository.findByDegreeType("Master");
        List<StudyProgram> bachelorPrograms = studyProgramRepository.findByDegreeType("Bachelor");

        // Then
        assertEquals(1, masterPrograms.size());
        assertEquals(1, bachelorPrograms.size());
        assertEquals("M.Sc. Information Systems", masterPrograms.get(0).getName());
        assertEquals("B.Sc. Computer Science", bachelorPrograms.get(0).getName());
    }

    @Test
    void testStudyProgramRepository_findByNameContainingIgnoreCase() {
        // When
        List<StudyProgram> foundPrograms = studyProgramRepository.findByNameContainingIgnoreCase("information");

        // Then
        assertEquals(1, foundPrograms.size());
        assertEquals("M.Sc. Information Systems", foundPrograms.get(0).getName());
    }

    @Test
    void testStudyProgramRepository_findByDescriptionContainingIgnoreCase() {
        // When
        List<StudyProgram> foundPrograms = studyProgramRepository.findByDescriptionContainingIgnoreCase("advanced");

        // Then
        assertEquals(1, foundPrograms.size());
        assertEquals("M.Sc. Information Systems", foundPrograms.get(0).getName());
    }

    @Test
    void testStudyProgramRepository_countByDegreeType() {
        // When
        long masterCount = studyProgramRepository.countByDegreeType("Master");
        long bachelorCount = studyProgramRepository.countByDegreeType("Bachelor");

        // Then
        assertEquals(1, masterCount);
        assertEquals(1, bachelorCount);
    }

    @Test
    void testStudyProgramRepository_existsByNameAndDegreeType() {
        // When & Then
        assertTrue(studyProgramRepository.existsByNameAndDegreeType("M.Sc. Information Systems", "Master"));
        assertFalse(studyProgramRepository.existsByNameAndDegreeType("M.Sc. Information Systems", "Bachelor"));
        assertFalse(studyProgramRepository.existsByNameAndDegreeType("Non-existent Program", "Master"));
    }

    // StudyPlanRepository Tests
    @Test
    void testStudyPlanRepository_findByUserId() {
        // When
        List<StudyPlan> userPlans = studyPlanRepository.findByUserId(123L);

        // Then
        assertEquals(2, userPlans.size());
    }

    @Test
    void testStudyPlanRepository_findByUserIdAndIsActiveTrue() {
        // When
        List<StudyPlan> activeUserPlans = studyPlanRepository.findByUserIdAndIsActiveTrue(123L);

        // Then
        assertEquals(1, activeUserPlans.size());
        assertEquals("My Master Plan", activeUserPlans.get(0).getName());
        assertTrue(activeUserPlans.get(0).getIsActive());
    }

    @Test
    void testStudyPlanRepository_findByUserIdAndStudyProgram() {
        // When
        List<StudyPlan> userMasterPlans = studyPlanRepository.findByUserIdAndStudyProgram(123L, masterProgram);

        // Then
        assertEquals(2, userMasterPlans.size());
    }

    @Test
    void testStudyPlanRepository_findByStudyProgram() {
        // When
        List<StudyPlan> masterPlans = studyPlanRepository.findByStudyProgram(masterProgram);

        // Then
        assertEquals(2, masterPlans.size());
    }

    @Test
    void testStudyPlanRepository_findByNameContainingIgnoreCase() {
        // When
        List<StudyPlan> foundPlans = studyPlanRepository.findByNameContainingIgnoreCase("master");

        // Then
        assertEquals(1, foundPlans.size());
        assertEquals("My Master Plan", foundPlans.get(0).getName());
    }

    @Test
    void testStudyPlanRepository_findByCreatedDateAfter() {
        // Given
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);

        // When
        List<StudyPlan> recentPlans = studyPlanRepository.findByCreatedDateAfter(oneDayAgo);

        // Then
        assertEquals(2, recentPlans.size());
    }

    @Test
    void testStudyPlanRepository_findByUserIdOrderByLastModifiedDesc() {
        // When
        List<StudyPlan> orderedPlans = studyPlanRepository.findByUserIdOrderByLastModifiedDesc(123L);

        // Then
        assertEquals(2, orderedPlans.size());
        // Most recently modified should be first
        assertTrue(orderedPlans.get(0).getLastModified().isAfter(orderedPlans.get(1).getLastModified()) ||
                   orderedPlans.get(0).getLastModified().equals(orderedPlans.get(1).getLastModified()));
    }

    @Test
    void testStudyPlanRepository_countByUserIdAndIsActiveTrue() {
        // When
        long activeCount = studyPlanRepository.countByUserIdAndIsActiveTrue(123L);

        // Then
        assertEquals(1, activeCount);
    }

    @Test
    void testStudyPlanRepository_countByStudyProgram() {
        // When
        long masterPlanCount = studyPlanRepository.countByStudyProgram(masterProgram);
        long bachelorPlanCount = studyPlanRepository.countByStudyProgram(bachelorProgram);

        // Then
        assertEquals(2, masterPlanCount);
        assertEquals(0, bachelorPlanCount);
    }

    @Test
    void testStudyPlanRepository_existsByUserIdAndIsActiveTrue() {
        // When & Then
        assertTrue(studyPlanRepository.existsByUserIdAndIsActiveTrue(123L));
        assertFalse(studyPlanRepository.existsByUserIdAndIsActiveTrue(999L));
    }

    @Test
    void testStudyPlanRepository_findByUserIdAndStudyProgramName() {
        // When
        List<StudyPlan> userMasterPlans = studyPlanRepository.findByUserIdAndStudyProgramName(123L, "M.Sc. Information Systems");

        // Then
        assertEquals(2, userMasterPlans.size());
    }

    @Test
    void testRepositoryIntegration_basicCrudOperations() {
        // Test Create
        StudyProgram newProgram = new StudyProgram("M.Sc. Data Science", 120, 4, "Master");
        StudyProgram savedProgram = studyProgramRepository.save(newProgram);
        assertNotNull(savedProgram.getId());

        // Test Read
        Optional<StudyProgram> foundProgram = studyProgramRepository.findById(savedProgram.getId());
        assertTrue(foundProgram.isPresent());
        assertEquals("M.Sc. Data Science", foundProgram.get().getName());

        // Test Update
        foundProgram.get().setDescription("Updated description");
        StudyProgram updatedProgram = studyProgramRepository.save(foundProgram.get());
        assertEquals("Updated description", updatedProgram.getDescription());

        // Test Delete
        studyProgramRepository.delete(updatedProgram);
        assertFalse(studyProgramRepository.findById(savedProgram.getId()).isPresent());
    }
}