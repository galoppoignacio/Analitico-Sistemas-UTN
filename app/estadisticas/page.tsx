"use client";


import Navbar from "../Navbar";
import styles from "./Estadisticas.module.css";
import { useMateriasStore } from "../../lib/materiasStore";
import { FaCheckCircle, FaClipboardList, FaStar, FaChartBar } from "react-icons/fa";
import { useRef, useState } from "react";


export default function EstadisticasPage() {
  const materias = useMateriasStore((state) => state.materias);
  const total = materias.filter(m => !m.isElectiva && m.nombre.toLowerCase() !== "seminario").length;
  const aprobadas = materias.filter(m => m.estado === 3 && !m.isElectiva && m.nombre.toLowerCase() !== "seminario").length;
  const faltan = total - aprobadas;
  const electivas = materias.filter(m => m.isElectiva && m.estado === 3).length;
  const aprobadasConNota = materias.filter(m => m.estado === 3 && m.nota > 0);
  const promedio = aprobadasConNota.length > 0 ? (aprobadasConNota.reduce((acc, m) => acc + m.nota, 0) / aprobadasConNota.length).toFixed(2) : "-";
  const porcentaje = total > 0 ? ((aprobadas / total) * 100).toFixed(1) : "0";
  return (
    <>
      <Navbar />
      <main className={styles.mainStats}>
        <h1 style={{textAlign:'center', color:'#1976d2', fontWeight:700, letterSpacing:1}}>Estadísticas académicas</h1>
        <ul className={styles.statsList}>
          <li><span className={styles.statsIcon}><FaCheckCircle /></span> <span><b>Materias aprobadas:</b> {aprobadas}/{total}</span></li>
          <li><span className={styles.statsIcon}><FaStar /></span> <span><b>Electivas aprobadas:</b> {electivas}/7</span></li>
          <li><span className={styles.statsIcon}><FaChartBar /></span> <span><b>Promedio general:</b> {promedio}</span></li>
          <li><span className={styles.statsIcon}><FaChartBar /></span> <span><b>Porcentaje completado:</b> {porcentaje}%</span></li>
        </ul>
        <p className={styles.detalle}>Podés ver el detalle y editar tus materias desde la pestaña <b>Analitico</b>.</p>
      </main>
    </>
  );
}
