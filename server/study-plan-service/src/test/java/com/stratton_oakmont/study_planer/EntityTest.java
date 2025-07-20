package com.stratton_oakmont.study_planer;

import com.stratton_oakmont.study_planer.model.StudyPlan;

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
    void testStudyPlanEntity() {
        // Given
        StudyPlan plan = new StudyPlan("My Study Plan", 123L, 1L);
        plan.setStudyProgramName("M.Sc. Information Systems");

        // When
        StudyPlan savedPlan = entityManager.persistAndFlush(plan);

        // Then
        assertNotNull(savedPlan.getId());
        assertEquals("My Study Plan", savedPlan.getName());
        assertEquals(123L, savedPlan.getUserId());
        assertEquals(1L, savedPlan.getStudyProgramId());
        assertEquals("M.Sc. Information Systems", savedPlan.getStudyProgramName());
        assertTrue(savedPlan.getIsActive());
        assertNotNull(savedPlan.getCreateDate());
    }

    @Test
    void testStudyPlanWithoutStudyProgram() {
        // Given - test a study plan without a study program
        StudyPlan plan = new StudyPlan("Free Form Plan", 456L);

        // When
        StudyPlan savedPlan = entityManager.persistAndFlush(plan);

        // Then
        assertNotNull(savedPlan.getId());
        assertEquals("Free Form Plan", savedPlan.getName());
        assertEquals(456L, savedPlan.getUserId());
        assertNull(savedPlan.getStudyProgramId());
        assertNull(savedPlan.getStudyProgramName());
        assertTrue(savedPlan.getIsActive());
        assertNotNull(savedPlan.getCreateDate());
    }
}