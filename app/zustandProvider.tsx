"use client";
import { ReactNode } from "react";
import { useRef } from "react";
import { useStore } from "zustand";
import { useMateriasStore } from "../lib/materiasStore";

// Este provider asegura que zustand use la misma instancia en toda la app
export function ZustandProvider({ children }: { children: ReactNode }) {
  // Solo para forzar la instancia única
  useStore(useMateriasStore);
  return <>{children}</>;
}
