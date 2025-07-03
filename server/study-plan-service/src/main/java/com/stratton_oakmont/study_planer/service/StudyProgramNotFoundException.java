package com.stratton_oakmont.study_planer.exception;

public class StudyProgramNotFoundException extends RuntimeException {
    public StudyProgramNotFoundException(String message) {
        super(message);
    }
    
    public StudyProgramNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public StudyProgramNotFoundException(Long id) {
        super("Study program not found with id: " + id);
    }
}