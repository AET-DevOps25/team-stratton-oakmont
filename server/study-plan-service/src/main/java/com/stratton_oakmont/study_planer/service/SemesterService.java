package com.stratton_oakmont.study_planer.service;

import com.stratton_oakmont.study_planer.model.Semester;
import com.stratton_oakmont.study_planer.model.StudyPlan;
import com.stratton_oakmont.study_planer.repository.SemesterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SemesterService {

    private final SemesterRepository semesterRepository;

    @Autowired
    public SemesterService(SemesterRepository semesterRepository) {
        this.semesterRepository = semesterRepository;
    }

    // CREATE operations
    public Semester createSemester(Semester semester) {
        return semesterRepository.save(semester);
    }

    public Semester createSemesterForStudyPlan(StudyPlan studyPlan, String name) {
        // Get the next semester order
        Integer nextOrder = getNextSemesterOrder(studyPlan.getId());
        
        Semester semester = new Semester(name, studyPlan, nextOrder);
        return createSemester(semester);
    }

    public Semester createSemesterForStudyPlan(StudyPlan studyPlan, String name, Integer order) {
        Semester semester = new Semester(name, studyPlan, order);
        return createSemester(semester);
    }

    // READ operations
    public List<Semester> getAllSemesters() {
        return semesterRepository.findAll();
    }

    public Semester getSemesterById(Long id) {
        return semesterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Semester not found with id: " + id));
    }

    public List<Semester> getSemestersByStudyPlanId(Long studyPlanId) {
        return semesterRepository.findByStudyPlanIdOrderBySemesterOrder(studyPlanId);
    }

    public List<Semester> getSemestersByStudyPlan(StudyPlan studyPlan) {
        return semesterRepository.findByStudyPlanOrderBySemesterOrder(studyPlan);
    }

    public List<Semester> searchSemestersByName(String keyword) {
        return semesterRepository.findByNameContainingIgnoreCase(keyword);
    }

    public Semester getSemesterByStudyPlanAndOrder(Long studyPlanId, Integer semesterOrder) {
        return semesterRepository.findByStudyPlanIdAndSemesterOrder(studyPlanId, semesterOrder);
    }

    // UPDATE operations
    public Semester updateSemester(Long id, Semester updatedSemester) {
        Semester existingSemester = getSemesterById(id);
        
        existingSemester.setName(updatedSemester.getName());
        if (updatedSemester.getSemesterOrder() != null) {
            existingSemester.setSemesterOrder(updatedSemester.getSemesterOrder());
        }
        
        return semesterRepository.save(existingSemester);
    }

    public Semester renameSemester(Long id, String newName) {
        Semester semester = getSemesterById(id);
        semester.setName(newName);
        return semesterRepository.save(semester);
    }

    public Semester updateSemesterOrder(Long id, Integer newOrder) {
        Semester semester = getSemesterById(id);
        semester.setSemesterOrder(newOrder);
        return semesterRepository.save(semester);
    }

    // DELETE operations
    public void deleteSemester(Long id) {
        Semester semester = getSemesterById(id);
        semesterRepository.delete(semester);
    }

    // UTILITY methods
    public long countSemestersByStudyPlanId(Long studyPlanId) {
        return semesterRepository.countByStudyPlanId(studyPlanId);
    }

    public Integer getNextSemesterOrder(Long studyPlanId) {
        Integer maxOrder = semesterRepository.findMaxSemesterOrderByStudyPlanId(studyPlanId);
        return maxOrder + 1;
    }

    public boolean semesterOrderExists(Long studyPlanId, Integer semesterOrder) {
        return semesterRepository.existsByStudyPlanIdAndSemesterOrder(studyPlanId, semesterOrder);
    }

    // Reorder semesters - useful for drag and drop functionality
    public void reorderSemesters(Long studyPlanId, List<Long> semesterIds) {
        for (int i = 0; i < semesterIds.size(); i++) {
            Long semesterId = semesterIds.get(i);
            Semester semester = getSemesterById(semesterId);
            
            // Verify this semester belongs to the study plan
            if (!semester.getStudyPlan().getId().equals(studyPlanId)) {
                throw new IllegalArgumentException("Semester " + semesterId + " does not belong to study plan " + studyPlanId);
            }
            
            semester.setSemesterOrder(i + 1);
            semesterRepository.save(semester);
        }
    }
}
