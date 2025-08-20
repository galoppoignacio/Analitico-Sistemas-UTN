
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Materia } from '../data/plan';


interface MateriasState {
  materias: Materia[];
  setMaterias: (materias: Materia[]) => void;
  updateMateria: (id: number, changes: Partial<Materia>) => void;
}


export const useMateriasStore = create<MateriasState>()(
  persist(
    (set) => ({
      materias: [],
      setMaterias: (materias) => set({ materias }),
      updateMateria: (id, changes) =>
        set((state) => ({
          materias: state.materias.map((m) =>
            m.id === id ? { ...m, ...changes } : m
          ),
        })),
    }),
    {
      name: 'materias-utn', // clave en localStorage
    }
  )
);
