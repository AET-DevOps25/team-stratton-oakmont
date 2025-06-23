package com.stratton_oakmont.study_planer.entity;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class EntityTest {

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void testStudyProgramEntity() {
        // Given
        StudyProgram program = new StudyProgram(
            "M.Sc. Information Systems", 
            120, 
            4, 
            "Master"
        );
        program.setDescription("Master's program in Information Systems");

        // When
        StudyProgram savedProgram = entityManager.persistAndFlush(program);

        // Then
        assertNotNull(savedProgram.getId());
        assertEquals("M.Sc. Information Systems", savedProgram.getName());
        assertEquals(120, savedProgram.getTotalCredits());
        assertEquals(4, savedProgram.getSemesterDuration());
        assertEquals("Master", savedProgram.getDegreeType());
        assertNotNull(savedProgram.getCreatedDate());
        assertNotNull(savedProgram.getLastModified());
    }

    @Test
    void testStudyPlanEntity() {
        // Given
        StudyProgram program = new StudyProgram(
            "M.Sc. Information Systems", 
            120, 
            4, 
            "Master"
        );
        StudyProgram savedProgram = entityManager.persistAndFlush(program);

        StudyPlan plan = new StudyPlan("My Study Plan", 123L, savedProgram);

        // When
        StudyPlan savedPlan = entityManager.persistAndFlush(plan);

        // Then
        assertNotNull(savedPlan.getId());
        assertEquals("My Study Plan", savedPlan.getName());
        assertEquals(123L, savedPlan.getUserId());
        assertEquals(savedProgram.getId(), savedPlan.getStudyProgram().getId());
        assertTrue(savedPlan.getIsActive());
        assertNotNull(savedPlan.getCreatedDate());
        assertNotNull(savedPlan.getLastModified());
    }

    @Test
    void testStudyProgramAndStudyPlanRelationship() {
        // Given
        StudyProgram program = new StudyProgram(
            "M.Sc. Information Systems", 
            120, 
            4, 
            "Master"
        );
        StudyProgram savedProgram = entityManager.persistAndFlush(program);

        StudyPlan plan1 = new StudyPlan("Plan 1", 123L, savedProgram);
        StudyPlan plan2 = new StudyPlan("Plan 2", 456L, savedProgram);
        
        entityManager.persistAndFlush(plan1);
        entityManager.persistAndFlush(plan2);
        
        // Clear to ensure we're fetching from database
        entityManager.clear();

        // When
        StudyProgram foundProgram = entityManager.find(StudyProgram.class, savedProgram.getId());

        // Then
        assertNotNull(foundProgram);
        assertEquals(2, foundProgram.getStudyPlans().size());
    }
}