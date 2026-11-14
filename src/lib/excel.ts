import * as XLSX from "xlsx";
import type { CategoryRecord, Dataset, MonthRecord } from "./forecast";
import { MONTHS } from "./forecast";

const norm = (s: unknown) => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const num = (v: unknown) => typeof v === "number" ? v : Number(String(v ?? "").replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3})/g, "").replace(",", ".")) || 0;
const pick = (row: Record<string, unknown>, names: string[]) => {
  const k = Object.keys(row).find((key) => names.some((n) => norm(key).includes(n)));
  return k ? row[k] : undefined;
};
function parseMonth(v: unknown): number {
  if (typeof v === "number") return v >= 1 && v <= 12 ? v : 0;
  const s = norm(v);
  const i = MONTHS.findIndex((m) => s.startsWith(norm(m).slice(0, 3)));
  return i >= 0 ? i + 1 : Number(s) || 0;
}
function rowDate(row: Record<string, unknown>) {
  const d = pick(row, ["data", "periodo", "date"]);
  if (d instanceof Date) return { year: d.getFullYear(), month: d.getMonth() + 1 };
  if (typeof d === "string") { const m = d.match(/(\d{1,2})[/-](\d{4})/); if (m) return { year: +m[2], month: +m[1] }; }
  return { year: num(pick(row, ["ano", "year"])), month: parseMonth(pick(row, ["mes", "month"])) };
}

export async function parseWorkbook(file: File): Promise<Dataset> {
  const wb = XLSX.read(await file.arrayBuffer(), { cellDates: true });
  const sheet = (names: string[]) => {
    const n = wb.SheetNames.find((s) => names.some((x) => norm(s).includes(x)));
    return n ? XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[n]) : [];
  };
  const map = new Map<string, MonthRecord>();
  const get = (y: number, m: number) => {
    const k = `${y}-${m}`;
    if (!map.has(k)) map.set(k, { year: y, month: m, revenue: 0, expenses: 0, sales: 0 });
    return map.get(k)!;
  };
  const fat = sheet(["fatur", "receita", "venda"]);
  const gas = sheet(["gasto", "despesa", "custo"]);
  const first = fat.length ? fat : XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]]);
  for (const r of first) {
    const { year, month } = rowDate(r); if (!year || !month) continue;
    const rec = get(year, month);
    rec.revenue += num(pick(r, ["fatur", "receita", "bruto", "valor"]));
    rec.sales += num(pick(r, ["quant", "qtd", "vendas"]));
    const g = pick(r, ["gasto", "despesa", "custo"]); if (g !== undefined) rec.expenses += num(g);
  }
  for (const r of gas) {
    const { year, month } = rowDate(r); if (!year || !month) continue;
    get(year, month).expenses += num(pick(r, ["gasto", "despesa", "custo", "valor", "total"]));
  }
  const cats: CategoryRecord[] = sheet(["categ", "produto"]).map((r) => ({
    name: String(pick(r, ["categ", "produto", "nome"]) ?? ""),
    revenue: num(pick(r, ["fatur", "receita", "valor"])),
    quantity: num(pick(r, ["quant", "qtd"])),
  })).filter((c) => c.name);
  const months = [...map.values()].filter((m) => m.revenue > 0).sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month));
  if (months.length < 2) throw new Error("Não encontrei ao menos 2 meses com Ano, Mês e Faturamento.");
  return { months, categories: cats, source: file.name };
}
