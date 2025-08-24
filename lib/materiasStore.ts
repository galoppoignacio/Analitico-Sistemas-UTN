

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Materia } from '../data/plan';
import { supabase } from './supabase';
import { auth } from './firebase';



interface MateriasState {
  materias: Materia[];
  setMaterias: (materias: Materia[], sync?: boolean) => void;
  updateMateria: (id: number, changes: Partial<Materia>, sync?: boolean) => void;
  syncFromSupabase: (userId: string) => Promise<void>;
  syncToSupabase: (userId: string, materias: Materia[]) => Promise<void>;
}


export const useMateriasStore = create<MateriasState>()(
  persist(
    (set, get) => ({
      materias: [],
      setMaterias: (materias, sync = true) => {
        set({ materias });
        const user = auth.currentUser;
        if (sync && user) {
          (get() as any).syncToSupabase(user.uid, materias);
        }
      },
      updateMateria: (id, changes, sync = true) => {
        set((state) => {
          const newMaterias = state.materias.map((m) =>
            m.id === id ? { ...m, ...changes } : m
          );
          if (sync && auth.currentUser) {
            (get() as any).syncToSupabase(auth.currentUser.uid, newMaterias);
          }
          return { materias: newMaterias };
        });
      },
      syncFromSupabase: async (userId: string) => {
        const { data, error } = await supabase
          .from('materias')
          .select('materias')
          .eq('user_id', userId)
          .single();
        if (!error && data && data.materias) {
          set({ materias: data.materias });
        }
      },
      syncToSupabase: async (userId: string, materias: Materia[]) => {
        await supabase.from('materias').upsert([
          { user_id: userId, materias }
        ], { onConflict: 'user_id' });
      },
    }),
    {
      name: 'materias-utn',
      skipHydration: true,
    }
  )
);
