"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { supabase } from "../lib/supabase";
import { useMateriasStore } from "../lib/materiasStore";
import { DatosMaterias } from "../data/plan";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const setMaterias = useMateriasStore((state) => state.setMaterias);
  const syncFromSupabase = useMateriasStore((state) => state.syncFromSupabase);
  const syncToSupabase = useMateriasStore((state) => state.syncToSupabase);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        // Limpiar localStorage al iniciar sesión
        if (typeof window !== "undefined") {
          localStorage.clear();
        }
        // Guardar usuario en Supabase si no existe
        const { email, displayName, uid } = firebaseUser;
        await supabase.from("users").upsert([
          { id: uid, email, name: displayName }
        ], { onConflict: "id" });

        // Sincronizar materias desde Supabase
        const { data, error } = await supabase
          .from("materias")
          .select("materias")
          .eq("user_id", uid)
          .single();
        if (!error && data && data.materias) {
          setMaterias(data.materias, false); // No sincronizar de nuevo
        } else {
          // Si no hay datos, inicializar con DatosMaterias y guardar en Supabase
          setMaterias(DatosMaterias, true);
          await syncToSupabase(uid, DatosMaterias);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
