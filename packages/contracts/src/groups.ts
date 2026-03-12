export interface GroupResponse {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupDetailResponse extends GroupResponse {
  members: {
    id: string;
    userId: string;
    user: {
      id: string;
      email: string;
      name: string;
      avatarUrl: string | null;
    };
    joinedAt: string;
  }[];
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  memberIds?: string[];
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
}

export interface ManageMembersRequest {
  userIds: string[];
}
