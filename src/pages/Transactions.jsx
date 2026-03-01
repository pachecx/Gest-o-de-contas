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

function monthFromISO(dateISO) {
  // "2026-02-28" -> "2026-02"
  return String(dateISO || "").slice(0, 7);
}

export default function Transactions() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    date: "",
    description: "",
    amount: "",
    kind: "expense",
    category: "",
    accountId: "",
  });
  const [editError, setEditError] = useState("");

  // filtros
  const [filters, setFilters] = useState({
    q: "",
    kind: "all", // all | income | expense
    accountId: "all",
    month: "all", // "YYYY-MM" ou "all"
  });

  useEffect(() => {
    ensureSeedData();
    setAccounts(load("gc_accounts", []));
    setTransactions(load("gc_transactions", []));
  }, []);

  function handleDelete(id) {
    const tx = transactions.find((t) => t.id === id);
    const ok = window.confirm(`Excluir "${tx?.description ?? "transação"}"?`);
    if (!ok) return;

    const next = transactions.filter((t) => t.id !== id);
    setTransactions(next);
    save("gc_transactions", next);
  }

  function startEdit(tx) {
    setEditError("");
    setEditingId(tx.id);
    setEditForm({
      date: tx.date,
      description: tx.description,
      amount: String(tx.amount),
      kind: tx.kind,
      category: tx.category,
      accountId: tx.accountId,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError("");
  }

  function validateEdit() {
    if (!editForm.date) return "Informe a data.";
    if (!editForm.description.trim()) return "Informe a descrição.";
    if (!editForm.accountId) return "Selecione uma conta.";

    const amount = Number(editForm.amount);
    if (!editForm.amount || Number.isNaN(amount))
      return "Informe um valor válido.";
    if (amount <= 0) return "O valor deve ser maior que 0.";

    return "";
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    setEditError("");

    const msg = validateEdit();
    if (msg) return setEditError(msg);

    const next = transactions.map((t) =>
      t.id === editingId
        ? {
            ...t,
            date: editForm.date,
            description: editForm.description.trim(),
            amount: Number(editForm.amount),
            kind: editForm.kind,
            category: editForm.category.trim() || "Outros",
            accountId: editForm.accountId,
          }
        : t,
    );

    setTransactions(next);
    save("gc_transactions", next);
    cancelEdit();
  }

  const monthsAvailable = useMemo(() => {
    const set = new Set(
      transactions.map((t) => monthFromISO(t.date)).filter(Boolean),
    );
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();

    return transactions
      .filter((t) => {
        if (filters.kind !== "all" && t.kind !== filters.kind) return false;
        if (filters.accountId !== "all" && t.accountId !== filters.accountId)
          return false;
        if (filters.month !== "all" && monthFromISO(t.date) !== filters.month)
          return false;

        if (q) {
          const hay = `${t.description} ${t.category} ${t.date}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, filters]);

  const totalInView = useMemo(() => {
    // soma entradas - saídas dentro do filtro (útil pra “saldo do período”)
    let total = 0;
    for (const t of filtered) {
      const amt = Number(t.amount || 0);
      total += t.kind === "income" ? amt : -amt;
    }
    return total;
  }, [filtered]);

  function accountName(accountId) {
    return accounts.find((a) => a.id === accountId)?.name ?? "—";
  }

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Transações</h1>
          <p className="text-sm text-slate-300">
            Lista completa com filtros e exclusão.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">Total no filtro</div>
          <div className="text-xl font-semibold">{formatBRL(totalInView)}</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <label className="text-sm text-slate-200">Busca</label>
            <input
              value={filters.q}
              onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
              placeholder="descrição, categoria, data..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-200">Tipo</label>
            <select
              value={filters.kind}
              onChange={(e) =>
                setFilters((p) => ({ ...p, kind: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
            >
              <option value="all">Todos</option>
              <option value="income">Entrada</option>
              <option value="expense">Saída</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-200">Conta</label>
            <select
              value={filters.accountId}
              onChange={(e) =>
                setFilters((p) => ({ ...p, accountId: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
            >
              <option value="all">Todas</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-200">Mês</label>
            <select
              value={filters.month}
              onChange={(e) =>
                setFilters((p) => ({ ...p, month: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
            >
              <option value="all">Todos</option>
              {monthsAvailable.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() =>
              setFilters({ q: "", kind: "all", accountId: "all", month: "all" })
            }
            className="rounded-xl border border-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 transition"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="font-semibold">Resultados</div>
          <div className="text-xs text-slate-400">
            {filtered.length} item(ns)
          </div>
        </div>

        {editingId && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Editar transação</h2>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-sm text-slate-300 hover:text-slate-100"
              >
                Fechar
              </button>
            </div>

            <form
              onSubmit={handleSaveEdit}
              className="mt-4 grid gap-3 sm:grid-cols-2"
            >
              <div className="space-y-1">
                <label className="text-sm text-slate-200">Data</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, date: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-200">Tipo</label>
                <select
                  value={editForm.kind}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, kind: e.target.value }))
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
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-200">Valor</label>
                <input
                  value={editForm.amount}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, amount: e.target.value }))
                  }
                  inputMode="decimal"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-200">Conta</label>
                <select
                  value={editForm.accountId}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, accountId: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-sm text-slate-200">Categoria</label>
                <input
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, category: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
                />
              </div>

              {editError && (
                <div className="sm:col-span-2 rounded-xl border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
                  {editError}
                </div>
              )}

              <div className="sm:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-xl border border-slate-800 px-3 py-2 text-slate-200 hover:bg-slate-900 transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-slate-100 px-3 py-2 text-slate-950 font-medium hover:bg-white transition"
                >
                  Salvar alterações
                </button>
              </div>
            </form>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="px-4 py-4 text-sm text-slate-300">
            Nenhuma transação encontrada com esses filtros.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filtered.map((tx) => {
              const sign = tx.kind === "income" ? "+" : "-";
              const amount = `${sign} ${formatBRL(tx.amount)}`;

              return (
                <div
                  key={tx.id}
                  className="px-4 py-3 flex justify-between gap-4"
                >
                  <div>
                    <div className="font-medium">{tx.description}</div>
                    <div className="text-xs text-slate-400">
                      {tx.date} • {tx.category} • {accountName(tx.accountId)}
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
                      onClick={() => handleDelete(tx.id)}
                      className="mt-1 text-xs text-slate-400 hover:text-slate-200 transition mr-2.5"
                    >
                      Excluir
                    </button>

                    <button
                      type="button"
                      onClick={() => startEdit(tx)}
                      className="mt-1 mr-3 text-xs text-slate-400 hover:text-slate-200 transition"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
