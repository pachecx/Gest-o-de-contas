import { useEffect, useMemo, useState } from "react";
import { ensureSeedData } from "../data/seed";
import { formatBRL } from "../utils/money";

function load(key, fallback) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: todayISO(),
    description: "",
    amount: "",
    kind: "expense", // expense | income
    category: "Outros",
    accountId: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    ensureSeedData();
    const acc = load("gc_accounts", []);
    const tx = load("gc_transactions", []);

    setAccounts(acc);
    setTransactions(tx);

    // seta conta padrão no form
    if (acc.length > 0) {
      setForm((prev) => ({ ...prev, accountId: acc[0].id }));
    }
  }, []);

  const computed = useMemo(() => {
    const byAccount = new Map();
    for (const acc of accounts) {
      byAccount.set(acc.id, {
        ...acc,
        balance: Number(acc.initialBalance || 0),
      });
    }

    for (const tx of transactions) {
      const acc = byAccount.get(tx.accountId);
      if (!acc) continue;

      const amt = Number(tx.amount || 0);
      if (tx.kind === "income") acc.balance += amt;
      else acc.balance -= amt;
    }

    const accountsWithBalance = Array.from(byAccount.values());
    const total = accountsWithBalance.reduce((sum, a) => sum + a.balance, 0);

    const latest = [...transactions]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5);

    return { accountsWithBalance, total, latest };
  }, [accounts, transactions]);

  function validate() {
    if (!form.date) return "Informe a data.";
    if (!form.description.trim()) return "Informe a descrição.";
    if (!form.accountId) return "Selecione uma conta.";

    const amount = Number(form.amount);
    if (!form.amount || Number.isNaN(amount)) return "Informe um valor válido.";
    if (amount <= 0) return "O valor deve ser maior que 0.";

    return "";
  }

  function resetFormKeepAccount() {
    setForm((prev) => ({
      date: todayISO(),
      description: "",
      amount: "",
      kind: "expense",
      category: "Outros",
      accountId: prev.accountId || (accounts[0]?.id ?? ""),
    }));
  }

  function handleCreateTransaction(e) {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    const newTx = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      date: form.date,
      description: form.description.trim(),
      amount: Number(form.amount),
      kind: form.kind,
      category: form.category.trim() || "Outros",
      accountId: form.accountId,
    };

    const next = [newTx, ...transactions];
    setTransactions(next);
    save("gc_transactions", next);

    resetFormKeepAccount();
    setShowForm(false);
  }

  function handleDeleteTransaction(id) {
    const tx = transactions.find((t) => t.id === id);
    const ok = window.confirm(`Excluir "${tx?.description}"?`);
    if (!ok) return;

    const next = transactions.filter((t) => t.id !== id);
    setTransactions(next);
    save("gc_transactions", next);
  }

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-slate-300 text-sm">
            Visão geral das suas contas e movimentações.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">Saldo total</div>
          <div className="text-2xl font-semibold">
            {formatBRL(computed.total)}
          </div>
        </div>
      </div>

      {/* ação: nova transação */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setError("");
            setShowForm((v) => !v);
          }}
          className="rounded-xl bg-slate-100 px-3 py-2 text-slate-950 font-medium hover:bg-white transition cursor-pointer"
        >
          {showForm ? "Fechar" : "Nova transação"}
        </button>
      </div>

      {/* form */}
      {showForm && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="font-semibold">Adicionar transação</h2>

          <form
            onSubmit={handleCreateTransaction}
            className="mt-4 grid gap-3 sm:grid-cols-2"
          >
            <div className="space-y-1">
              <label className="text-sm text-slate-200">Data</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-200">Tipo</label>
              <select
                value={form.kind}
                onChange={(e) =>
                  setForm((p) => ({ ...p, kind: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
              >
                <option value="expense">Saída</option>
                <option value="income">Entrada</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm text-slate-200">Descrição</label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Ex: Mercado, Salário, Uber..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-200">Valor</label>
              <input
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
                inputMode="decimal"
                placeholder="Ex: 120.50"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
              />
              <div className="text-xs text-slate-400">
                Use ponto para decimais (ex.: 12.50)
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-200">Conta</label>
              <select
                value={form.accountId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, accountId: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm text-slate-200">Categoria</label>
              <input
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
                placeholder="Ex: Alimentação, Transporte..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
              />
            </div>

            {error && (
              <div className="sm:col-span-2 rounded-xl border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  resetFormKeepAccount();
                  setShowForm(false);
                }}
                className="rounded-xl border border-slate-800 px-3 py-2 text-slate-200 hover:bg-slate-900 transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-xl bg-slate-100 px-3 py-2 text-slate-950 font-medium hover:bg-white transition"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* cards de contas */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {computed.accountsWithBalance.map((acc) => (
          <div
            key={acc.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-300">{acc.type}</div>
                <div className="text-lg font-semibold">{acc.name}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Saldo</div>
                <div className="font-semibold">{formatBRL(acc.balance)}</div>
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-400">
              Saldo inicial: {formatBRL(acc.initialBalance)}
            </div>
          </div>
        ))}
      </div>

      {/* últimas transações */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h2 className="font-semibold">Últimas transações</h2>
          <span className="text-xs text-slate-400">
            (mostrando {computed.latest.length})
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {computed.latest.length === 0 ? (
            <div className="px-4 py-4 text-sm text-slate-300">
              Nenhuma transação ainda.
            </div>
          ) : (
            computed.latest.map((tx) => {
              const sign = tx.kind === "income" ? "+" : "-";
              const amount = `${sign} ${formatBRL(tx.amount)}`;

              return (
                <div
                  key={tx.id}
                  className="px-4 py-3 flex justify-between gap-3"
                >
                  <div>
                    <div className="font-medium">{tx.description}</div>
                    <div className="text-xs text-slate-400">
                      {tx.date} • {tx.category}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={[
                        "font-semibold",
                        tx.kind === "income"
                          ? "text-emerald-300"
                          : "text-rose-300",
                      ].join(" ")}
                    >
                      {amount}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteTransaction(tx.id)}
                      className="mt-1 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
