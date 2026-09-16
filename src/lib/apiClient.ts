type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = { success: false; error: { code: string; message: string; details?: unknown } };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

let storedCsrfToken: string | undefined;
let storedAccessToken: string | undefined;

export function setCsrfToken(token: string) {
  storedCsrfToken = token;
}

export function setAccessToken(token: string | undefined) {
  storedAccessToken = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("greenrev_access_token", token);
    else localStorage.removeItem("greenrev_access_token");
  }
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const parts = document.cookie.split(";").map((p) => p.trim());
  const match = parts.find((p) => p.startsWith(`${name}=`));
  if (!match) return undefined;
  return decodeURIComponent(match.slice(name.length + 1));
}

async function doFetch<T>(input: RequestInfo, init?: RequestInit): Promise<ApiResponse<T>> {
  const csrf = storedCsrfToken || getCookie("csrf_token");
  const headers = new Headers(init?.headers ?? {});
  headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && init?.body && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  if (csrf) {
    headers.set("X-CSRF-Token", csrf);
  }

  if (typeof window !== "undefined" && !storedAccessToken) {
    storedAccessToken = localStorage.getItem("greenrev_access_token") || undefined;
  }
  if (storedAccessToken) {
    headers.set("Authorization", `Bearer ${storedAccessToken}`);
  }

  const res = await fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });

  const text = await res.text();
  const json = text ? (JSON.parse(text) as ApiResponse<T>) : ({} as ApiResponse<T>);
  return json;
}

export async function apiRequest<T>(
  path: string,
  init?: Omit<RequestInit, "credentials">,
  options?: { retryOn401?: boolean },
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const response = await doFetch<T>(url, init);

  if (options?.retryOn401 === false) return response;

  if (!response || (response as ApiFailure).success === false) {
    const err = response as ApiFailure;
    if (err?.error?.code === "UNAUTHENTICATED") {
      const refreshed = await doFetch<{ user: unknown; csrfToken: string; accessToken: string }>(`${API_BASE}/api/v1/auth/refresh`, {
        method: "POST",
      });
      if (refreshed && (refreshed as any).success === true) {
        const token = (refreshed as any).data?.csrfToken;
        const accToken = (refreshed as any).data?.accessToken;
        if (token) setCsrfToken(token);
        if (accToken) setAccessToken(accToken);
        return doFetch<T>(url, init);
      }
    }
  }

  return response;
}

export function apiBaseUrl(): string {
  return API_BASE;
}

