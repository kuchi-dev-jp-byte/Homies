import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AppState, Platform } from "react-native";
import type { Session } from "@supabase/supabase-js";
import { authClient, demoAuth } from "./supabase";
import { useAppStore } from "../store/useAppStore";

const AuthContext = createContext({
  ready: false,
  storageError: false,
  signedIn: false,
  email: undefined as string | undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>();
  const [hydratedKey, setHydratedKey] = useState<string>();
  const [failedKey, setFailedKey] = useState<string>();
  const account = session?.user.id;
  const role =
    session?.user.app_metadata.role === "teacher" ? "teacher" : "student";
  const storageKey = demoAuth
    ? "homies-demo-v1"
    : account
      ? `homies-user-${account}`
      : undefined;

  useEffect(() => {
    if (!authClient) {
      setSession(null);
      return;
    }
    const client = authClient;
    const { data } = client.auth.onAuthStateChange((_event, next) =>
      setSession(next),
    );
    if (Platform.OS === "web") return () => data.subscription.unsubscribe();
    const refresh = (status: string) => {
      if (status === "active") client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    };
    refresh(AppState.currentState);
    const appState = AppState.addEventListener("change", refresh);
    return () => {
      data.subscription.unsubscribe();
      appState.remove();
      client.auth.stopAutoRefresh();
    };
  }, []);

  useEffect(() => {
    if (!storageKey) {
      setHydratedKey(undefined);
      setFailedKey(undefined);
      return;
    }
    let active = true;
    useAppStore.persist.setOptions({ name: storageKey });
    void Promise.resolve(useAppStore.persist.rehydrate()).then(() => {
      if (!active) return;
      if (useAppStore.persist.hasHydrated()) setHydratedKey(storageKey);
      else setFailedKey(storageKey);
    });
    return () => {
      active = false;
    };
  }, [storageKey]);

  const storageReady = !!storageKey && hydratedKey === storageKey;
  useEffect(() => {
    if (storageReady && !demoAuth) useAppStore.getState().setDemoRole(role);
  }, [storageReady, role]);
  const currentRole = useAppStore((s) => s.role);
  const ready =
    session !== undefined &&
    (!storageKey || (storageReady && (demoAuth || currentRole === role)));
  return (
    <AuthContext.Provider
      value={{
        ready,
        storageError: !!storageKey && storageKey === failedKey,
        signedIn: ready && !!session,
        email: session?.user.email,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
