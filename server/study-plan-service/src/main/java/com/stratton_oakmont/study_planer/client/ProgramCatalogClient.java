package com.stratton_oakmont.study_planer.client;

import com.stratton_oakmont.study_planer.dto.StudyProgramDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Component
public class ProgramCatalogClient {
    
    private final RestTemplate restTemplate;
    private final String programCatalogServiceUrl;
    
    public ProgramCatalogClient(RestTemplate restTemplate, 
                               @Value("${program-catalog-service.url:http://program-catalog-service:8080}") String serviceUrl) {
        this.restTemplate = restTemplate;
        this.programCatalogServiceUrl = serviceUrl;
    }
    
    public List<StudyProgramDto> getAllStudyPrograms() {
        try {
            String url = programCatalogServiceUrl + "/api/v1/study-programs";
            ResponseEntity<List<StudyProgramDto>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<StudyProgramDto>>() {}
            );
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch study programs from program-catalog-service", e);
        }
    }
    
    public Optional<StudyProgramDto> getStudyProgramById(Long id) {
        try {
            String url = programCatalogServiceUrl + "/api/v1/study-programs/" + id;
            ResponseEntity<StudyProgramDto> response = restTemplate.getForEntity(url, StudyProgramDto.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return Optional.of(response.getBody());
            } else {
                return Optional.empty();
            }
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    public List<StudyProgramDto> searchStudyPrograms(String degree, String curriculum, String fieldOfStudies) {
        try {
            StringBuilder url = new StringBuilder(programCatalogServiceUrl + "/api/v1/study-programs/search?");
            
            if (degree != null && !degree.trim().isEmpty()) {
                url.append("degree=").append(degree).append("&");
            }
            if (curriculum != null && !curriculum.trim().isEmpty()) {
                url.append("curriculum=").append(curriculum).append("&");
            }
            if (fieldOfStudies != null && !fieldOfStudies.trim().isEmpty()) {
                url.append("fieldOfStudies=").append(fieldOfStudies).append("&");
            }
            
            ResponseEntity<List<StudyProgramDto>> response = restTemplate.exchange(
                url.toString(),
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<StudyProgramDto>>() {}
            );
            
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to search study programs from program-catalog-service", e);
        }
    }
}
