package com.stratton_oakmont.study_planer.service;

import com.stratton_oakmont.study_planer.model.Semester;
import com.stratton_oakmont.study_planer.model.SemesterCourse;
import com.stratton_oakmont.study_planer.repository.SemesterCourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SemesterCourseService {

    private final SemesterCourseRepository semesterCourseRepository;

    @Autowired
    public SemesterCourseService(SemesterCourseRepository semesterCourseRepository) {
        this.semesterCourseRepository = semesterCourseRepository;
    }

    // CREATE operations
    public SemesterCourse addCourseToSemester(Semester semester, String courseId) {
        // Check if course already exists in this semester
        Optional<SemesterCourse> existing = semesterCourseRepository.findBySemesterIdAndCourseId(
            semester.getId(), courseId);
        
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Course " + courseId + " already exists in semester " + semester.getId());
        }

        // Get next course order
        Integer nextOrder = getNextCourseOrder(semester.getId());
        
        SemesterCourse semesterCourse = new SemesterCourse(semester, courseId, nextOrder);
        return semesterCourseRepository.save(semesterCourse);
    }

    public SemesterCourse addCourseToSemester(Semester semester, String courseId, Integer courseOrder) {
        // Check if course already exists in this semester
        Optional<SemesterCourse> existing = semesterCourseRepository.findBySemesterIdAndCourseId(
            semester.getId(), courseId);
        
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Course " + courseId + " already exists in semester " + semester.getId());
        }

        SemesterCourse semesterCourse = new SemesterCourse(semester, courseId, courseOrder);
        return semesterCourseRepository.save(semesterCourse);
    }

    // READ operations
    public List<SemesterCourse> getAllSemesterCourses() {
        return semesterCourseRepository.findAll();
    }

    public SemesterCourse getSemesterCourseById(Long id) {
        return semesterCourseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Semester course not found with id: " + id));
    }

    public List<SemesterCourse> getCoursesBySemesterId(Long semesterId) {
        return semesterCourseRepository.findBySemesterIdOrderByCourseOrder(semesterId);
    }

    public List<SemesterCourse> getCoursesBySemester(Semester semester) {
        return semesterCourseRepository.findBySemesterOrderByCourseOrder(semester);
    }

    public Optional<SemesterCourse> getCourseInSemester(Long semesterId, String courseId) {
        return semesterCourseRepository.findBySemesterIdAndCourseId(semesterId, courseId);
    }

    public List<SemesterCourse> getAllCoursesForStudyPlan(Long studyPlanId) {
        return semesterCourseRepository.findByStudyPlanId(studyPlanId);
    }

    public List<SemesterCourse> getCompletedCoursesBySemester(Long semesterId) {
        return semesterCourseRepository.findBySemesterIdAndIsCompletedTrue(semesterId);
    }

    public List<SemesterCourse> getUncompletedCoursesBySemester(Long semesterId) {
        return semesterCourseRepository.findBySemesterIdAndIsCompletedFalse(semesterId);
    }

    public List<SemesterCourse> getCompletedCoursesForStudyPlan(Long studyPlanId) {
        return semesterCourseRepository.findCompletedCoursesByStudyPlanId(studyPlanId);
    }

    // UPDATE operations
    public SemesterCourse markCourseCompleted(Long semesterCourseId) {
        SemesterCourse semesterCourse = getSemesterCourseById(semesterCourseId);
        semesterCourse.setIsCompleted(true);

        return semesterCourseRepository.save(semesterCourse);
    }

    public SemesterCourse markCourseUncompleted(Long semesterCourseId) {
        SemesterCourse semesterCourse = getSemesterCourseById(semesterCourseId);
        semesterCourse.setIsCompleted(false);
        semesterCourse.setCompletionDate(null);

        return semesterCourseRepository.save(semesterCourse);
    }

    public SemesterCourse toggleCourseCompletion(Long semesterCourseId) {
        SemesterCourse semesterCourse = getSemesterCourseById(semesterCourseId);
        semesterCourse.setIsCompleted(!semesterCourse.getIsCompleted());

        return semesterCourseRepository.save(semesterCourse);
    }

    public SemesterCourse updateCourseOrder(Long semesterCourseId, Integer newOrder) {
        SemesterCourse semesterCourse = getSemesterCourseById(semesterCourseId);
        semesterCourse.setCourseOrder(newOrder);

        return semesterCourseRepository.save(semesterCourse);
    }

    // Move course between semesters
    public SemesterCourse moveCourseToSemester(Long semesterCourseId, Semester targetSemester) {
        SemesterCourse semesterCourse = getSemesterCourseById(semesterCourseId);
        
        // Check if course already exists in target semester
        Optional<SemesterCourse> existing = semesterCourseRepository.findBySemesterIdAndCourseId(
            targetSemester.getId(), semesterCourse.getCourseId());
        
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Course " + semesterCourse.getCourseId() + 
                " already exists in target semester " + targetSemester.getId());
        }

        semesterCourse.setSemester(targetSemester);
        semesterCourse.setCourseOrder(getNextCourseOrder(targetSemester.getId()));

        return semesterCourseRepository.save(semesterCourse);
    }

    // DELETE operations
    public void removeCourseFromSemester(Long semesterCourseId) {
        SemesterCourse semesterCourse = getSemesterCourseById(semesterCourseId);
        semesterCourseRepository.delete(semesterCourse);
    }

    public void removeCourseFromSemester(Long semesterId, String courseId) {
        semesterCourseRepository.deleteBySemesterIdAndCourseId(semesterId, courseId);
    }

    public void removeAllCoursesFromSemester(Long semesterId) {
        semesterCourseRepository.deleteBySemesterId(semesterId);
    }

    // UTILITY methods
    public long countCoursesBySemester(Long semesterId) {
        return semesterCourseRepository.countBySemesterId(semesterId);
    }

    public long countCompletedCoursesBySemester(Long semesterId) {
        return semesterCourseRepository.countBySemesterIdAndIsCompletedTrue(semesterId);
    }

    public long countUncompletedCoursesBySemester(Long semesterId) {
        return semesterCourseRepository.countBySemesterIdAndIsCompletedFalse(semesterId);
    }

    public long countCoursesForStudyPlan(Long studyPlanId) {
        return semesterCourseRepository.countByStudyPlanId(studyPlanId);
    }

    public long countCompletedCoursesForStudyPlan(Long studyPlanId) {
        return semesterCourseRepository.countCompletedByStudyPlanId(studyPlanId);
    }

    public Integer getNextCourseOrder(Long semesterId) {
        Integer maxOrder = semesterCourseRepository.findMaxCourseOrderBySemesterId(semesterId);
        return maxOrder + 1;
    }

    public boolean courseExistsInSemester(Long semesterId, String courseId) {
        return semesterCourseRepository.existsBySemesterIdAndCourseId(semesterId, courseId);
    }

    public List<SemesterCourse> getCoursesCompletedInDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return semesterCourseRepository.findByCompletionDateBetween(startDate, endDate);
    }

    // Reorder courses within a semester - useful for drag and drop functionality
    public void reorderCoursesInSemester(Long semesterId, List<Long> semesterCourseIds) {
        for (int i = 0; i < semesterCourseIds.size(); i++) {
            Long semesterCourseId = semesterCourseIds.get(i);
            SemesterCourse semesterCourse = getSemesterCourseById(semesterCourseId);
            
            // Verify this course belongs to the semester
            if (!semesterCourse.getSemester().getId().equals(semesterId)) {
                throw new IllegalArgumentException("Course " + semesterCourseId + " does not belong to semester " + semesterId);
            }
            
            semesterCourse.setCourseOrder(i + 1);

            semesterCourseRepository.save(semesterCourse);
        }
    }
}
