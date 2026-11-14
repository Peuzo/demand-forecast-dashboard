import { useState } from "react";
import { Lock, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const PASSWORD = "admin123";

export function Login({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === PASSWORD) { toast.success("Bem-vindo!"); onSuccess(); }
    else toast.error("Senha incorreta");
  };
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary"><TrendingUp className="h-7 w-7" /></div>
          <h1 className="text-2xl font-bold">DemandaPro</h1>
          <p className="text-sm text-muted-foreground">Previsão de demanda e gestão financeira</p>
        </div>
        <label className="mb-2 block text-sm text-muted-foreground">Senha de acesso</label>
        <div className="relative mb-4">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="pl-9" placeholder="••••••••" autoFocus />
        </div>
        <Button type="submit" className="w-full">Entrar</Button>
        <p className="mt-4 text-center text-xs text-muted-foreground">Senha de teste: admin123</p>
      </form>
    </div>
  );
}
