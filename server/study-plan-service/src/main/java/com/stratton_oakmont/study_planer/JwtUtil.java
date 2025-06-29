package com.stratton_oakmont.study_planer.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {

    @Value("${JWT_SECRET:mySecretKey}")
    private String jwtSecret;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public Claims extractAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Long extractUserIdFromToken(String token) {
        Claims claims = extractAllClaimsFromToken(token);

        // Handle both Integer and Long cases
        Object userIdObj = claims.get("userId");

        System.out.println("DEBUG: userId object type: " + (userIdObj != null ? userIdObj.getClass() : "null"));
        System.out.println("DEBUG: userId value: " + userIdObj);
        if (userIdObj instanceof Integer) {
            return ((Integer) userIdObj).longValue();
        } else if (userIdObj instanceof Long) {
            return (Long) userIdObj;
        } else if (userIdObj instanceof Number) {
            return ((Number) userIdObj).longValue();
        }
    
        return null;
    }

    public String extractUsernameFromToken(String token) {
        Claims claims = extractAllClaimsFromToken(token);
        return claims.getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            extractAllClaimsFromToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String extractTokenFromHeader(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return null;
    }
}