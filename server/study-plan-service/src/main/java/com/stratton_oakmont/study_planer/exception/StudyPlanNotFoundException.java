package com.stratton_oakmont.study_planer.exception;

public class StudyPlanNotFoundException extends RuntimeException {
    public StudyPlanNotFoundException(String message) {
        super(message);
    }
    
    public StudyPlanNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public StudyPlanNotFoundException(Long id) {
        super("Study plan not found with id: " + id);
    }
}
