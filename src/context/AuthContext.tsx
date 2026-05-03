import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import type { UserSessionDto } from "../api/auth";

type AuthContextType = {
  user: UserSessionDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsProfileCompletion: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: user, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch (error) {
        // Jeśli backend zwróci 401 Unauthorized, to znaczy, że nie mamy ciasteczka
        return null;
      }
    },
    // Brak retries zapobiega wielokrotnym żądaniom gdy użytkownik po prostu nie jest zalogowany
    retry: false,
    // Ustalamy rozsądny czas cache'owania, chociaż domyślnie RQ i tak trzyma to w tle
    staleTime: 1000 * 60 * 5, // 5 minut
  });

  const isAuthenticated = !!user;
  const needsProfileCompletion = isAuthenticated && !user.isActive;

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        isAuthenticated,
        needsProfileCompletion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
