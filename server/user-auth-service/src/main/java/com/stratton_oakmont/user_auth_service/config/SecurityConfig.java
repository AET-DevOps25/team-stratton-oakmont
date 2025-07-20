package com.stratton_oakmont.user_auth_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

// Why do we need this file? 
// to set up to permit access to /auth/** endpoints, which is necessary for the 
// registration endpoint to be reachable without authentication
// ++ Also so that the client can talk to this service #cors

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // Disable CSRF for simplicity, consider enabling for production
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/", "/index.html", "/auth/**", "/actuator/**").permitAll()
                .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll() // Allow Swagger UI access
                .anyRequest().authenticated() // All other requests need authentication
            );
        return http.build();
    }

    // Think of @Bean like saying “put this tool 
    // in the toolbox, so other parts of the app can use it
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "https://tum-study-planner.student.k8s.aet.cit.tum.de",
            "http://localhost:5173",  // Vite dev server
            "http://localhost:3000",  // Alternative React port
            "http://localhost:80",    // Docker/nginx port
            "http://localhost"        // Swagger UI
        ));
        // Allow any origin for EC2/AWS deployments (you can restrict this to specific IP ranges if needed)
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}