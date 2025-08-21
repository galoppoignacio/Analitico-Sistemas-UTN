"use client";

import { calcularRoadmap } from "../../lib/roadmap";
import { useMateriasStore } from "../../lib/materiasStore";
import { useEffect } from "react";
import { useMemo } from "react";
import RoadmapTable from "./RoadmapTable";

export default function RoadmapPage() {
  const materias = useMateriasStore(state => state.materias);
  const setMaterias = useMateriasStore(state => state.setMaterias);
  useEffect(() => {
    if (materias === undefined) {
      setMaterias(require("../../data/plan").DatosMaterias);
    }
  }, [materias, setMaterias]);

  // Sincronizar con cambios en LocalStorage
  useEffect(() => {
    const key = `materias_local`;
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (Array.isArray(data)) setMaterias(data);
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [setMaterias]);
  // Mapear todos los estados posibles de la tabla principal
  const estadoActual = useMemo(() => {
    const estado: Record<number, "aprobada" | "regular" | "pendiente" | "disponible" | "en curso"> = {};
    materias.forEach(m => {
  if (m.estado === 3) estado[m.id] = "aprobada";
  else if (m.estado === 2) estado[m.id] = "regular";
      else if (m.estado === 4) estado[m.id] = "en curso";
      else if (m.estado === 1) estado[m.id] = "disponible";
      else estado[m.id] = "pendiente";
    });
    return estado;
  }, [materias]);
  const roadmap = useMemo(() => calcularRoadmap(estadoActual), [estadoActual]);
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Roadmap sugerido de cursada</h1>
      <p>Plan óptimo sugerido según tu estado actual de cursada</p>
      <RoadmapTable steps={roadmap.steps} />
    </main>
  );
}
