import { apiRequest } from "./apiClient";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from "@/types/product";

export async function uploadProductImage(
  file: File,
): Promise<string> {
  const formData = new FormData();
  formData.append("files", file);

  const response = await apiRequest<{ urls: string[] }>("/api/v1/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data.urls[0];
}

export async function uploadProductImages(
  files: File[],
): Promise<string[]> {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));

  const response = await apiRequest<{ urls: string[] }>("/api/v1/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data.urls;
}

export async function createProduct(
  data: CreateProductInput,
): Promise<Product> {
  const response = await apiRequest<Product>("/api/v1/products", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
}

export async function getVendorProducts(): Promise<Product[]> {
  const response = await apiRequest<{ products: Product[] }>(
    "/api/v1/products/vendor",
    {
      method: "GET",
    },
  );

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data.products;
}

export interface ProductFilters {
  category?: "vehicle" | "part";
  name?: string;
  make?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  color?: string;
  inStock?: boolean;
}

export async function getAllProducts(
  categoryOrFilters?: "vehicle" | "part" | ProductFilters,
): Promise<Product[]> {
  const params = new URLSearchParams();

  if (typeof categoryOrFilters === "string") {
    // Backwards-compatible: accept a plain category string
    params.set("category", categoryOrFilters);
  } else if (categoryOrFilters) {
    const f = categoryOrFilters;
    if (f.category) params.set("category", f.category);
    if (f.name)     params.set("name", f.name);
    if (f.make)     params.set("make", f.make);
    if (f.minPrice !== undefined) params.set("minPrice", f.minPrice.toString());
    if (f.maxPrice !== undefined) params.set("maxPrice", f.maxPrice.toString());
    if (f.minYear  !== undefined) params.set("minYear", f.minYear.toString());
    if (f.maxYear  !== undefined) params.set("maxYear", f.maxYear.toString());
    if (f.color)    params.set("color", f.color);
    if (f.inStock !== undefined) params.set("inStock", f.inStock.toString());
  }

  const qs = params.toString();
  const url = `/api/v1/products${qs ? `?${qs}` : ""}`;

  const response = await apiRequest<{ products: Product[] }>(url, {
    method: "GET",
  });

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data.products;
}


export async function getProduct(id: string): Promise<Product> {
  const response = await apiRequest<Product>(`/api/v1/products/${id}`, {
    method: "GET",
  });

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
}

export async function updateProduct(
  data: UpdateProductInput,
): Promise<Product> {
  const response = await apiRequest<Product>(`/api/v1/products/${data.id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
}

export async function deleteProduct(id: string): Promise<void> {
  const response = await apiRequest<void>(`/api/v1/products/${id}`, {
    method: "DELETE",
  });

  if (!response.success) {
    throw new Error(response.error.message);
  }
}

export async function bulkDeleteProducts(
  ids: string[],
): Promise<{ deletedCount: number }> {
  const response = await apiRequest<{ deletedCount: number; message: string }>(
    "/api/v1/products/bulk",
    {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    },
  );

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
}

export async function getProductReviews(productId: string): Promise<any> {
  const response = await apiRequest<any>(`/api/v1/products/${productId}/reviews`, {
    method: "GET",
  });

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
}

export async function createProductReview(
  productId: string,
  data: { rating: number; comment?: string },
): Promise<any> {
  const response = await apiRequest<{ review: any }>(
    `/api/v1/products/${productId}/reviews`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data.review;
}
