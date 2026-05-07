export type UserRole = 'admin' | 'doctor' | 'receptionist';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  clinicId: string;
  phone?: string;
  specialization?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
