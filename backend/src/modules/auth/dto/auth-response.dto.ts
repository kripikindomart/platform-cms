import { User } from '../../../database/schema/tenant/users.schema';

/**
 * User info untuk response (exclude sensitive data)
 */
export class UserResponseDto {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_login_at: Date | null;
  created_at: Date;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.phone = user.phone;
    this.avatar_url = user.avatar_url;
    this.is_active = user.is_active;
    this.is_verified = user.is_verified;
    this.last_login_at = user.last_login_at;
    this.created_at = user.created_at;
  }
}

/**
 * Login response DTO
 */
export class LoginResponseDto {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserResponseDto;

  constructor(token: string, user: User) {
    this.access_token = token;
    this.token_type = 'Bearer';
    this.expires_in = 86400; // 24 hours
    this.user = new UserResponseDto(user);
  }
}

/**
 * Register response DTO
 */
export class RegisterResponseDto {
  message: string;
  user: UserResponseDto;

  constructor(user: User) {
    this.message = 'Registrasi berhasil';
    this.user = new UserResponseDto(user);
  }
}

/**
 * Message response DTO
 */
export class MessageResponseDto {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
