package com.stratton_oakmont.ai_advisor_service.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class ChatResponse {
    private String response;
    
    @JsonProperty("course_codes")
    private List<String> courseCodes;
    
    private double confidence;
    private List<String> sources;

    // Constructors
    public ChatResponse() {}

    public ChatResponse(String response, List<String> courseCodes, double confidence, List<String> sources) {
        this.response = response;
        this.courseCodes = courseCodes;
        this.confidence = confidence;
        this.sources = sources;
    }

    // Getters and Setters
    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public List<String> getCourseCodes() {
        return courseCodes;
    }

    public void setCourseCodes(List<String> courseCodes) {
        this.courseCodes = courseCodes;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public List<String> getSources() {
        return sources;
    }

    public void setSources(List<String> sources) {
        this.sources = sources;
    }
}
