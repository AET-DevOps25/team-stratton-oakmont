package com.stratton_oakmont.user_auth_service.controller;

import com.stratton_oakmont.user_auth_service.dto.LoginRequest;
import com.stratton_oakmont.user_auth_service.dto.RegisterRequest;
import com.stratton_oakmont.user_auth_service.model.User;
import com.stratton_oakmont.user_auth_service.repository.UserRepository;
import com.stratton_oakmont.user_auth_service.service.JwtService;
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

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock // Creates a mock implementation for UserRepository
    private UserRepository userRepository;

    @Mock // Creates a mock implementation for PasswordEncoder
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

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

    @Test
    void registerUser_withNewEmail_shouldReturnCreatedAndUserDetails() {
        // Arrange
        String email = "newuser@example.com";
        String password = "newPassword123";
        String hashedPassword = "hashedNewPassword";
        Long expectedUserId = 2L; // Assuming IDs are generated

        RegisterRequest newRegisterRequest = new RegisterRequest();
        newRegisterRequest.setEmail(email);
        newRegisterRequest.setPassword(password);

        // Mocking userRepository: email does not exist
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        // Mocking passwordEncoder
        when(passwordEncoder.encode(password)).thenReturn(hashedPassword);

        // Mocking userRepository.save() to capture the saved user and assign an ID
        // We use ArgumentCaptor to capture the User object passed to save()
        ArgumentCaptor<User> userArgumentCaptor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(userArgumentCaptor.capture())).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            // Simulate ID generation by the database
            // In a real scenario, the ID would be set by JPA after save
            // For testing, we can manually set it here if needed for assertions,
            // or ensure our assertions don't rely on a specific ID if it's auto-generated and not predictable.
            // Let's assume the controller returns the ID from the saved user object.
            // If User.getId() is null before save and set by JPA, this mock needs to reflect that.
            // For simplicity, let's assume the controller will get the ID from the object returned by save.
            // So, we'll set an ID on the captured user before returning it.
            savedUser.setId(expectedUserId); // Simulate ID assignment
            return savedUser;
        });


        // Act
        ResponseEntity<?> responseEntity = authController.registerUser(newRegisterRequest);

        // Assert
        assertNotNull(responseEntity);
        assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode());

        Map<String, String> responseBody = (Map<String, String>) responseEntity.getBody();
        assertNotNull(responseBody);
        assertEquals("User registered successfully with email: " + email, responseBody.get("message"));
        assertNotNull(responseBody.get("userId")); // Check if userId is present
        // If you set a predictable ID in the mock, you can assert it:
        assertEquals(String.valueOf(expectedUserId), responseBody.get("userId"));


        // Verify interactions
        verify(userRepository).findByEmail(email);
        verify(passwordEncoder).encode(password);
        verify(userRepository).save(any(User.class)); // or use userArgumentCaptor.getValue() for more specific checks

        // Optionally, assert details of the captured user
        User capturedUser = userArgumentCaptor.getValue();
        assertEquals(email, capturedUser.getEmail());
        assertEquals(hashedPassword, capturedUser.getPasswordHash());
        assertEquals("USER", capturedUser.getRoles());
    }

    @Test
    void registerUser_withExistingEmail_shouldReturnConflict() {
        // Arrange
        String existingEmail = "existing@example.com";
        RegisterRequest registerRequestWithExistingEmail = new RegisterRequest();
        registerRequestWithExistingEmail.setEmail(existingEmail);
        registerRequestWithExistingEmail.setPassword("anyPassword");

        // Mocking userRepository: email already exists
        when(userRepository.findByEmail(existingEmail)).thenReturn(Optional.of(new User()));

        // Act
        ResponseEntity<?> responseEntity = authController.registerUser(registerRequestWithExistingEmail);

        // Assert
        assertNotNull(responseEntity);
        assertEquals(HttpStatus.CONFLICT, responseEntity.getStatusCode());
        assertEquals("Error: Email: " + existingEmail +  " is already in use!", responseEntity.getBody());

        // Verify that save and encode were not called
        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    void loginUser_withValidCredentials_shouldReturnOkAndToken() {
        // Arrange
        String email = "test@example.com";
        String password = "password123";
        String expectedToken = "dummy.jwt.token";
        Long userId = 1L;

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        User mockUser = new User();
        mockUser.setId(userId);
        mockUser.setEmail(email);
        mockUser.setPasswordHash("hashedPassword"); // The actual hash doesn't matter here as passwordEncoder.matches is mocked
        mockUser.setRoles("USER");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(password, mockUser.getPasswordHash())).thenReturn(true);
        when(jwtService.generateToken(mockUser)).thenReturn(expectedToken);

        // Act
        ResponseEntity<?> responseEntity = authController.loginUser(loginRequest);

        // Assert
        assertNotNull(responseEntity);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());

        Map<String, String> responseBody = (Map<String, String>) responseEntity.getBody();
        assertNotNull(responseBody);
        assertEquals(expectedToken, responseBody.get("token"));
        assertEquals("Login successful", responseBody.get("message"));
        assertEquals(userId.toString(), responseBody.get("userId"));
        assertEquals(email, responseBody.get("email"));

        verify(userRepository).findByEmail(email);
        verify(passwordEncoder).matches(password, mockUser.getPasswordHash());
        verify(jwtService).generateToken(mockUser);
    }


    @Test
    void loginUser_withNonExistentEmail_shouldReturnUnauthorized() {
        // Arrange
        String nonExistentEmail = "nouser@example.com";
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(nonExistentEmail);
        loginRequest.setPassword("anyPassword");

        // Mocking userRepository: email does not exist
        when(userRepository.findByEmail(nonExistentEmail)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> responseEntity = authController.loginUser(loginRequest);

        // Assert
        assertNotNull(responseEntity);
        assertEquals(HttpStatus.UNAUTHORIZED, responseEntity.getStatusCode());
        assertEquals("Error: Invalid email or password.", responseEntity.getBody());

        // Verify that password matching and token generation were not attempted
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtService, never()).generateToken(any(User.class));
    }

    // We will add more test methods here in the next steps
}