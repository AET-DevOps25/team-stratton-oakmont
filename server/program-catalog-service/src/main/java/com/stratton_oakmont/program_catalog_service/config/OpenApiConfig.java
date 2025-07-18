package com.stratton_oakmont.program_catalog_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI programCatalogOpenAPI() {

        Server localServer = new Server()
                .url("http://localhost:8080/api/v1")
                .description("Local Development Server");

        Server prodServer = new Server()
                .url("/api/v1")
                .description("Program Catalog Service");

        Contact contact = new Contact();
        contact.setEmail("nikolas.lethaus@gmail.com");
        contact.setName("Team Stratton Oakmont");

        License mitLicense = new License()
                .name("MIT License")
                .url("https://choosealicense.com/licenses/mit/");

        Info info = new Info()
                .title("Program Catalog Service API")
                .version("1.0")
                .contact(contact)
                .description("This API provides access to TUM module catalog (e.g., Introduction to Deep Learning) and study programs (e.g., MSc Information System).")
                .license(mitLicense);

        return new OpenAPI()
                .info(info)
                .servers(List.of(localServer, prodServer));
    }
}
