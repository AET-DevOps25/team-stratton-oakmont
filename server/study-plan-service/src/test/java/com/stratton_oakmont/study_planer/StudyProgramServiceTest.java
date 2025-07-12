package com.stratton_oakmont.study_planer.service;

import com.stratton_oakmont.study_planer.model.StudyProgram;
import com.stratton_oakmont.study_planer.exception.StudyProgramNotFoundException;
import com.stratton_oakmont.study_planer.repository.studydata.StudyProgramRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudyProgramServiceTest {

    @Mock
    private StudyProgramRepository studyProgramRepository;

    @InjectMocks
    private StudyProgramService studyProgramService;

    private StudyProgram testProgram;

    @BeforeEach
    void setUp() {
        testProgram = new StudyProgram("M.Sc. Information Systems", 120, 4, "Master");
        testProgram.setId(1L);
        testProgram.setDescription("Test program description");
    }

    @Test
    void createStudyProgram_ValidProgram_ShouldReturnSavedProgram() {
        // Given
        when(studyProgramRepository.existsByNameAndDegreeType(testProgram.getName(), testProgram.getDegreeType()))
                .thenReturn(false);
        when(studyProgramRepository.save(any(StudyProgram.class))).thenReturn(testProgram);

        // When
        StudyProgram result = studyProgramService.createStudyProgram(testProgram);

        // Then
        assertNotNull(result);
        assertEquals(testProgram.getName(), result.getName());
        assertEquals(testProgram.getDegreeType(), result.getDegreeType());
        verify(studyProgramRepository).save(testProgram);
    }

    @Test
    void createStudyProgram_DuplicateProgram_ShouldThrowException() {
        // Given
        when(studyProgramRepository.existsByNameAndDegreeType(testProgram.getName(), testProgram.getDegreeType()))
                .thenReturn(true);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> 
            studyProgramService.createStudyProgram(testProgram));
        verify(studyProgramRepository, never()).save(any());
    }

    @Test
    void getStudyProgramById_ExistingId_ShouldReturnProgram() {
        // Given
        when(studyProgramRepository.findById(1L)).thenReturn(Optional.of(testProgram));

        // When
        StudyProgram result = studyProgramService.getStudyProgramById(1L);

        // Then
        assertNotNull(result);
        assertEquals(testProgram.getId(), result.getId());
        assertEquals(testProgram.getName(), result.getName());
    }

    @Test
    void getStudyProgramById_NonExistentId_ShouldThrowException() {
        // Given
        when(studyProgramRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(StudyProgramNotFoundException.class, () -> 
            studyProgramService.getStudyProgramById(999L));
    }

    @Test
    void getAllStudyPrograms_ShouldReturnAllPrograms() {
        // Given
        StudyProgram program2 = new StudyProgram("B.Sc. Computer Science", 180, 6, "Bachelor");
        List<StudyProgram> programs = Arrays.asList(testProgram, program2);
        when(studyProgramRepository.findAll()).thenReturn(programs);

        // When
        List<StudyProgram> result = studyProgramService.getAllStudyPrograms();

        // Then
        assertEquals(2, result.size());
        assertTrue(result.contains(testProgram));
        assertTrue(result.contains(program2));
    }

    @Test
    void updateStudyProgram_ValidUpdate_ShouldReturnUpdatedProgram() {
        // Given
        StudyProgram updatedProgram = new StudyProgram("Updated Name", 130, 5, "Master");
        when(studyProgramRepository.findById(1L)).thenReturn(Optional.of(testProgram));
        when(studyProgramRepository.save(any(StudyProgram.class))).thenReturn(testProgram);

        // When
        StudyProgram result = studyProgramService.updateStudyProgram(1L, updatedProgram);

        // Then
        assertNotNull(result);
        verify(studyProgramRepository).save(testProgram);
    }

    @Test
    void deleteStudyProgram_ExistingProgramWithoutPlans_ShouldDelete() {
        // Given
        testProgram.getStudyPlans().clear(); // No associated plans
        when(studyProgramRepository.findById(1L)).thenReturn(Optional.of(testProgram));

        // When
        studyProgramService.deleteStudyProgram(1L);

        // Then
        verify(studyProgramRepository).delete(testProgram);
    }

    @Test
    void validateStudyProgram_InvalidProgram_ShouldThrowException() {
        // Given
        StudyProgram invalidProgram = new StudyProgram();
        invalidProgram.setName("");
        invalidProgram.setTotalCredits(-10);
        invalidProgram.setSemesterDuration(0);
        invalidProgram.setDegreeType("Invalid");

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> 
            studyProgramService.createStudyProgram(invalidProgram));
    }
}