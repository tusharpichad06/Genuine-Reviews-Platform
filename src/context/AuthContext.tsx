import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  User,
  Session,
} from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

const AuthContext =
  createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
  });

type Props = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: Props) {
  const [user, setUser] =
    useState<User | null>(null);

  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const {
        data: { session },
        error,
      } =
        await supabase.auth.getSession();

      if (error) {
        console.error(
          "AUTH SESSION ERROR:",
          error
        );
      }

      if (!mounted) return;

      setSession(session);
      setUser(
        session?.user ?? null
      );
      setLoading(false);
    }

    initialize();

    const {
  data: { subscription },
} =
  supabase.auth.onAuthStateChange(
    (event, session) => {
      if (!mounted) return;

      setSession(session);
      setUser(
        session?.user ?? null
      );

      setLoading(false);

      if (event === "PASSWORD_RECOVERY") {
        console.log(
          "PASSWORD RECOVERY SESSION DETECTED"
        );
      }
    }
  );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}