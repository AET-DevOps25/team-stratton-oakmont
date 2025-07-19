package com.stratton_oakmont.ai_advisor_service.model;

import java.util.List;

public class ChatResponse {
    private String response;
    private List<String> module_ids;

    public ChatResponse() {}

    public ChatResponse(String response, List<String> module_ids) {
        this.response = response;
        this.module_ids = module_ids;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public List<String> getModule_ids() {
        return module_ids;
    }

    public void setModule_ids(List<String> module_ids) {
        this.module_ids = module_ids;
    }
}