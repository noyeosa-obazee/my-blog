import { useState, useEffect } from "react";
import StatePanel from "../components/StatePanel";
import { AuthContext } from "./AuthContextValue";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser || typeof parsedUser !== "object") {
          throw new Error("Invalid saved user");
        }
        setUser(parsedUser);
        setToken(storedToken);
      }
    } catch {
      setSessionError(
        "Your saved session could not be restored. Please log in again.",
      );
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {loading ? (
        <StatePanel variant="loading" title="Restoring your session" />
      ) : (
        <>
          {sessionError && (
            <StatePanel
              variant="error"
              title="Session unavailable"
              message={sessionError}
            />
          )}
          {children}
        </>
      )}
    </AuthContext.Provider>
  );
};
