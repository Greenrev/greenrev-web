import { apiRequest } from "./apiClient";

export interface UserProfile {
  _id: string;
  name: string | null;
  email: string;
  role: string;
  companyName: string | null;
  garageName: string | null;
  phone: string | null;
  bio: string | null;
  profileImage: string | null;
  isEmailVerified: boolean;
  createdAt: string;
}

export async function getProfile(): Promise<UserProfile> {
  const response = await apiRequest<{ user: UserProfile }>("/api/v1/profile", {
    method: "GET",
  });

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data.user;
}

export async function updateProfile(data: Partial<UserProfile> & { profileImageBase64?: string }): Promise<UserProfile> {
  const response = await apiRequest<{ user: UserProfile }>("/api/v1/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data.user;
}
