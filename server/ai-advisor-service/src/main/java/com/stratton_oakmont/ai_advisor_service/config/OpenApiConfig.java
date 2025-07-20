package com.stratton_oakmont.ai_advisor_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8082}")
    private String serverPort;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Bean
    public OpenAPI aiAdvisorOpenAPI() {

        Contact contact = new Contact();
        contact.setEmail("f.seitz@tum.de");
        contact.setName("Team Stratton Oakmont");

        License mitLicense = new License()
                .name("MIT License")
                .url("https://choosealicense.com/licenses/mit/");

        Info info = new Info()
                .title("AI Advisor Service API")
                .version("1.0")
                .contact(contact)
                .description("This API provides AI-powered academic advice and recommendations for study planning.")
                .license(mitLicense);

        // Define the security scheme for JWT
        SecurityScheme jwtScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .in(SecurityScheme.In.HEADER)
                .name("Authorization");

        SecurityRequirement securityRequirement = new SecurityRequirement()
                .addList("Bearer Authentication");

        // Only show the appropriate server based on environment
        if ("prod".equals(activeProfile) || "production".equals(activeProfile)) {
            Server prodServer = new Server()
                    .url("https://tum-study-planner.student.k8s.aet.cit.tum.de/api/ai-advisor")
                    .description("Production Server");
            
            return new OpenAPI()
                    .info(info)
                    .servers(List.of(prodServer))
                    .addSecurityItem(securityRequirement)
                    .components(new Components()
                            .addSecuritySchemes("Bearer Authentication", jwtScheme));
        } else {
            Server devServer = new Server()
                    .url("http://localhost:" + serverPort + "/api/v1")
                    .description("Development Server");
            
            return new OpenAPI()
                    .info(info)
                    .servers(List.of(devServer))
                    .addSecurityItem(securityRequirement)
                    .components(new Components()
                            .addSecuritySchemes("Bearer Authentication", jwtScheme));
        }
    }
}