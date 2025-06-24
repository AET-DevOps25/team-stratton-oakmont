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

    @Value("${jwt.secret:mySecretKey}")
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
        return claims.get("userId", Long.class);
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