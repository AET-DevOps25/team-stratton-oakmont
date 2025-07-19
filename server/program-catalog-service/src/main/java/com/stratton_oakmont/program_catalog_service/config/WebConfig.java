package com.stratton_oakmont.program_catalog_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/*
    Reason for this file is so that the unified swagger ui page works
*/
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Apply CORS to all paths including /api/v1/api-docs
                .allowedOrigins(
                    "https://tum-study-planner.student.k8s.aet.cit.tum.de",
                    "http://localhost:5173",
                    "http://localhost:3000",
                    "http://localhost:80",   // This covers default port 80
                    "http://localhost"       // Your Swagger UI port
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600); // Cache preflight response for 1 hour
    }
}