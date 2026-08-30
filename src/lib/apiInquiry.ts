import { apiRequest } from "./apiClient";

export interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED";
  createdAt: string;
}

export async function createInquiry(input: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const res = await apiRequest<{ inquiry: Inquiry }>("/api/v1/inquiries", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.success) {
    throw new Error(res.error.message || "Failed to submit inquiry");
  }
  return res.data.inquiry;
}

export async function adminListInquiries() {
  const res = await apiRequest<{ inquiries: Inquiry[] }>("/api/v1/admin/inquiries", {
    method: "GET",
  });
  if (!res.success) {
    throw new Error(res.error.message || "Failed to fetch inquiries");
  }
  return res.data.inquiries;
}

export async function adminUpdateInquiryStatus(id: string, status: "NEW" | "READ" | "REPLIED") {
  const res = await apiRequest<{ inquiry: Inquiry }>(`/api/v1/admin/inquiries/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.success) {
    throw new Error(res.error.message || "Failed to update inquiry status");
  }
  return res.data.inquiry;
}
