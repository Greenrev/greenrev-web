import { apiRequest } from "./apiClient";
import type {
  AcquisitionEvent,
  AcquisitionRequest,
  AcquisitionStatus,
  VendorReviewsResponse,
  Review,
} from "@/types/acquisition";

// ─── Customer: Create an acquisition request ─────────────────────────────────
export async function createAcquisitionRequest(data: {
  productId: string;
  quantity?: number;
  message?: string;
}): Promise<{ request: AcquisitionRequest }> {
  const res = await apiRequest<{ request: AcquisitionRequest }>(
    "/api/v1/acquisition-requests",
    { method: "POST", body: JSON.stringify(data) }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data;
}

// ─── Customer: Fetch their requests ──────────────────────────────────────────
export async function getCustomerRequests(): Promise<AcquisitionRequest[]> {
  const res = await apiRequest<{ requests: AcquisitionRequest[] }>(
    "/api/v1/acquisition-requests",
    { method: "GET" }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data.requests;
}

// ─── Vendor: Fetch incoming requests ─────────────────────────────────────────
export async function getVendorRequests(): Promise<AcquisitionRequest[]> {
  const res = await apiRequest<{ requests: AcquisitionRequest[] }>(
    "/api/v1/acquisition-requests/vendor",
    { method: "GET" }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data.requests;
}

// ─── Vendor: Get pending request count for notification badge ────────────────
export async function getVendorRequestCount(): Promise<number> {
  const res = await apiRequest<{ count: number }>(
    "/api/v1/acquisition-requests/vendor/count",
    { method: "GET" }
  );
  if (!res.success) return 0;
  return res.data.count;
}

export async function vendorAcceptRequest(id: string): Promise<AcquisitionRequest> {
  const res = await apiRequest<{ request: AcquisitionRequest }>(
    `/api/v1/acquisition-requests/${id}/vendor/accept`,
    { method: "PATCH" }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data.request;
}

export async function uploadPaymentReceipt(id: string, receiptImageBase64: string): Promise<AcquisitionRequest> {
  const res = await apiRequest<{ request: AcquisitionRequest }>(
    `/api/v1/acquisition-requests/${id}/receipt`,
    { method: "POST", body: JSON.stringify({ receiptImageBase64 }) }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data.request;
}

export interface AcquisitionMessage {
  _id: string;
  acquisitionId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAcquisitionMessages(id: string): Promise<AcquisitionMessage[]> {
  const res = await apiRequest<AcquisitionMessage[]>(
    `/api/v1/acquisition-requests/${id}/messages`,
    { method: "GET" }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data || [];
}

export async function sendAcquisitionMessage(id: string, text: string): Promise<AcquisitionMessage> {
  const res = await apiRequest<AcquisitionMessage>(
    `/api/v1/acquisition-requests/${id}/messages`,
    { method: "POST", body: JSON.stringify({ text }) }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data;
}

export async function vendorConfirmPayment(id: string, amount: number): Promise<AcquisitionRequest> {
  const res = await apiRequest<{ request: AcquisitionRequest }>(
    `/api/v1/acquisition-requests/${id}/vendor/confirm-payment`,
    { method: "POST", body: JSON.stringify({ amount }) }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data.request;
}

export async function customerConfirmCompleted(id: string): Promise<AcquisitionRequest> {
  const res = await apiRequest<{ request: AcquisitionRequest }>(
    `/api/v1/acquisition-requests/${id}/client/confirm-completed`,
    { method: "POST" }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data.request;
}

// ─── Admin: List and review acquisition workflow ─────────────────────────────
export async function adminListAcquisitionRequests(params?: {
  status?: AcquisitionStatus;
  flagged?: boolean;
}): Promise<AcquisitionRequest[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (typeof params?.flagged === "boolean") {
    qs.set("flagged", params.flagged ? "true" : "false");
  }
  const url = `/api/v1/admin/acquisition-requests${qs.size ? `?${qs.toString()}` : ""}`;

  const res = await apiRequest<{ requests: AcquisitionRequest[] }>(url, {
    method: "GET",
  });
  if (!res.success) throw new Error(res.error.message);
  return res.data.requests;
}

export async function adminGetAcquisitionEvents(id: string): Promise<AcquisitionEvent[]> {
  const res = await apiRequest<{ events: AcquisitionEvent[] }>(
    `/api/v1/admin/acquisition-requests/${id}/events`,
    { method: "GET" }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data.events;
}

export async function adminFlagAcquisition(id: string, reason: string): Promise<AcquisitionRequest> {
  const res = await apiRequest<{ request: AcquisitionRequest }>(
    `/api/v1/admin/acquisition-requests/${id}/flag`,
    { method: "POST", body: JSON.stringify({ reason }) }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data.request;
}

export async function adminResolveAcquisition(id: string, resolution: string): Promise<AcquisitionRequest> {
  const res = await apiRequest<{ request: AcquisitionRequest }>(
    `/api/v1/admin/acquisition-requests/${id}/resolve`,
    { method: "POST", body: JSON.stringify({ resolution }) }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data.request;
}

// ─── Customer: Submit a review ───────────────────────────────────────────────
export async function createReview(
  acquisitionRequestId: string,
  data: { rating: number; comment?: string }
): Promise<Review> {
  const res = await apiRequest<{ review: Review }>(
    `/api/v1/acquisition-requests/${acquisitionRequestId}/review`,
    { method: "POST", body: JSON.stringify(data) }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data.review;
}

// ─── Public: Get vendor reviews ───────────────────────────────────────────────
export async function getVendorReviews(vendorId: string): Promise<VendorReviewsResponse> {
  const res = await apiRequest<VendorReviewsResponse>(
    `/api/v1/reviews/vendor/${vendorId}`,
    { method: "GET" }
  );
  if (!res.success) throw new Error(res.error.message);
  return res.data;
}
