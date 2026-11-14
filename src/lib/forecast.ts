export type MonthRecord = { year: number; month: number; revenue: number; expenses: number; sales: number };
export type CategoryRecord = { name: string; revenue: number; quantity: number };
export type Dataset = { months: MonthRecord[]; categories: CategoryRecord[]; source: string };

export const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const seasonal = [0.85, 0.82, 0.9, 0.92, 0.95, 1.0, 1.02, 0.98, 0.97, 1.05, 1.15, 1.4];

export function sampleDataset(): Dataset {
  const months: MonthRecord[] = [];
  for (let y = 2023; y <= 2025; y++) for (let m = 1; m <= 12; m++) {
    const i = (y - 2023) * 12 + m;
    const base = 120000 + i * 1800;
    const noise = 1 + Math.sin(i * 1.7) * 0.04;
    const revenue = Math.round(base * (seasonal[m - 1] ?? 1) * noise);
    months.push({ year: y, month: m, revenue, expenses: Math.round(revenue * (0.62 + Math.cos(i) * 0.03)), sales: Math.round(revenue / 38) });
  }
  const categories: CategoryRecord[] = [
    ["Cerveja", 0.34, 9], ["Vinho", 0.14, 55], ["Whisky", 0.16, 120], ["Gin", 0.08, 85],
    ["Vodka", 0.09, 45], ["Refrigerante", 0.1, 7], ["Cigarro", 0.09, 12],
  ].map(([name, share, price]) => {
    const revenue = Math.round(1_800_000 * (share as number));
    return { name: name as string, revenue, quantity: Math.round(revenue / (price as number)) };
  });
  return { months, categories, source: "Dados de exemplo" };
}

const idx = (r: { year: number; month: number }) => r.year * 12 + (r.month - 1);

function regression(xs: number[], ys: number[]) {
  const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  xs.forEach((x, i) => { num += (x - mx) * ((ys[i] ?? 0) - my); den += (x - mx) ** 2; });
  const slope = den ? num / den : 0;
  return { slope, intercept: my - slope * mx };
}

/** Linear trend + monthly seasonal factor (actual / trend averaged per calendar month). */
export function buildModel(months: MonthRecord[]) {
  const keys = ["revenue", "expenses", "sales"] as const;
  const model = {} as Record<(typeof keys)[number], { slope: number; intercept: number; season: number[] }>;
  for (const k of keys) {
    const xs = months.map(idx), ys = months.map((r) => r[k]);
    const reg = regression(xs, ys);
    const sums = Array(12).fill(0), counts = Array(12).fill(0);
    months.forEach((r) => {
      const t = reg.intercept + reg.slope * idx(r);
      if (t > 0) { sums[r.month - 1] += r[k] / t; counts[r.month - 1]++; }
    });
    model[k] = { ...reg, season: sums.map((s, i) => (counts[i] ? s / counts[i] : 1)) };
  }
  return model;
}

export type Point = MonthRecord & { forecast: boolean };

export function valueAt(months: MonthRecord[], model: ReturnType<typeof buildModel>, year: number, month: number): Point {
  const real = months.find((r) => r.year === year && r.month === month);
  if (real) return { ...real, forecast: false };
  const x = year * 12 + month - 1;
  const f = (k: keyof typeof model) => Math.max(0, Math.round((model[k].intercept + model[k].slope * x) * (model[k].season[month - 1] ?? 1)));
  return { year, month, revenue: f("revenue"), expenses: f("expenses"), sales: f("sales"), forecast: true };
}

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
