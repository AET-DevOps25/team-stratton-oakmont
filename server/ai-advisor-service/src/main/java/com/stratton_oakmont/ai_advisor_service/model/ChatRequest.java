package com.stratton_oakmont.ai_advisor_service.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ChatRequest {
    private String message;
    @JsonProperty("session_id")
    private String sessionId;
    @JsonProperty("user_id")
    private String userId;

    public ChatRequest() {}

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}