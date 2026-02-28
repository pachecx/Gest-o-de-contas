import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout(); 
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-800">
      <div className="font-semibold">Gestão de Contas</div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-300">{user?.email}</span>

        <button
          onClick={handleLogout}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          LogOut
        </button>
      </div>
    </div>
  );
}
