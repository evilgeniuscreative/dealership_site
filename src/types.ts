import { Request } from 'express';

export interface Car {
  id?: number;
  make: string;
  model: string;
  year: number;
  color: string;
  doors: number;
  engineDisplacement: string;
  horsepower: number;
  mileage: number;
  price: number;
  summary: string;
  description: string;
  imageUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CarouselImage {
  id?: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  delay?: number;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PageHero {
  title: string;
  subtitle: string;
  imageUrl: string;
  height: number;
}

// Auth types
export interface AuthenticatedUser {
  id: number;
  username: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

// Request body types
export interface LoginRequest {
  username: string;
  password: string;
  twoFactorToken?: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface TwoFactorSetupRequest {
  token: string;
}

export interface GoogleLinkRequest {
  googleProfile: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
}

// Response types
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserResponse;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
}

// Database types
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  google_id?: string;
  google_profile?: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface RefreshToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
  revoked_at?: Date;
}

export interface BackupCode {
  id: number;
  user_id: number;
  code_hash: string;
  used: boolean;
  used_at?: Date;
  created_at: Date;
}

export interface RecoveryToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  used: boolean;
  used_at?: Date;
  created_at: Date;
}
