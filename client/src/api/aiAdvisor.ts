import { AI_ADVISOR_API_URL } from "../config/api";

export interface ChatMessage {
  message: string;
  session_id?: string;
  study_plan_id?: string;
}

export interface ChatResponse {
  response: string;
  module_ids: string[];
}

export interface CourseInfo {
  module_id: string;
  name: string;
  content: string;
  category?: string;
  subcategory?: string;
  credits?: number;
  responsible?: string;
  module_level?: string;
  occurrence?: string;
  description_of_achievement_and_assessment_methods?: string;
  intended_learning_outcomes?: string;
  certainty?: number;
}

class AiAdvisorAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = AI_ADVISOR_API_URL;
  }

  async sendMessage(
    message: string,
    sessionId?: string,
    studyPlanId?: string
  ): Promise<ChatResponse> {
    try {
      const token = localStorage.getItem("jwtToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add Authorization header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/chat/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message,
          session_id: sessionId,
          study_plan_id: studyPlanId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async getCourseInfo(courseCode: string): Promise<CourseInfo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/course/${courseCode}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting course info:", error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
      });

      return response.ok;
    } catch (error) {
      console.error("Error checking health:", error);
      return false;
    }
  }
}

export const aiAdvisorAPI = new AiAdvisorAPI();
