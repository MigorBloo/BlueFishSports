// User and Authentication Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profileLogo?: string | Blob | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  residence: string;
}

export interface ProfileCompletionData {
  username: string;
  profileImage: string;
}
