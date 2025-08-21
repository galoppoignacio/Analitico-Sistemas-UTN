"use client";
import Navbar from "../Navbar";
import styles from "./Estadisticas.module.css";
import { useMateriasStore } from "../../lib/materiasStore";

export default function EstadisticasPage() {
  const materias = useMateriasStore((state) => state.materias);
  const total = materias.filter(m => !m.isElectiva).length;
  const aprobadas = materias.filter(m => m.estado === 3 && !m.isElectiva).length;
  const faltan = total - aprobadas;
  const electivas = materias.filter(m => m.isElectiva && m.estado === 3).length;
  const aprobadasConNota = materias.filter(m => m.estado === 3 && m.nota > 0);
  const promedio = aprobadasConNota.length > 0 ? (aprobadasConNota.reduce((acc, m) => acc + m.nota, 0) / aprobadasConNota.length).toFixed(2) : "-";
  return (
    <>
      <Navbar />
      <main className={styles.mainStats}>
        <h1>Estadísticas académicas</h1>
        <ul className={styles.statsList}>
          <li><b>Materias aprobadas:</b> {aprobadas}</li>
          <li><b>Materias que faltan:</b> {faltan}</li>
          <li><b>Electivas aprobadas:</b> {electivas}</li>
          <li><b>Promedio general:</b> {promedio}</li>
        </ul>
        <p className={styles.detalle}>Podés ver el detalle y editar tus materias desde la pestaña <b>Analitico</b>.</p>
      </main>
    </>
  );
}
