import { apiRequest } from "./apiClient";

export interface Role {
  _id: string;
  name: string;
  description: string;
  level: number;
  isSystem: boolean;
  permissions: { _id: string; name: string; description: string; module: string }[];
}

export interface AdminUser {
  _id: string;
  email: string;
  name: string | null;
  role: "customer" | "vendor" | "mechanic" | "admin";
  assignedRole: Role | null;
  status: "active" | "suspended";
  isEmailVerified: boolean;
  verificationLevel: "basic" | "individual" | "business";
  createdAt: string;
}

export async function adminListRoles() {
  const res = await apiRequest<{ roles: Role[] }>("/api/v1/admin/roles", { method: "GET" });
  if (!res.success) throw new Error(res.error.message);
  return res.data.roles;
}

export async function adminListAuditLogs(params?: { page?: number; limit?: number; module?: string; action?: string; adminId?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.module) query.set("module", params.module);
  if (params?.action) query.set("action", params.action);
  if (params?.adminId) query.set("adminId", params.adminId);

  const res = await apiRequest<{ logs: any[]; total: number; page: number; limit: number }>(
    `/api/v1/admin/audit-logs?${query.toString()}`,
    { method: "GET" }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data;
}

export async function adminAssignRole(userId: string, roleId: string | null) {
  const res = await apiRequest<{ user: AdminUser }>(
    `/api/v1/admin/users/${userId}/assign-role`,
    {
      method: "POST",
      body: JSON.stringify({ roleId }),
    }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data.user;
}

export async function adminListUsers(params: { page?: number; limit?: number; role?: string }) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());
  if (params.role) query.set("role", params.role);
  
  const res = await apiRequest<{ users: AdminUser[]; total: number; page: number; limit: number }>(
    `/api/v1/admin/users?${query.toString()}`,
    { method: "GET" }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data;
}

export async function adminUpdateUserStatus(userId: string, status: "active" | "suspended") {
  const res = await apiRequest<{ user: AdminUser }>(
    `/api/v1/admin/users/${userId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data.user;
}

export async function adminUpdateUserRole(userId: string, role: "customer" | "vendor" | "mechanic" | "admin") {
  const res = await apiRequest<{ user: AdminUser }>(
    `/api/v1/admin/users/${userId}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data.user;
}

export async function adminDeleteUser(userId: string) {
  const res = await apiRequest<{ ok: boolean }>(
    `/api/v1/admin/users/${userId}`,
    { method: "DELETE" }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data;
}

export async function adminUpdateUserTier(userId: string, verificationLevel: "basic" | "individual" | "business") {
  const res = await apiRequest<{ user: AdminUser }>(
    `/api/v1/admin/users/${userId}/tier`,
    {
      method: "PATCH",
      body: JSON.stringify({ verificationLevel }),
    }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data.user;
}

// --- Admin Bookings ---
export async function adminListBookings() {
  const res = await apiRequest<any[]>("/api/v1/admin/bookings", { method: "GET" });
  if (!res.success) throw new Error(res.error.message);
  return res.data;
}

export async function adminUpdateBookingStatus(bookingId: string, status: string) {
  const res = await apiRequest<any>(`/api/v1/admin/bookings/${bookingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.success) throw new Error(res.error.message);
  return res.data;
}

// --- Admin Verifications ---
export async function adminListVerifications() {
  const res = await apiRequest<any[]>("/api/v1/admin/verifications", { method: "GET" });
  if (!res.success) throw new Error(res.error.message);
  return res.data;
}

export async function adminUpdateVerificationStatus(
  verificationId: string,
  status: string,
  adminNotes?: string
) {
  const res = await apiRequest<any>(`/api/v1/admin/verifications/${verificationId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, adminNotes }),
  });
  if (!res.success) throw new Error(res.error.message);
  return res.data;
}

// --- Admin Reviews ---
export async function adminListReviews() {
  const res = await apiRequest<any[]>("/api/v1/admin/reviews", { method: "GET" });
  if (!res.success) throw new Error(res.error.message);
  return res.data;
}

export async function adminDeleteReview(reviewId: string) {
  const res = await apiRequest<any>(`/api/v1/admin/reviews/${reviewId}`, { method: "DELETE" });
  if (!res.success) throw new Error(res.error.message);
  return res.data;
}

// --- Admin Support (Tickets) ---
export async function adminListTickets() {
  const res = await apiRequest<any[]>("/api/v1/admin/support", { method: "GET" });
  if (!res.success) throw new Error(res.error.message);
  return res.data;
}

export async function adminUpdateTicketStatus(ticketId: string, payload: any) {
  const res = await apiRequest<any>(`/api/v1/admin/support/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!res.success) throw new Error(res.error.message);
  return res.data;
}

export async function adminReplyToTicket(ticketId: string, content: string, isInternal: boolean = false) {
  const res = await apiRequest<any>(`/api/v1/support/${ticketId}/reply`, {
    method: "POST",
    body: JSON.stringify({ content, isInternal }),
  });
  if (!res.success) throw new Error(res.error.message);
  return res.data;
}

// --- Admin Products ---
export async function adminListProducts() {
  const res = await apiRequest<any>("/api/v1/products", { method: "GET" });
  if (!res.success) throw new Error(res.error.message);
  return res.data.products;
}

export async function adminDeleteProduct(productId: string) {
  const res = await apiRequest<any>(`/api/v1/products/${productId}`, { method: "DELETE" });
  if (!res.success) throw new Error(res.error.message);
  return res.data;
}

// --- Customer: own expert service bookings ---
export interface ExpertBooking {
  _id: string;
  vehicleDetails: { make: string; model: string; year: string };
  issueDescription: string;
  requestedDate: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "COMPLETED";
  createdAt: string;
  mechanicId: {
    _id: string;
    name: string | null;
    email: string;
    phone?: string;
    garageName?: string;
  } | null;
}

export async function getMyExpertBookings(): Promise<ExpertBooking[]> {
  const res = await apiRequest<{ bookings: ExpertBooking[] }>("/api/v1/bookings/my", {
    method: "GET",
  });
  if (!res.success) throw new Error(res.error.message);
  return res.data.bookings;
}

