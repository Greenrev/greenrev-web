export type AcquisitionStatus =
  | "pending"
  | "accepted"
  | "receipt_uploaded"
  | "payment_confirmed"
  | "completed";

export type AcquisitionEventAction =
  | "created"
  | "vendor_accepted"
  | "receipt_uploaded"
  | "payment_confirmed"
  | "client_completed"
  | "admin_flagged"
  | "admin_resolved";

export interface AcquisitionEvent {
  _id: string;
  requestId: string;
  actorId: string;
  actorRole: string;
  action: AcquisitionEventAction;
  fromStatus: AcquisitionStatus | null;
  toStatus: AcquisitionStatus | null;
  metadata: unknown | null;
  createdAt: string;
  updatedAt: string;
}

export interface VendorContact {
  name: string;
  email: string;
  phone: string | null;
  companyName: string | null;
}

export interface AcquisitionRequest {
  _id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  vendorId: string;
  vendorName: string;
  vendorEmail: string | null;
  vendorPhone: string | null;
  vendorCompanyName: string | null;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: string;
  productMake: string | null;
  quantity: number;
  message: string | null;
  status: AcquisitionStatus;
  acceptedAt: string | null;
  receiptUrl?: string | null;
  receiptUploadedAt?: string | null;
  vendorPaymentAmount?: number | null;
  vendorPaymentConfirmedAt?: string | null;
  completedAt: string | null;
  vendorSeen: boolean;
  hasReview: boolean;
  review?: Review | null;
  adminFlaggedAt?: string | null;
  adminFlagReason?: string | null;
  adminResolvedAt?: string | null;
  adminResolution?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  acquisitionRequestId: string;
  customerId: string;
  vendorId: string;
  productId: string;
  rating: number;
  comment: string | null;
  customerName: string;
  productName: string;
  createdAt: string;
}

export interface VendorReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}
