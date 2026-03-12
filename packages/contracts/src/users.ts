import { Role } from './auth';

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetailResponse extends UserResponse {
  groupMemberships: {
    id: string;
    group: {
      id: string;
      name: string;
    };
  }[];
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role: Role;
}

export interface UpdateUserRequest {
  name?: string;
  role?: Role;
  isActive?: boolean;
  avatarUrl?: string | null;
}

export interface InviteUserRequest {
  email: string;
  role: Role;
  groupIds?: string[];
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
}
