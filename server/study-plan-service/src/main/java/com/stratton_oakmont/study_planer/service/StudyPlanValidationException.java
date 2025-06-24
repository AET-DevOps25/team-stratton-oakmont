package com.stratton_oakmont.study_planer.exception;

public class StudyPlanValidationException extends RuntimeException {
    public StudyPlanValidationException(String message) {
        super(message);
    }
    
    public StudyPlanValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}