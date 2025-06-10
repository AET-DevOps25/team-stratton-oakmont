package com.stratton_oakmont.user_auth_service.controller;

import com.stratton_oakmont.user_auth_service.dto.RegisterRequest;
import com.stratton_oakmont.user_auth_service.model.User;
import com.stratton_oakmont.user_auth_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired // Inject PasswordEncoder
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody RegisterRequest registerRequest) {

        // Check if user with the same email already exists
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT) // Or HttpStatus.BAD_REQUEST
                    .body("Error: Email: " + registerRequest.getEmail() +  " is already in use!");
        }

        User newUser = new User();
        newUser.setEmail(registerRequest.getEmail());

        // no hashing:
        newUser.setPasswordHash(registerRequest.getPassword()); 


        // with hashing!
        //newUser.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));

        // Roles can be set to a default value or handled later
        newUser.setRoles("USER"); 

        userRepository.save(newUser);

        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully with email: " + newUser.getEmail());
    }


    @GetMapping("/ping") // New GET endpoint
    public ResponseEntity<String> pingAuth() {
        return ResponseEntity.ok("Auth service is reachable via GET at /auth/ping");
    }
}