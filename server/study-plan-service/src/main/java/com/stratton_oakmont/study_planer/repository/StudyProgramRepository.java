package com.stratton_oakmont.study_planer.repository.studydata;

import com.stratton_oakmont.study_planer.entity.studydata.StudyProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyProgramRepository extends JpaRepository<StudyProgram, Long> {
    
    // Basic read operations
    Optional<StudyProgram> findByDegree(String degree);
    List<StudyProgram> findByDegreeContainingIgnoreCase(String keyword);
    List<StudyProgram> findByFieldOfStudiesContainingIgnoreCase(String keyword);
}