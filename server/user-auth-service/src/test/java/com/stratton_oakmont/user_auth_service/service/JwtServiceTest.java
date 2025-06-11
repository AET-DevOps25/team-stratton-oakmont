package com.stratton_oakmont.user_auth_service.service;

import com.stratton_oakmont.user_auth_service.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Date;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;
    private String testSecret = "1nXK_oOdmYHmcLhpu6c-QAUaDnfp7T-rMyI3pUEtwFRkk5iwhPfXxzA_S96bbfF8NL6jQvZrO8E";
    private Long testExpiration = 3600000L; // 1 hour
    private Key signingKey;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // Use ReflectionTestUtils to set the @Value fields
        ReflectionTestUtils.setField(jwtService, "secret", testSecret);
        ReflectionTestUtils.setField(jwtService, "expiration", testExpiration);

        // Manually call the @PostConstruct method
        jwtService.init();
        signingKey = Keys.hmacShaKeyFor(testSecret.getBytes());

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setRoles("USER,ADMIN");
    }

    @Test
    void generateToken_shouldReturnValidTokenString() {
        /*
            This test ensures that the "JwtService.generateToken()" method:
            1. Successfully produces a non-empty token string.
            2. The token is correctly signed with the configured secret key.
            3. The token contains the correct user information (email as subject, user ID, roles) in its claims.
            4. The token has valid issuance and expiration times.
        */
        // ACT
        String token = jwtService.generateToken(testUser);


        // ASSERT
        assertNotNull(token);
        assertFalse(token.isEmpty());

        // Try to parse the token to ensure it's well-formed
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        // Checks that the "subject" (often the username) of the JWT matches the email of our testUser
        assertEquals(testUser.getEmail(), claims.getSubject());

        Integer parsedUserId = claims.get("userId", Integer.class);
        assertNotNull(parsedUserId, "Parsed userId claim should not be null");
        assertEquals(testUser.getId().longValue(), parsedUserId.longValue(), "User ID claim does not match");

        assertEquals(testUser.getRoles(), claims.get("roles", String.class));
        assertTrue(claims.getExpiration().after(new Date()));
        assertTrue(claims.getIssuedAt().before(new Date(System.currentTimeMillis() + 1000))); // Check issued at is recent
    }
}