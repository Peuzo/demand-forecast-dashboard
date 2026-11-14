import { describe, it, expect } from "vitest";
import { buildModel, valueAt, type MonthRecord } from "./forecast";

describe("forecast", () => {
  it("projects a perfect linear trend into the future", () => {
    const months: MonthRecord[] = [];
    for (let m = 1; m <= 24; m++) months.push({ year: 2024 + Math.floor((m - 1) / 12), month: ((m - 1) % 12) + 1, revenue: 1000 + m * 10, expenses: 500, sales: 10 });
    const p = valueAt(months, buildModel(months), 2026, 1);
    expect(p.forecast).toBe(true);
    expect(p.revenue).toBe(1250);
  });
  it("returns real data for historical months", () => {
    const months = [{ year: 2024, month: 1, revenue: 7, expenses: 3, sales: 1 }, { year: 2024, month: 2, revenue: 9, expenses: 3, sales: 1 }];
    expect(valueAt(months, buildModel(months), 2024, 2)).toMatchObject({ revenue: 9, forecast: false });
  });
});
