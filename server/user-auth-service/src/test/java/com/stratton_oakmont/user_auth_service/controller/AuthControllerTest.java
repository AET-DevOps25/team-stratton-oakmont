package com.stratton_oakmont.user_auth_service.controller;

import com.stratton_oakmont.user_auth_service.dto.RegisterRequest;
import com.stratton_oakmont.user_auth_service.model.User;
import com.stratton_oakmont.user_auth_service.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // Use Mockito with JUnit 5
class AuthControllerTest {

    @Mock // Creates a mock implementation for UserRepository
    private UserRepository userRepository;

    @Mock // Creates a mock implementation for PasswordEncoder
    private PasswordEncoder passwordEncoder;

    @InjectMocks // Creates an instance of AuthController and injects the mocks into it
    private AuthController authController;

    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        // Common setup for tests, like creating a RegisterRequest object
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
    }

    @Test
    void initialTestToEnsureSetup() {
        // A simple test to make sure the test class is set up correctly
        assertNotNull(authController);
        assertNotNull(userRepository);
        assertNotNull(passwordEncoder);
        System.out.println("AuthControllerTest setup is working!");
    }

    // We will add more test methods here in the next steps
}