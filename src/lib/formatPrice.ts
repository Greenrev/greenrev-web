const ngn = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/**
 * Display a product price. The API often stores a bare number string ("90000000");
 * numbers and numeric strings become "₦90,000,000", anything else (e.g. "Price on request")
 * is shown as-is.
 */
export function formatPrice(price: string | number | null | undefined): string {
  if (price === null || price === undefined || price === "") return "Price on request";
  if (typeof price === "number") return ngn.format(price);
  const trimmed = price.trim();
  // Legacy values saved with a "$" or "₦" prefix and/or commas are normalised too.
  const numeric = trimmed.replace(/^[$₦]\s*/, "").replace(/,/g, "");
  if (/^\d+(\.\d+)?$/.test(numeric)) return ngn.format(Number(numeric));
  return trimmed;
}
