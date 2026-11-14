import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Login } from "@/components/app/Login";
import { Dashboard } from "@/components/app/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DemandaPro — Previsão de Demanda" },
      { name: "description", content: "Previsão de demanda e gestão financeira com tendência e sazonalidade." },
      { property: "og:title", content: "DemandaPro — Previsão de Demanda" },
      { property: "og:description", content: "Previsão de demanda e gestão financeira com tendência e sazonalidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(sessionStorage.getItem("dp-auth") === "1"); }, []);
  const login = () => { sessionStorage.setItem("dp-auth", "1"); setAuthed(true); };
  const logout = () => { sessionStorage.removeItem("dp-auth"); setAuthed(false); };
  return authed ? <Dashboard onLogout={logout} /> : <Login onSuccess={login} />;
}
