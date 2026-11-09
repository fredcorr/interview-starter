/**
 * The client checks "today + N" in the user's timezone. The server can't know
 * that timezone, so it counts in UTC and allows one day of slack: the earliest
 * date that is "today + N" somewhere on Earth. Anything earlier is tampering.
 */
export const SERVER_DATE_SLACK_DAYS = 1;

export interface DateOptions {
  /** Validate as the server (UTC, with slack). */
  server?: boolean;
  now?: Date;
}

const pad = (value: number) => String(value).padStart(2, "0");

const toIsoDate = (year: number, monthIndex: number, day: number) => {
  // Date.UTC normalises overflow (e.g. 32 November becomes 2 December).
  const date = new Date(Date.UTC(year, monthIndex, day));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
};

/** Earliest allowed date as `YYYY-MM-DD`, also used as the native `min`. */
export const getMinDate = (
  daysFromToday: number,
  { server = false, now = new Date() }: DateOptions = {},
) =>
  server
    ? toIsoDate(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + daysFromToday - SERVER_DATE_SLACK_DAYS,
      )
    : toIsoDate(now.getFullYear(), now.getMonth(), now.getDate() + daysFromToday);

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True for a real calendar date in `YYYY-MM-DD` form. */
export const isIsoDate = (value: string) => {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  return toIsoDate(year, month - 1, day) === value;
};

/** `2026-11-11` to `11 November 2026`. */
export const formatIsoDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
