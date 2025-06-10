package com.stratton_oakmont.user_auth_service.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @PostMapping("/register")
    public ResponseEntity<String> registerUser() {
        // Placeholder response
        return ResponseEntity.status(HttpStatus.CREATED).body("User registration endpoint hit");
    }


    @GetMapping("/ping") // New GET endpoint
    public ResponseEntity<String> pingAuth() {
        return ResponseEntity.ok("Auth service is reachable via GET at /auth/ping");
    }
}