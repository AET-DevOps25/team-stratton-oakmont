// Service-specific URLs
export const STUDY_PLAN_API_URL = window.location.hostname.includes(
  "tum-study-planner.student.k8s.aet.cit.tum.de"
)
  ? "/api/study-plan" // Production
  : "http://localhost:8081/api/v1"; // Development

export const AUTH_API_URL = window.location.hostname.includes(
  "tum-study-planner.student.k8s.aet.cit.tum.de"
)
  ? "/api/user-auth" // Production
  : "http://localhost:8083/api/v1"; // Development
