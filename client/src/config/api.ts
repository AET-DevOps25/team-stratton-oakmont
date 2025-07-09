// Service-specific URLs
export const STUDY_PLAN_API_URL = window.location.hostname.includes(
  "tum-study-planner.student.k8s.aet.cit.tum.de"
)
  ? "/api/v1" // Production
  : "http://localhost:8081"; // Development

export const AUTH_API_URL = window.location.hostname.includes(
  "tum-study-planner.student.k8s.aet.cit.tum.de"
)
  ? "/api/v1" // Production
  : "http://localhost:8083"; // Development
