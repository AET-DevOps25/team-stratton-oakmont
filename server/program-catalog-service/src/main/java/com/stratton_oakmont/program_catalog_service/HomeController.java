package com.stratton_oakmont.program_catalog_service;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class HomeController {
    @RequestMapping("/")
    public String index() {
        return "index.html";
    }

    @GetMapping("/dummy") // Added new GET endpoint
    @ResponseBody // Ensures the string is returned as the response body
    public ResponseEntity<String> dummyEndpoint() {
        return ResponseEntity.ok("This is a dummy endpoint from program-catalog-service!");
    }

}