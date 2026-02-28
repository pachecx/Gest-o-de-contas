import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function loadUsers() {
  const raw = localStorage.getItem("gc_users");
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  localStorage.setItem("gc_users", JSON.stringify(users));
}

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!name.trim()) return "Informe seu nome.";
    if (!email.trim()) return "Informe o email.";
    if (!email.includes("@")) return "Email inválido.";
    if (password.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
    if (confirm !== password) return "As senhas não conferem.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) return setError(msg);

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const users = loadUsers();
    const emailLower = email.trim().toLowerCase();

    const exists = users.some((u) => u.email.toLowerCase() === emailLower);
    if (exists) {
      setLoading(false);
      return setError("Esse email já está cadastrado.");
    }

    const newUser = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: name.trim(),
      email: emailLower,
      password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    setLoading(false);

    // loga automaticamente (sem armazenar password no user do contexto)
    login({ name: newUser.name, email: newUser.email });
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg">
        <h1 className="text-2xl font-semibold">Criar conta</h1>
        <p className="mt-1 text-sm text-slate-300">
          Cadastre-se para usar o gestor.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-slate-200">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-200">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="voce@exemplo.com"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-200">Senha</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="mínimo 6 caracteres"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-200">Confirmar senha</label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
              placeholder="repita a senha"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-slate-100 px-3 py-2 text-slate-950 font-medium hover:bg-white transition disabled:opacity-60"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full rounded-xl border border-slate-800 px-3 py-2 text-slate-200 hover:bg-slate-900 transition"
          >
            Já tenho conta
          </button>

        </form>
      </div>
    </div>
  );
}
