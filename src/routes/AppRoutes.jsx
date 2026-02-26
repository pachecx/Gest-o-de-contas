import { Route, Routes, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import App from "../App";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../auth/AuthContext";
import Register from "../pages/Register";

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      />

      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      <Route path="/register" element={<Register />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
