import { useMemo, useRef, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, DollarSign, FileDown, FileSpreadsheet, LogOut, Percent, Printer, ShoppingCart, TrendingUp, Upload, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MONTHS, brl, buildModel, sampleDataset, valueAt, type Dataset } from "@/lib/forecast";
import { parseWorkbook } from "@/lib/excel";

const C = { green: "var(--chart-1)", orange: "var(--chart-2)", gray: "var(--chart-3)" };
const PIE = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const tip = { contentStyle: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" } };

function Kpi({ label, value, delta, icon: Icon, tone }: { label: string; value: string; delta: number; icon: typeof DollarSign; tone: "primary" | "accent" }) {
  const up = delta >= 0;
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">{label}
        <span className={tone === "primary" ? "rounded-lg bg-primary/15 p-2 text-primary" : "rounded-lg bg-accent/15 p-2 text-accent"}><Icon className="h-4 w-4" /></span>
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className={`mt-1 flex items-center gap-1 text-xs ${up ? "text-primary" : "text-accent"}`}>
        {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{Math.abs(delta).toFixed(1)}% vs mês anterior
      </div>
    </div>
  );
}

export function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [data, setData] = useState<Dataset>(sampleDataset);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [tab, setTab] = useState("overview");
  const fileRef = useRef<HTMLInputElement>(null);

  const model = useMemo(() => buildModel(data.months), [data]);
  const firstM = data.months[0]!, lastM = data.months[data.months.length - 1]!;
  const firstYear = firstM.year;
  const years = Array.from({ length: Math.max(now.getFullYear() + 10, year + 2) - firstYear + 1 }, (_, i) => firstYear + i);

  const cur = valueAt(data.months, model, year, month);
  const prev = month === 1 ? valueAt(data.months, model, year - 1, 12) : valueAt(data.months, model, year, month - 1);
  const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0);
  const margin = cur.revenue ? ((cur.revenue - cur.expenses) / cur.revenue) * 100 : 0;
  const prevMargin = prev.revenue ? ((prev.revenue - prev.expenses) / prev.revenue) * 100 : 0;

  const series = useMemo(() => {
    const out = [];
    const start = firstM.year * 12 + firstM.month - 1;
    const end = Math.max(year * 12 + month - 1, lastM.year * 12 + lastM.month - 1 + 6);
    for (let i = start; i <= end; i++) {
      const p = valueAt(data.months, model, Math.floor(i / 12), (i % 12) + 1);
      out.push({ label: `${MONTHS[p.month - 1]!.slice(0, 3)}/${String(p.year).slice(2)}`, ...p,
        histRev: p.forecast ? null : p.revenue, prevRev: p.forecast ? p.revenue : null,
        histExp: p.forecast ? null : p.expenses, prevExp: p.forecast ? p.expenses : null });
    }
    return out;
  }, [data, model, year, month, firstM, lastM]);

  const yearRows = MONTHS.map((_, i) => valueAt(data.months, model, year, i + 1));

  const onFile = async (f?: File) => {
    if (!f) return;
    try { const d = await parseWorkbook(f); setData(d); toast.success(`Planilha "${f.name}" carregada`, { description: `${d.months.length} meses, ${d.categories.length} categorias` }); setTab("overview"); }
    catch (e) { toast.error("Não foi possível ler a planilha", { description: (e as Error).message }); }
    if (fileRef.current) fileRef.current.value = "";
  };

  const exportCsv = () => {
    const rows = [["Ano", "Mês", "Faturamento", "Gastos", "Vendas", "Tipo"], ...yearRows.map((r) => [r.year, MONTHS[r.month - 1], r.revenue, r.expenses, r.sales, r.forecast ? "Previsão" : "Histórico"])];
    const blob = new Blob([rows.map((r) => r.join(";")).join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `relatorio-${year}.csv`; a.click();
    toast.success("CSV exportado");
  };

  const cats = data.categories.length ? data.categories : sampleDataset().categories;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary"><TrendingUp className="h-5 w-5" /></div>
          <div><h1 className="text-xl font-bold">DemandaPro</h1><p className="text-xs text-muted-foreground">Fonte: {data.source}</p></div>
        </div>
        <div className="no-print flex flex-wrap items-center gap-2">
          <Select value={String(month)} onValueChange={(v) => setMonth(+v)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>{MONTHS.map((m, i) => <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(+v)}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="secondary" size="sm" onClick={exportCsv}><FileDown /> CSV</Button>
          <Button variant="secondary" size="sm" onClick={() => window.print()}><Printer /> PDF</Button>
          <Button variant="ghost" size="sm" onClick={onLogout}><LogOut /> Sair</Button>
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="no-print mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="admin">Atualização de Dados</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{MONTHS[month - 1]} de {year}</span>
            <span className={cur.forecast ? "rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent" : "rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary"}>{cur.forecast ? "Previsão" : "Histórico"}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Faturamento Bruto" value={brl(cur.revenue)} delta={pct(cur.revenue, prev.revenue)} icon={DollarSign} tone="primary" />
            <Kpi label="Gastos" value={brl(cur.expenses)} delta={pct(cur.expenses, prev.expenses)} icon={Wallet} tone="accent" />
            <Kpi label="Quantidade de Vendas" value={cur.sales.toLocaleString("pt-BR")} delta={pct(cur.sales, prev.sales)} icon={ShoppingCart} tone="primary" />
            <Kpi label="Margem Estimada" value={`${margin.toFixed(1)}%`} delta={margin - prevMargin} icon={Percent} tone="primary" />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 font-semibold">Histórico vs. Previsão</h2>
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.green} stopOpacity={0.4} /><stop offset="100%" stopColor={C.green} stopOpacity={0} /></linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.orange} stopOpacity={0.3} /><stop offset="100%" stopColor={C.orange} stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip {...tip} formatter={(v: number) => brl(v)} />
                <Legend />
                <Area name="Faturamento" dataKey="histRev" stroke={C.green} fill="url(#g1)" strokeWidth={2} />
                <Area name="Faturamento (previsão)" dataKey="prevRev" stroke={C.green} strokeDasharray="5 4" fill="none" strokeWidth={2} />
                <Area name="Gastos" dataKey="histExp" stroke={C.orange} fill="url(#g2)" strokeWidth={2} />
                <Area name="Gastos (previsão)" dataKey="prevExp" stroke={C.orange} strokeDasharray="5 4" fill="none" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 font-semibold">Resumo de {year}</h2>
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground"><tr><th className="py-2">Mês</th><th>Faturamento</th><th>Gastos</th><th>Vendas</th><th>Tipo</th></tr></thead>
              <tbody>{yearRows.map((r) => (
                <tr key={r.month} className={`border-t border-border ${r.month === month ? "bg-primary/10" : ""}`}>
                  <td className="py-2">{MONTHS[r.month - 1]}</td><td className="text-primary">{brl(r.revenue)}</td><td className="text-accent">{brl(r.expenses)}</td><td>{r.sales.toLocaleString("pt-BR")}</td>
                  <td className="text-muted-foreground">{r.forecast ? "Previsão" : "Histórico"}</td>
                </tr>))}</tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 font-semibold">Faturamento por Categoria</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={cats}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip {...tip} formatter={(v: number) => brl(v)} cursor={{ fill: "var(--muted)" }} />
                <Bar name="Faturamento" dataKey="revenue" fill={C.green} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 font-semibold">Quantidade Vendida por Categoria</h2>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={cats} dataKey="quantity" nameKey="name" innerRadius={60} outerRadius={110} paddingAngle={2}>
                  {cats.map((c, i) => <Cell key={c.name} fill={PIE[i % PIE.length]} stroke="var(--card)" />)}
                </Pie>
                <Tooltip {...tip} formatter={(v: number) => v.toLocaleString("pt-BR")} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="admin">
          <div
            className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border bg-card p-12 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
          >
            <div className="rounded-xl bg-primary/15 p-4 text-primary"><FileSpreadsheet className="h-8 w-8" /></div>
            <h2 className="text-lg font-semibold">Carregar nova planilha (.xlsx)</h2>
            <p className="max-w-md text-sm text-muted-foreground">Abas reconhecidas: <b>Faturamento</b> (Ano, Mês, Faturamento, Quantidade), <b>Gastos</b> (Ano, Mês, Valor) e <b>Categorias</b> (Categoria, Faturamento, Quantidade). O arquivo é lido apenas no seu navegador.</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" hidden onChange={(e) => onFile(e.target.files?.[0])} />
            <div className="flex gap-2">
              <Button onClick={() => fileRef.current?.click()}><Upload /> Selecionar arquivo</Button>
              <Button variant="secondary" onClick={() => { setData(sampleDataset()); toast.success("Dados de exemplo restaurados"); }}>Restaurar exemplo</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
