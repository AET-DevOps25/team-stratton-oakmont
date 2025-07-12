package com.stratton_oakmont.program_catalog_service.repository;

import com.stratton_oakmont.program_catalog_service.model.StudyProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyProgramRepository extends JpaRepository<StudyProgram, Long> {
    
    Optional<StudyProgram> findByDegree(String degree);
    
    List<StudyProgram> findByCurriculum(String curriculum);
    
    List<StudyProgram> findByFieldOfStudies(String fieldOfStudies);
    
    List<StudyProgram> findByDegreeContainingIgnoreCase(String degree);
    
    List<StudyProgram> findByCurriculumContainingIgnoreCase(String curriculum);
}
