// API calls related to authentication
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8083";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  message: string;
  userId: string;
  email: string;
}

export interface RegisterResponse {
  email: string;
  message: string;
}

export interface AuthError {
  error: string;
  message: string;
}

export class AuthApiError extends Error {
  public statusCode: number;
  public error: string;

  constructor(statusCode: number, error: string, message: string) {
    super(message);
    this.name = "AuthApiError";
    this.statusCode = statusCode;
    this.error = error;
  }
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new AuthApiError(
        response.status,
        data.error || "LOGIN_FAILED",
        data.message || "Login failed"
      );
    }

    return data;
  },

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new AuthApiError(
        response.status,
        data.error || "REGISTRATION_FAILED",
        data.message || "Registration failed"
      );
    }

    return data;
  },

  async ping(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/auth/ping`);

    if (!response.ok) {
      throw new AuthApiError(
        response.status,
        "PING_FAILED",
        "Auth service unreachable"
      );
    }

    return response.text();
  },
};
