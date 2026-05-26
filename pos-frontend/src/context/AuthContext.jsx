import { createContext, useContext, useState } from 'react';
import { login as apiLogin, logout as apiLogout } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pos_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const loginFn = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await apiLogin({ email, password });
      localStorage.setItem('pos_token', data.token);
      localStorage.setItem('pos_user',  JSON.stringify(data.user));
      setUser(data.user);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Login failed.' };
    } finally {
      setLoading(false);
    }
  };

  const logoutFn = async () => {
    try { await apiLogout(); } catch {}
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    setUser(null);
  };

  const isAdmin   = user?.role === 'admin';
  const isCashier = user?.role === 'cashier';

  return (
    <AuthContext.Provider value={{ user, loading, login: loginFn, logout: logoutFn, isAdmin, isCashier }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
