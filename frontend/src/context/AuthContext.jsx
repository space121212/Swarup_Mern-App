
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { toast } from "sonner";

import api from "../api/axios";
import {
  setupInterceptors,
  refreshAccessTokenOnce,
} from "../api/setupInterceptor.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Keep the current token accessible without reinstalling interceptors.
  const accessTokenRef = useRef(null);
  const sessionExpiredRef = useRef(false);

  const setAccessToken = useCallback((token) => {
    accessTokenRef.current = token;
    setAccessTokenState(token);
  }, []);

  const handleSessionExpired = useCallback(() => {
    if (sessionExpiredRef.current) return;

    sessionExpiredRef.current = true;
    setUser(null);
    setAccessToken(null);
    toast.error("Your session has expired. Please log in again.");
  }, [setAccessToken]);

  useEffect(() => {
    const interceptorIds = setupInterceptors(
      () => accessTokenRef.current,
      setAccessToken,
      handleSessionExpired
    );

    return () => {
      api.interceptors.request.eject(
        interceptorIds.requestInterceptorId
      );
      api.interceptors.response.eject(
        interceptorIds.responseInterceptorId
      );
    };
  }, [setAccessToken, handleSessionExpired]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const newAccessToken = await refreshAccessTokenOnce();

        if (cancelled) return;

        setAccessToken(newAccessToken);

        const profileResponse = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
          },
        });

        if (cancelled) return;

        setUser(
          profileResponse.data.user || profileResponse.data
        );
        sessionExpiredRef.current = false;
      } catch (error) {
        if (cancelled) return;

        setUser(null);
        setAccessToken(null);

        // No toast here: a missing/expired session on the login
        // screen is normal, not necessarily an application error.
        console.info(
          "No restorable session:",
          error.response?.data?.message || error.message
        );
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [setAccessToken]);

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to log out on the server."
      );
      return false;
    }

    sessionExpiredRef.current = true;
    setUser(null);
    setAccessToken(null);
    return true;
  }

  const value = {
    user,
    setUser,
    accessToken,
    setAccessToken,
    isInitializing,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
