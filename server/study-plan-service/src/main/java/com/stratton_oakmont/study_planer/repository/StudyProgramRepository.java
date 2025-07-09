package com.stratton_oakmont.study_planer.repository.studydata;

import com.stratton_oakmont.study_planer.entity.studydata.StudyProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudyProgramRepository extends JpaRepository<StudyProgram, Long> {
}