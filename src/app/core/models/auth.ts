export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  email: string;
  fullName: string;
  roles: string[];
  lastLoginAt: string;
}

export interface LoginErrorResponse {
  message: string;
  timestamp: string;
  path: string;
  errors?: {
    email?: string;
    password?: string;
  };
}

