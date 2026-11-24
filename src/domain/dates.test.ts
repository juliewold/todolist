import { describe, expect, it } from "vitest";
import {
  addDays,
  daysInMonth,
  diffDays,
  isIsoDate,
  isoDateOf,
  startOfIsoWeek,
  toIsoDate,
} from "./dates";

describe("toIsoDate", () => {
  it("formats a local date with zero padding", () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("isIsoDate", () => {
  it("accepts real calendar dates only", () => {
    expect(isIsoDate("2026-02-28")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("24.11.2026")).toBe(false);
  });
});

describe("addDays and diffDays", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("counts calendar days", () => {
    expect(diffDays("2026-11-20", "2026-11-24")).toBe(4);
    expect(diffDays("2026-11-24", "2026-11-20")).toBe(-4);
  });
});

describe("startOfIsoWeek", () => {
  it("returns the Monday of the week", () => {
    expect(startOfIsoWeek("2026-11-24")).toBe("2026-11-23");
    expect(startOfIsoWeek("2026-11-29")).toBe("2026-11-23");
    expect(startOfIsoWeek("2026-11-23")).toBe("2026-11-23");
  });
});

describe("daysInMonth", () => {
  it("handles leap years", () => {
    expect(daysInMonth(2028, 1)).toBe(29);
    expect(daysInMonth(2026, 1)).toBe(28);
    expect(daysInMonth(2026, 10)).toBe(30);
  });
});

describe("isoDateOf", () => {
  it("builds ISO dates from year, month index and day", () => {
    expect(isoDateOf(2026, 10, 4)).toBe("2026-11-04");
  });
});
