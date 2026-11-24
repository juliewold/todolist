import { describe, expect, it } from "vitest";
import {
  computeHabitStats,
  countActiveDaysPerMonth,
  getUnitLabel,
  getEntryValue,
  getGoalProgress,
  getIntensityLevel,
  getLegendLabel,
  getRepresentativeValue,
} from "./habits";
import type { Habit, HabitEntry } from "./types";

const duration: Habit = {
  id: "h1",
  name: "Trening",
  icon: "dumbbell",
  color: "rose",
  kind: "duration",
  unit: "min",
  target: 30,
  goalPeriod: "daily",
  position: 0,
};

const yesNo: Habit = { ...duration, id: "h2", kind: "yesNo", target: null };

const weekly: Habit = { ...duration, id: "h3", kind: "quantity", goalPeriod: "weekly", target: 3 };

function entry(habitId: string, date: string, value: number): HabitEntry {
  return { id: `${habitId}-${date}`, habitId, date, value };
}

describe("getIntensityLevel", () => {
  it("returns 0 for empty values", () => {
    expect(getIntensityLevel(duration, 0)).toBe(0);
    expect(getIntensityLevel(yesNo, 0)).toBe(0);
  });

  it("maps durations to the legend buckets", () => {
    expect(getIntensityLevel(duration, 1)).toBe(1);
    expect(getIntensityLevel(duration, 15)).toBe(1);
    expect(getIntensityLevel(duration, 16)).toBe(2);
    expect(getIntensityLevel(duration, 30)).toBe(2);
    expect(getIntensityLevel(duration, 31)).toBe(3);
    expect(getIntensityLevel(duration, 45)).toBe(3);
    expect(getIntensityLevel(duration, 46)).toBe(4);
    expect(getIntensityLevel(duration, 60)).toBe(4);
    expect(getIntensityLevel(duration, 61)).toBe(5);
  });

  it("maps quantities relative to the target", () => {
    expect(getIntensityLevel(weekly, 0.5)).toBe(1);
    expect(getIntensityLevel(weekly, 1)).toBe(2);
    expect(getIntensityLevel(weekly, 2)).toBe(3);
    expect(getIntensityLevel(weekly, 3)).toBe(5);
  });

  it("uses a single strong level for yes/no habits", () => {
    expect(getIntensityLevel(yesNo, 1)).toBe(4);
  });
});

describe("getRepresentativeValue", () => {
  it("returns a value that falls into the chosen duration level", () => {
    for (const level of [1, 2, 3, 4, 5] as const) {
      const value = getRepresentativeValue(duration, level);
      expect(getIntensityLevel(duration, value)).toBe(level);
    }
  });

  it("returns a value that falls into the chosen quantity level", () => {
    for (const level of [1, 2, 3, 4, 5] as const) {
      const value = getRepresentativeValue(weekly, level);
      expect(getIntensityLevel(weekly, value)).toBe(level);
    }
  });

  it("returns 0 for level 0", () => {
    expect(getRepresentativeValue(duration, 0)).toBe(0);
  });
});

describe("getLegendLabel", () => {
  it("uses Norwegian labels for duration habits", () => {
    expect(getLegendLabel(duration, 0)).toBe("Ingen trening");
    expect(getLegendLabel(duration, 3)).toBe("31–45 min");
    expect(getLegendLabel(duration, 5)).toBe("Over 60 min");
  });
});

describe("getGoalProgress", () => {
  it("caps progress at 1 for daily goals", () => {
    const entries = [entry("h1", "2026-11-24", 45)];
    expect(getGoalProgress(duration, entries, "2026-11-24")).toBe(1);
    expect(getGoalProgress(duration, entries, "2026-11-23")).toBe(0);
  });

  it("sums entries across the ISO week for weekly goals", () => {
    const entries = [
      entry("h3", "2026-11-23", 1),
      entry("h3", "2026-11-25", 1),
      entry("h3", "2026-11-29", 1),
    ];
    expect(getGoalProgress(weekly, entries, "2026-11-26")).toBe(1);
    expect(getEntryValue(entries, "h3", "2026-11-25")).toBe(1);
  });
});

describe("computeHabitStats", () => {
  const today = "2026-11-24";

  it("counts active days and averages values in the given year", () => {
    const entries = [
      entry("h1", "2026-01-02", 20),
      entry("h1", "2026-11-24", 40),
      entry("h1", "2025-12-31", 90),
      entry("h1", "2026-11-23", 0),
    ];
    const stats = computeHabitStats(duration, entries, today, 2026);
    expect(stats.activeDays).toBe(2);
    expect(stats.totalValue).toBe(60);
    expect(stats.averageValue).toBe(30);
  });

  it("counts a current daily streak that ends today", () => {
    const entries = [
      entry("h1", "2026-11-22", 30),
      entry("h1", "2026-11-23", 30),
      entry("h1", "2026-11-24", 30),
    ];
    expect(computeHabitStats(duration, entries, today).currentStreak).toBe(3);
  });

  it("keeps the streak alive when today is not yet logged", () => {
    const entries = [entry("h1", "2026-11-22", 30), entry("h1", "2026-11-23", 30)];
    expect(computeHabitStats(duration, entries, today).currentStreak).toBe(2);
  });

  it("resets the current streak after a missed day", () => {
    const entries = [entry("h1", "2026-11-20", 30), entry("h1", "2026-11-22", 30)];
    expect(computeHabitStats(duration, entries, today).currentStreak).toBe(0);
  });

  it("finds the longest streak across the history", () => {
    const entries = [
      entry("h1", "2026-11-01", 30),
      entry("h1", "2026-11-02", 30),
      entry("h1", "2026-11-03", 30),
      entry("h1", "2026-11-10", 30),
      entry("h1", "2026-11-11", 30),
    ];
    const stats = computeHabitStats(duration, entries, today);
    expect(stats.longestStreak).toBe(3);
    expect(stats.currentStreak).toBe(0);
  });

  it("counts weekly streaks by ISO week", () => {
    const entries = [
      entry("h3", "2026-11-16", 3),
      entry("h3", "2026-11-19", 3),
      entry("h3", "2026-11-23", 3),
    ];
    const stats = computeHabitStats(weekly, entries, today);
    expect(stats.currentStreak).toBe(2);
    expect(stats.longestStreak).toBe(2);
  });

  it("ignores entries for other habits", () => {
    const entries = [entry("other", today, 30)];
    expect(computeHabitStats(duration, entries, today).activeDays).toBe(0);
  });
});

describe("countActiveDaysPerMonth", () => {
  it("counts registered days per month", () => {
    const entries = [
      entry("h1", "2026-01-02", 20),
      entry("h1", "2026-11-03", 20),
      entry("h1", "2026-11-04", 0),
      entry("h1", "2025-11-04", 20),
    ];
    const counts = countActiveDaysPerMonth(entries, "h1", 2026);
    expect(counts[0]).toBe(1);
    expect(counts[10]).toBe(1);
    expect(counts.reduce((sum, value) => sum + value, 0)).toBe(2);
  });
});

describe("getUnitLabel", () => {
  it("describes the unit for each habit kind", () => {
    expect(getUnitLabel(duration)).toBe("minutter");
    expect(getUnitLabel(yesNo)).toBe("");
    expect(getUnitLabel(weekly)).toBe("min");
  });
});
