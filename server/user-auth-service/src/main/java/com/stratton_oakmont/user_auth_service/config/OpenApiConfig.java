package com.stratton_oakmont.user_auth_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI userAuthOpenAPI() {

        Server currentServer = new Server()
                .url("/api/v1")
                .description("Current Environment");

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

        // // Define the security scheme for JWT
        // SecurityScheme jwtScheme = new SecurityScheme()
        //         .type(SecurityScheme.Type.HTTP)
        //         .scheme("bearer")
        //         .bearerFormat("JWT")
        //         .in(SecurityScheme.In.HEADER)
        //         .name("Authorization");

        //SecurityRequirement securityRequirement = new SecurityRequirement()
        //       .addList("Bearer Authentication");

        return new OpenAPI()
                .info(info)
                .servers(List.of(currentServer));
                //.addSecurityItem(securityRequirement)
                //.components(new Components()
                //        .addSecuritySchemes("Bearer Authentication", jwtScheme));
    }
}
