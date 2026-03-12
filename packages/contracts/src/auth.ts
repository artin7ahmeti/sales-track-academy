export enum Role {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    avatarUrl: string | null;
  };
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AcceptInviteRequest {
  token: string;
  name: string;
  password: string;
}
