"use client";

import Navbar from "../Navbar";
import styles from "./Estadisticas.module.css";
import { useMateriasStore } from "../../lib/materiasStore";
import { FaCheckCircle, FaClipboardList, FaStar, FaChartBar } from "react-icons/fa";

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
        <h1 style={{textAlign:'center', color:'#1976d2', fontWeight:700, letterSpacing:1}}>Estadísticas académicas</h1>
        <ul className={styles.statsList}>
          <li><span className={styles.statsIcon}><FaCheckCircle /></span> <span><b>Materias aprobadas:</b> {aprobadas}</span></li>
          <li><span className={styles.statsIcon}><FaClipboardList /></span> <span><b>Materias que faltan:</b> {faltan}</span></li>
          <li><span className={styles.statsIcon}><FaStar /></span> <span><b>Electivas aprobadas:</b> {electivas}</span></li>
          <li><span className={styles.statsIcon}><FaChartBar /></span> <span><b>Promedio general:</b> {promedio}</span></li>
        </ul>
        <p className={styles.detalle}>Podés ver el detalle y editar tus materias desde la pestaña <b>Analitico</b>.</p>
      </main>
    </>
  );
}
