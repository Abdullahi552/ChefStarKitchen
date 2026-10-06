import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api';
import { TOKEN_KEY, USER_KEY, USE_MOCK } from '../api/client';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem(USER_KEY) || 'null'));
  const start = ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(USER_KEY, JSON.stringify(user)); setUser(user); return user;
  };
  const logout = () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); setUser(null); };

  // Re-validate the stored token with the backend on page load.
  useEffect(() => {
    if (!USE_MOCK && localStorage.getItem(TOKEN_KEY)) authApi.me().then((u) => { localStorage.setItem(USER_KEY, JSON.stringify(u)); setUser(u); }).catch(logout);
  }, []);

  const value = {
    user, logout, start,
    login: async (email, password) => start(await authApi.login(email, password)),
    register: async (data) => start(await authApi.register(data)),
    loginWithGoogle: async () => { if (USE_MOCK) return start(await authApi.mockGoogle()); window.location.assign(authApi.googleUrl); },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
