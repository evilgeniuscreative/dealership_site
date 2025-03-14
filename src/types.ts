import { Request } from 'express';

export interface Car {
  id?: number;
  make: string;
  model: string;
  model_year: number;
  color: string;
  doors: number;
  engine_size: string;
  horsepower: number;
  mileage: number;
  price: number;
  title: string;
  body_text: string;
  image_name: string;
  featured_car?: boolean;
  car_condition?: string;
  car_status?: string;
  car_transmission?: string;
  car_type?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CarouselImage {
  id?: number;
  image_name: string;
  title: string;
  subtitle: string;
  delay?: number;
  display_order?: number;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface PageHero {
  title: string;
  subtitle: string;
  image_url: string;
  height: number;
}

// Auth types
export interface AuthenticatedUser {
  id: number;
  username: string;
  role: string;
}

// Update the AuthRequest interface to use Express.User
export interface AuthRequest extends Request {
  user?: any; // Use Express.User from the global namespace
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

// Search types
export interface SearchFilters {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  maxMileage?: number;
  color?: string;
  isAWD?: boolean;
  minYear?: number;
  maxYear?: number;
  featured_car?: string;
  query?: string;
  page?: string;
  limit?: string;
}
