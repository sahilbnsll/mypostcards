import type { LocationInfo, Postcard } from "@/content/types";

export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}

/** Dates arrive as `YYYY-MM-DD`. Parse as UTC so the day never shifts with the server's timezone. */
function parseDate(value: string): Date | null {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string, style: "month" | "long" = "long"): string {
  const date = parseDate(value);
  if (!date) return value;
  return date.toLocaleDateString("en-GB", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    ...(style === "long" ? { day: "numeric" } : {}),
  });
}

/** Exact date when known, otherwise the free-form period, otherwise nothing. */
export function formatWhen(item: Pick<Postcard, "takenOn" | "periodLabel">): string | undefined {
  if (item.takenOn) return formatDate(item.takenOn);
  return item.periodLabel || undefined;
}

export function formatRange(start?: string, end?: string, label?: string): string | undefined {
  if (start && end) {
    // A trip inside one month reads "17 to 20 May 2026"; longer ones stay month to month
    const a = parseDate(start);
    const b = parseDate(end);
    if (a && b && a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth()) {
      return a.getUTCDate() === b.getUTCDate() ? formatDate(end) : `${a.getUTCDate()} to ${formatDate(end)}`;
    }
    return `${formatDate(start, "month")} to ${formatDate(end, "month")}`;
  }
  if (start) return formatDate(start, "month");
  return label || undefined;
}

/** "Lago di Braies, Italy". Skips empty parts and repeated names. */
export function formatLocation(location: LocationInfo, parts: Array<keyof LocationInfo> = ["placeName", "city", "country"]): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const key of parts) {
    const value = location[key];
    if (typeof value !== "string" || !value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out.join(", ");
}

export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(3)}° ${latDir}, ${Math.abs(lng).toFixed(3)}° ${lngDir}`;
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}
