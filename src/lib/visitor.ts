/** Anonymous, random per-browser ID for counting daily/weekly/monthly visitors. Not personal data. */
const KEY = "greenrev_visitor_id";

export function visitorId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = localStorage.getItem(KEY);
    if (!id || !/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
      id = (crypto.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9-]/g, "");
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null; // storage blocked (private mode) — visit just isn't counted
  }
}

/** Calendar day in Lagos (UTC+1), matching how the server counts days. */
export function lagosDay(at = Date.now()): string {
  return new Date(at + 60 * 60 * 1000).toISOString().slice(0, 10);
}
