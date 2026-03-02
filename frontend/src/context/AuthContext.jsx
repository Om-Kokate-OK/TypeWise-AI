import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    localStorage.getItem("token") || null
  );

  // Track how many tests the guest has completed (resets on page reload)
  const [guestTestCount, setGuestTestCount] = useState(0);

  const isGuest = !user;

  const incrementGuestTestCount = () =>
    setGuestTestCount((c) => c + 1);

  const login = (token) => {
    localStorage.setItem("token", token);
    setUser(token);
    // Carry over any temp session data after login
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("guestSessions");
    setUser(null);
    setGuestTestCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        guestTestCount,
        incrementGuestTestCount,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}