package com.stratton_oakmont.study_planer.controller;

import com.stratton_oakmont.study_planer.dto.StudyProgramDto;
import com.stratton_oakmont.study_planer.entity.studydata.StudyProgram;
import com.stratton_oakmont.study_planer.service.StudyProgramService;
import com.stratton_oakmont.study_planer.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudyProgramControllerTest {

    @Mock
    private StudyProgramService studyProgramService;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private StudyProgramController studyProgramController;

    private StudyProgram testStudyProgram;
    private StudyProgramDto testStudyProgramDto;
    private String validToken;
    private String authHeader;

    @BeforeEach
    void setUp() {
        // Setup test data
        testStudyProgram = new StudyProgram("M.Sc. Information Systems", 120, 4, "Master");
        testStudyProgram.setId(1L);
        testStudyProgram.setDescription("Advanced Information Systems program");
        testStudyProgram.setCreatedDate(LocalDateTime.now());
        testStudyProgram.setLastModified(LocalDateTime.now());

        testStudyProgramDto = new StudyProgramDto();
        testStudyProgramDto.setId(1L);
        testStudyProgramDto.setName("M.Sc. Information Systems");
        testStudyProgramDto.setTotalCredits(120);
        testStudyProgramDto.setSemesterDuration(4);
        testStudyProgramDto.setDegreeType("Master");
        testStudyProgramDto.setDescription("Advanced Information Systems program");

        validToken = "valid.jwt.token";
        authHeader = "Bearer " + validToken;
    }

    @Test
    void getAllStudyPrograms_ShouldReturnAllPrograms() {
        // Given
        List<StudyProgram> programs = Arrays.asList(
            testStudyProgram,
            new StudyProgram("B.Sc. Computer Science", 180, 6, "Bachelor")
        );
        when(studyProgramService.getAllStudyPrograms()).thenReturn(programs);

        // When
        ResponseEntity<?> response = studyProgramController.getAllStudyPrograms();

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(studyProgramService).getAllStudyPrograms();
    }

    @Test
    void getStudyProgramById_ExistingId_ShouldReturnProgram() {
        // Given
        when(studyProgramService.getStudyProgramById(1L)).thenReturn(testStudyProgram);

        // When
        ResponseEntity<?> response = studyProgramController.getStudyProgramById(1L);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(studyProgramService).getStudyProgramById(1L);
    }

    // @Test
    // void getStudyProgramById_NonExistentId_ShouldReturnNotFound() {
    //     // Given
    //     when(studyProgramService.getStudyProgramById(999L))
    //         .thenThrow(new RuntimeException("Study program not found"));

    //     // When
    //     ResponseEntity<?> response = studyProgramController.getStudyProgramById(999L);

    //     // Then
    //     assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        
    //     @SuppressWarnings("unchecked")
    //     Map<String, String> responseBody = (Map<String, String>) response.getBody();
    //     assertEquals("STUDY_PROGRAM_NOT_FOUND", responseBody.get("error"));
    // }
}