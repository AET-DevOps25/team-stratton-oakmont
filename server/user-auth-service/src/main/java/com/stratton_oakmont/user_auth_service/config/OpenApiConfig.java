package com.stratton_oakmont.user_auth_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8083}")
    private String serverPort;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Bean
    public OpenAPI userAuthOpenAPI() {
        Contact contact = new Contact();
        contact.setEmail("nikolas.lethaus@gmail.com");
        contact.setName("Team Stratton Oakmont");

        License mitLicense = new License()
                .name("MIT License")
                .url("https://choosealicense.com/licenses/mit/");

        Info info = new Info()
                .title("User Authentication Service API")
                .version("1.0")
                .contact(contact)
                .description("This API handles user authentication, registration, and JWT token management.")
                .license(mitLicense);

        // Only show the appropriate server based on environment
        if ("prod".equals(activeProfile) || "production".equals(activeProfile)) {
            Server prodServer = new Server()
                    .url("https://tum-study-planner.student.k8s.aet.cit.tum.de/api/user-auth")
                    .description("Production Server");
            
            return new OpenAPI()
                    .info(info)
                    .servers(List.of(prodServer));
        } else {
            Server devServer = new Server()
                    .url("http://localhost:" + serverPort + "/api/v1")
                    .description("Development Server");
            
            return new OpenAPI()
                    .info(info)
                    .servers(List.of(devServer));
        }
    }
}