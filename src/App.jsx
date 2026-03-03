import { useState } from "react";
import Header from "./components/Header";
import Dashboard from "./pages/DashBoard";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";

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

          <button
            onClick={() => setTab("accounts")}
            className={[
              "rounded-xl px-3 py-2 text-sm transition",
              tab === "accounts"
                ? "bg-slate-100 text-slate-950"
                : "border border-slate-800 text-slate-200 hover:bg-slate-900",
            ].join(" ")}
          >
            Contas
          </button>
        </div>

        {tab === "dashboard" && (
          <Dashboard onGoAccounts={() => setTab("accounts")} />
        )}
        {tab === "transactions" && (
          <Transactions
            onGoAccounts={() => setTab("accounts")}
            onGoDashboard={() => setTab("dashboard")}
          />
        )}
        {tab === "accounts" && <Accounts />}
      </main>
    </div>
  );
}
