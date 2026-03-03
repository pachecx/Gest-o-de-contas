import { useEffect, useMemo, useState } from "react";
import { ensureSeedData } from "../data/seed";
import { formatBRL, parseMoney } from "../utils/money";
import { useAuth } from "../auth/AuthContext";
import { loadUser, saveUser } from "../utils/storage";
function load(key, fallback) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const ACCOUNT_TYPES = [
  { value: "carteira", label: "Carteira" },
  { value: "banco", label: "Banco" },
  { value: "cartao", label: "Cartão" },
];

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
const { user } = useAuth();
  // criar
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    type: "banco",
    initialBalance: "",
  });
  const [createError, setCreateError] = useState("");

  // editar
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    type: "banco",
    initialBalance: "",
  });
  const [editError, setEditError] = useState("");

  // erro geral (ex: tentativa de excluir conta com transações)
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
  ensureSeedData(user.email);

  setAccounts(loadUser("gc_accounts", user.email, []));
  setTransactions(loadUser("gc_transactions", user.email, []));
}, [user.email]);

  const accountsWithBalance = useMemo(() => {
    const byId = new Map();
    for (const acc of accounts) {
      byId.set(acc.id, {
        ...acc,
        balance: Number(acc.initialBalance || 0),
      });
    }

    for (const tx of transactions) {
      const acc = byId.get(tx.accountId);
      if (!acc) continue;

      const amt = Number(tx.amount || 0);
      if (tx.kind === "income") acc.balance += amt;
      else acc.balance -= amt;
    }

    return Array.from(byId.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [accounts, transactions]);

  const total = useMemo(() => {
    return accountsWithBalance.reduce((sum, a) => sum + a.balance, 0);
  }, [accountsWithBalance]);

  const txCountByAccount = useMemo(() => {
    const map = new Map();
    for (const tx of transactions) {
      map.set(tx.accountId, (map.get(tx.accountId) || 0) + 1);
    }
    return map;
  }, [transactions]);

  // --------- CREATE ----------
  function validateCreate() {
    if (!createForm.name.trim()) return "Informe o nome da conta.";
    const initial = parseMoney(createForm.initialBalance);
    if (Number.isNaN(initial)) return "Saldo inicial inválido.";
    return "";
  }

  function resetCreateForm() {
    setCreateForm({ name: "", type: "banco", initialBalance: "" });
  }

  function handleCreateAccount(e) {
    e.preventDefault();
    setCreateError("");
    setGeneralError("");

    const msg = validateCreate();
    if (msg) return setCreateError(msg);

    const initial = parseMoney(createForm.initialBalance || 0);
    if (Number.isNaN(initial)) return setCreateError("Saldo inicial inválido.");

    const newAcc = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: createForm.name.trim(),
      type: createForm.type,
      initialBalance: initial,
    };
    const next = [...accounts, newAcc];
    setAccounts(next);
    saveUser("gc_accounts", user.email, next);

    resetCreateForm();
    setShowCreate(false);
  }

  // --------- EDIT ----------
  function startEdit(acc) {
    setGeneralError("");
    setEditError("");
    setEditingId(acc.id);
    setEditForm({
      name: acc.name,
      type: acc.type,
      initialBalance: String(acc.initialBalance ?? 0),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError("");
  }

  function validateEdit() {
    if (!editForm.name.trim()) return "Informe o nome da conta.";
    const initial = Number(editForm.initialBalance || 0);
    if (Number.isNaN(initial)) return "Saldo inicial inválido.";
    return "";
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    setEditError("");
    setGeneralError("");

    const msg = validateEdit();
    if (msg) return setEditError(msg);

    const next = accounts.map((a) =>
      a.id === editingId
        ? {
            ...a,
            name: editForm.name.trim(),
            type: editForm.type,
            initialBalance: parseMoney(editForm.initialBalance || 0),
          }
        : a,
    );

    setAccounts(next);
    save("gc_accounts", next);
    cancelEdit();
  }

  // --------- DELETE ----------
  function handleDeleteAccount(acc) {
    setGeneralError("");
    setCreateError("");
    setEditError("");

    const count = txCountByAccount.get(acc.id) || 0;
    if (count > 0) {
      setGeneralError(
        `Não é possível excluir "${acc.name}" porque existe(m) ${count} transação(ões) vinculada(s) a essa conta.`,
      );
      return;
    }

    const ok = window.confirm(`Excluir a conta "${acc.name}"?`);
    if (!ok) return;

    const next = accounts.filter((a) => a.id !== acc.id);
    setAccounts(next);
    save("gc_accounts", next);

    if (editingId === acc.id) cancelEdit();
  }

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Contas</h1>
          <p className="text-sm text-slate-300">
            Crie, edite e remova contas. O saldo é calculado (saldo inicial +
            transações).
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">Total em contas</div>
          <div className="text-xl font-semibold">{formatBRL(total)}</div>
        </div>
      </div>

      {generalError && (
        <div className="rounded-2xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {generalError}
        </div>
      )}

      {/* ação */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setGeneralError("");
            setCreateError("");
            setShowCreate((v) => !v);
          }}
          className="rounded-xl bg-slate-100 px-3 py-2 text-slate-950 font-medium hover:bg-white transition"
        >
          {showCreate ? "Fechar" : "Nova conta"}
        </button>
      </div>

      {/* form criar */}
      {showCreate && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="font-semibold">Adicionar conta</h2>

          <form
            onSubmit={handleCreateAccount}
            className="mt-4 grid gap-3 sm:grid-cols-2"
          >
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm text-slate-200">Nome</label>
              <input
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Ex: Nubank, Carteira, Inter..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-200">Tipo</label>
              <select
                value={createForm.type}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, type: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-200">Saldo inicial</label>
              <input
                value={createForm.initialBalance}
                onChange={(e) =>
                  setCreateForm((p) => ({
                    ...p,
                    initialBalance: e.target.value,
                  }))
                }
                inputMode="decimal"
                placeholder="Ex: 2500"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
              />
              <div className="text-xs text-slate-400">
                Use ponto para decimais (ex.: 120.50)
              </div>
            </div>

            {createError && (
              <div className="sm:col-span-2 rounded-xl border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
                {createError}
              </div>
            )}

            <div className="sm:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCreateError("");
                  resetCreateForm();
                  setShowCreate(false);
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

      {/* form editar */}
      {editingId && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Editar conta</h2>
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
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm text-slate-200">Nome</label>
              <input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-200">Tipo</label>
              <select
                value={editForm.type}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, type: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-200">Saldo inicial</label>
              <input
                value={editForm.initialBalance}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, initialBalance: e.target.value }))
                }
                inputMode="decimal"
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

      {/* lista */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {accountsWithBalance.map((acc) => {
          const count = txCountByAccount.get(acc.id) || 0;

          return (
            <div
              key={acc.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-400">{acc.type}</div>
                  <div className="text-lg font-semibold">{acc.name}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Saldo</div>
                  <div className="font-semibold">{formatBRL(acc.balance)}</div>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-400 flex justify-between">
                <span>Saldo inicial: {formatBRL(acc.initialBalance)}</span>
                <span>{count} tx</span>
              </div>

              <div className="mt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => startEdit(acc)}
                  className="rounded-xl border border-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-900 transition"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAccount(acc)}
                  className="rounded-xl border border-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-900 transition"
                >
                  Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {accountsWithBalance.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
          Nenhuma conta cadastrada.
        </div>
      )}
    </section>
  );
}
