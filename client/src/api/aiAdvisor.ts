import { AI_ADVISOR_API_URL } from "../config/api";

export interface ChatMessage {
  message: string;
  session_id?: string;
  user_id?: string; // Add user context
}

export interface ChatResponse {
  response: string;
  course_codes: string[];
  confidence: number;
  sources: string[];
}

export interface CourseInfo {
  course_code: string;
  course_name: string;
  description: string;
  semester: string;
  ects?: number;
}

class AiAdvisorAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = AI_ADVISOR_API_URL;
  }

  async sendMessage(
    message: string,
    sessionId?: string,
    userId?: string
  ): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          session_id: sessionId,
          user_id: userId,
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
