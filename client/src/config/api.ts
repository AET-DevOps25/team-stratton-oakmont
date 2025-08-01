// Service-specific URLs - supports Kubernetes, localhost, and AWS EC2 deployments
const getServiceApiUrl = (port: number, prodApiPath: string) => {
  const hostname = window.location.hostname;

  // 1. Kubernetes production environment
  if (hostname.includes("tum-study-planner.student.k8s.aet.cit.tum.de")) {
    return prodApiPath;
  }

  // 2. Local development environment
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `http://localhost:${port}/api/v1`;
  }

  // 3. AWS EC2 or other remote deployments
  // Use the same hostname (EC2 IP) with the service-specific port
  return `http://${hostname}:${port}/api/v1`;
};

export const PROGRAM_CATALOG_API_URL = getServiceApiUrl(
  8080,
  "/api/program-catalog"
);
export const STUDY_PLAN_API_URL = getServiceApiUrl(8081, "/api/study-plan");
export const AI_ADVISOR_API_URL = getServiceApiUrl(8082, "/api/ai-advisor");
export const AUTH_API_URL = getServiceApiUrl(8083, "/api/user-auth");
