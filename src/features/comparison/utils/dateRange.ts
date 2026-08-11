import dayjs, { Dayjs } from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

export const DEFAULT_RANGE: [Dayjs, Dayjs] = [
  dayjs().subtract(29, "day"),
  dayjs(),
];

export const RANGE_PRESETS: Array<{ label: string; value: [Dayjs, Dayjs] }> = [
  { label: "Last 7 days", value: [dayjs().subtract(6, "day"), dayjs()] },
  { label: "Last 30 days", value: [dayjs().subtract(29, "day"), dayjs()] },
  { label: "Last 90 days", value: [dayjs().subtract(89, "day"), dayjs()] },
];

/** Parses the `from`/`to` query params, falling back to the default range if
 * either is missing, invalid, or out of order. */
export function normalizeRange(
  from: string | null,
  to: string | null,
): [Dayjs, Dayjs] {
  const parsedFrom = from ? dayjs(from) : null;
  const parsedTo = to ? dayjs(to) : null;

  const isValidRange =
    parsedFrom !== null &&
    parsedTo !== null &&
    parsedFrom.isValid() &&
    parsedTo.isValid() &&
    parsedFrom.isSameOrBefore(parsedTo);

  return isValidRange ? [parsedFrom, parsedTo] : DEFAULT_RANGE;
}

/** Every calendar day from `from` to `to`, inclusive, as `YYYY-MM-DD` strings. */
export function buildDateRange(from: Dayjs, to: Dayjs): string[] {
  const dates: string[] = [];
  let current = from.startOf("day");
  const end = to.startOf("day");

  while (current.isSameOrBefore(end, "day")) {
    dates.push(current.format("YYYY-MM-DD"));
    current = current.add(1, "day");
  }
  return dates;
}

/** The immediately preceding period of the same length, used for the
 * period-over-period comparison (e.g. "last 30 days" -> the 30 days before that). */
export function getPreviousRange([from, to]: [Dayjs, Dayjs]): [Dayjs, Dayjs] {
  const days = to.diff(from, "day") + 1;
  return [from.subtract(days, "day"), from.subtract(1, "day")];
}
