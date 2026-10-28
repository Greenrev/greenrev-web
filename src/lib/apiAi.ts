import { apiRequest } from "./apiClient";
import type { ProductCategory } from "@/types/product";

export type ExtractedListing = {
  name?: string;
  make?: string;
  price?: string;
  year?: number;
  mileage?: string;
  colorName?: string;
  colorHex?: string;
  description?: string;
  transmission?: string;
  origin?: string;
  vin?: string;
  horsepower?: number;
  torque?: string;
  topSpeed?: string;
  acceleration?: number;
  stockQuantity?: number;
  extraSpecs?: { key: string; value: string }[];
};

export type ExtractionResult = {
  fields: ExtractedListing;
  transcript?: string;
  warnings: string[];
};

/** Sends photos and/or a WAV voice note; returns suggested listing fields. */
export async function extractListing(input: {
  category: ProductCategory;
  images?: Blob[];
  audio?: Blob;
}): Promise<ExtractionResult> {
  const form = new FormData();
  form.append("category", input.category);
  input.images?.forEach((img, i) => form.append("images", img, `photo-${i + 1}.jpg`));
  if (input.audio) form.append("audio", input.audio, "voice-note.wav");

  const res = await apiRequest<ExtractionResult>("/api/v1/ai/listing-extract", { method: "POST", body: form });
  if (!res.success) throw new Error(res.error?.message ?? "The AI assistant is unavailable right now");
  return res.data;
}

/** Downscales a photo to a JPEG no larger than `maxSide` — keeps uploads small and fast. */
export async function shrinkImage(file: File, maxSide = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not read that image"))), "image/jpeg", 0.85)
  );
}
