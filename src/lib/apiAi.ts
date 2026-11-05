import { apiRequest, apiStream } from "./apiClient";
import { visitorId } from "./visitor";
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

/** An AI request the server refused or couldn't complete. `message` is safe to show users. */
export class AiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: { signedIn?: boolean; window?: "hour" | "day"; reason?: string }
  ) {
    super(message);
  }

  /** AI is switched off or misconfigured on the server — retrying won't help. */
  get offline() {
    return this.code === "AI_NOT_CONFIGURED" || this.code === "AI_KEY_INVALID" || this.code === "AI_OUT_OF_CREDIT";
  }
}

export type AiStatus = { available: boolean; reason: "not_configured" | "invalid_key" | "no_credit" | null };

export async function getAiStatus(): Promise<AiStatus> {
  const res = await apiRequest<AiStatus>("/api/v1/ai/status", { method: "GET" }, { retryOn401: false });
  // If the status check itself fails, don't block the feature — the real call will say why.
  return res.success ? res.data : { available: true, reason: null };
}

export type ConciergeTurn = { role: "user" | "assistant"; content: string };

/**
 * Streams the AI concierge reply from the server, calling onText with the text so far.
 * Throws AiError with a user-facing message on any failure.
 */
export async function streamConcierge(input: {
  messages: ConciergeTurn[];
  compareIds?: string[];
  onText: (textSoFar: string) => void;
  signal?: AbortSignal;
}): Promise<string> {
  let res: Response;
  try {
    res = await apiStream("/api/v1/ai/concierge", {
      method: "POST",
      // The device ID lets guests on a shared mobile IP have their own message allowance.
      body: JSON.stringify({ messages: input.messages, compareIds: input.compareIds ?? [], visitorId: visitorId() }),
      signal: input.signal,
    });
  } catch {
    throw new AiError("NETWORK_ERROR", "Can't reach GreenRev right now. Check your connection and try again.");
  }

  if (!res.ok || !res.body) {
    const json = await res.json().catch(() => null);
    throw new AiError(
      json?.error?.code ?? "AI_FAILED",
      json?.error?.message ?? "The concierge couldn't answer that. Please try again.",
      json?.error?.details
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      let event: { type: string; text?: string; code?: string; message?: string };
      try {
        event = JSON.parse(line.slice(6));
      } catch {
        continue;
      }
      if (event.type === "delta" && event.text) {
        text += event.text;
        input.onText(text);
      } else if (event.type === "error") {
        throw new AiError(event.code ?? "AI_FAILED", event.message ?? "The concierge stopped responding. Please try again.");
      }
    }
  }
  return text;
}

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
  if (!res.success) throw new AiError(res.error?.code ?? "AI_FAILED", res.error?.message ?? "The AI assistant is unavailable right now");
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
