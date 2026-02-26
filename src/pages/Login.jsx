import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function loadUsers() {
  const raw = localStorage.getItem("gc_users");
  return raw ? JSON.parse(raw) : [];
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!email.trim()) return "Informe o email.";
    if (!email.includes("@")) return "Email inválido.";
    if (!password) return "Informe a senha.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) return setError(msg);

    setLoading(true);
    await new Promise((r) => setTimeout(r, 350)); // simulando API

    const users = loadUsers();
    const emailLower = email.trim().toLowerCase();

    const found = users.find((u) => u.email.toLowerCase() === emailLower);

    if (!found) {
      setLoading(false);
      return setError("Usuário não encontrado. Crie uma conta primeiro.");
    }

    if (found.password !== password) {
      setLoading(false);
      return setError("Senha incorreta.");
    }

    setLoading(false);

    login({ name: found.name, email: found.email });
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg">
        <h1 className="text-2xl font-semibold">Entrar</h1>
        <p className="mt-1 text-sm text-slate-300">
          Acesse seu gestor de contas pessoais.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              placeholder="sua senha"
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
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/register")}
          className="mt-4 w-full rounded-xl bg-slate-800 px-3 py-2 text-slate-100 font-medium hover:bg-slate-700 transition"
        >
          Criar conta
        </button>

        <p className="mt-3 text-xs text-slate-400">
          * Login simulado usando <span className="font-mono">localStorage</span>.
        </p>
      </div>
    </div>
  );
}