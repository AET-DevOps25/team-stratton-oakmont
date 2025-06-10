package com.stratton_oakmont.user_auth_service.controller;

import com.stratton_oakmont.user_auth_service.dto.RegisterRequest;
import com.stratton_oakmont.user_auth_service.model.User;
import com.stratton_oakmont.user_auth_service.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired // Inject PasswordEncoder
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {

        // Check if user with the same email already exists
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT) // Or HttpStatus.BAD_REQUEST
                    .body("Error: Email: " + registerRequest.getEmail() +  " is already in use!");
        }

        User newUser = new User();
        newUser.setEmail(registerRequest.getEmail());
        // no hashing:
        //newUser.setPasswordHash(registerRequest.getPassword());
        // with hashing!
        newUser.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        newUser.setRoles("USER"); 

        userRepository.save(newUser);

        // Return a more structured success response, or just the message
        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully with email: " + newUser.getEmail());
        response.put("userId", newUser.getId().toString());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    @GetMapping("/ping") // New GET endpoint
    public ResponseEntity<String> pingAuth() {
        return ResponseEntity.ok("Auth service is reachable via GET at /auth/ping");
    }

    // Exception handler for validation errors
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }
}