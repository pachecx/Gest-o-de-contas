import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("gc_user");
    return raw ? JSON.parse(raw) : null;
  });

  // salva login
  useEffect(() => {
    if (user) localStorage.setItem("gc_user", JSON.stringify(user));
    else localStorage.removeItem("gc_user");
  }, [user]);

  function login(userData) {
    setUser(userData);
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}