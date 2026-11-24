const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Formats a Date as a local ISO date string (YYYY-MM-DD). */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }
  const parsed = parseIsoDate(value);
  return toIsoDate(parsed) === value;
}

/** Parses an ISO date string as a local calendar date (midnight local time). */
export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

export function addDays(isoDate: string, days: number): string {
  const date = parseIsoDate(isoDate);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/** Number of calendar days from `from` to `to` (negative if `to` is earlier). */
export function diffDays(from: string, to: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((parseIsoDate(to).getTime() - parseIsoDate(from).getTime()) / msPerDay);
}

/** Returns the Monday of the ISO week that contains `isoDate`. */
export function startOfIsoWeek(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  const weekday = (date.getDay() + 6) % 7;
  return addDays(isoDate, -weekday);
}

export function getYear(isoDate: string): number {
  return parseIsoDate(isoDate).getFullYear();
}

export function getMonth(isoDate: string): number {
  return parseIsoDate(isoDate).getMonth();
}

export function getDayOfMonth(isoDate: string): number {
  return parseIsoDate(isoDate).getDate();
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function formatLongDate(isoDate: string, locale = "nb-NO"): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parseIsoDate(isoDate));
}

export function formatShortDate(isoDate: string, locale = "nb-NO"): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(parseIsoDate(isoDate));
}
