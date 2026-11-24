import { createContext, useContext } from "react";

export type AuthStatus = "disabled" | "loading" | "signedOut" | "signedIn";

export interface AuthContextValue {
  /** "disabled" means local mode, where no sign-in is needed. */
  status: AuthStatus;
  email: string | null;
  /** Returns an error message in Norwegian, or null on success. */
  signIn(email: string, password: string): Promise<string | null>;
  signOut(): Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
