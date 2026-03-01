import { useState } from "react";
import Header from "./components/Header";
import Dashboard from "./pages/DashBoard";
import Transactions from "./pages/Transactions";

export default function App() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("dashboard")}
            className={[
              "rounded-xl px-3 py-2 text-sm transition",
              tab === "dashboard"
                ? "bg-slate-100 text-slate-950"
                : "border border-slate-800 text-slate-200 hover:bg-slate-900",
            ].join(" ")}
          >
            Dashboard
          </button>

          <button
            onClick={() => setTab("transactions")}
            className={[
              "rounded-xl px-3 py-2 text-sm transition",
              tab === "transactions"
                ? "bg-slate-100 text-slate-950"
                : "border border-slate-800 text-slate-200 hover:bg-slate-900",
            ].join(" ")}
          >
            Transações
          </button>
        </div>

        {tab === "dashboard" && <Dashboard />}
        {tab === "transactions" && <Transactions />}
      </main>
    </div>
  );
}
