// Base configuration for all services
const getApiBaseUrl = (): string => {
  if (
    window.location.hostname.includes(
      "tum-study-planner.student.k8s.aet.cit.tum.de"
    )
  ) {
    return "/api/v1"; // Production: goes through nginx proxy
  }
  return "http://localhost"; // Development: direct to localhost
};

export const API_BASE_URL = getApiBaseUrl();

// Service-specific URLs
export const STUDY_PLAN_API_URL = `${API_BASE_URL}${
  window.location.hostname.includes(
    "tum-study-planner.student.k8s.aet.cit.tum.de"
  )
    ? "/study-plans"
    : ":8081/api/v1/study-plans"
}`;

export const AUTH_API_URL = `${API_BASE_URL}${
  window.location.hostname.includes(
    "tum-study-planner.student.k8s.aet.cit.tum.de"
  )
    ? "/auth"
    : ":8083/auth"
}`;

export const PROGRAM_CATALOG_API_URL = `${API_BASE_URL}${
  window.location.hostname.includes(
    "tum-study-planner.student.k8s.aet.cit.tum.de"
  )
    ? "/programs"
    : ":8080/programs"
}`;

export const AI_ADVISOR_API_URL = `${API_BASE_URL}${
  window.location.hostname.includes(
    "tum-study-planner.student.k8s.aet.cit.tum.de"
  )
    ? "/ai-advisor"
    : ":8082/ai-advisor"
}`;
