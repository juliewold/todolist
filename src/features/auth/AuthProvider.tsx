import type { SupabaseClient, Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthContextValue, type AuthStatus } from "./authContext";

interface AuthProviderProps {
  supabase: SupabaseClient | null;
  children: ReactNode;
}

export function AuthProvider({ supabase, children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>(supabase ? "loading" : "disabled");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }
    const apply = (session: Session | null) => {
      setEmail(session?.user.email ?? null);
      setStatus(session ? "signedIn" : "signedOut");
    };
    supabase.auth.getSession().then(({ data }) => {
      apply(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      apply(session);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      email,
      async signIn(address, password) {
        if (!supabase) {
          return null;
        }
        const { error } = await supabase.auth.signInWithPassword({ email: address, password });
        return error ? "Feil e-post eller passord." : null;
      },
      async signOut() {
        await supabase?.auth.signOut();
      },
    }),
    [supabase, status, email],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
