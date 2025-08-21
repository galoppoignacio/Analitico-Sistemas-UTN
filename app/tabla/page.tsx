"use client";

import {
  useState,
  useMemo,
  useEffect,
} from "react";
import { DatosMaterias, Materia } from "../../data/plan";
import { useMateriasStore } from "../../lib/materiasStore";


import Navbar from "../Navbar";
import styles from "./TablaMaterias.module.css";
import { FaCheckCircle, FaStar, FaChartBar } from "react-icons/fa";
import { exportAnaliticoToPDF } from "../../lib/exportPDF";
import { useRef } from "react";
import dynamic from "next/dynamic";


// ...existing code...
export default function TablaPage() {
  // Referencias para exportar
  const statsRef = useRef<HTMLDivElement>(null);
  const tablaRef = useRef<HTMLDivElement>(null);
  // Estado global con zustand
  // (ya declarado arriba)
    const materias = useMateriasStore((state) => state.materias);
    const setMaterias = useMateriasStore((state) => state.setMaterias);
    const updateMateria = useMateriasStore((state) => state.updateMateria);
  
  // Estadísticas para exportar (idéntico a /estadisticas)
  const total = materias.filter(m => !m.isElectiva && m.nombre.toLowerCase() !== "seminario").length;
  const aprobadas = materias.filter(m => m.estado === 3 && !m.isElectiva && m.nombre.toLowerCase() !== "seminario").length;
  const electivasAprob = materias.filter(m => m.isElectiva && m.estado === 3).length;
  const aprobadasConNota = materias.filter(m => m.estado === 3 && m.nota > 0);
  const promedioGeneral = aprobadasConNota.length > 0 ? (aprobadasConNota.reduce((acc, m) => acc + m.nota, 0) / aprobadasConNota.length).toFixed(2) : "-";
  const porcentaje = total > 0 ? ((aprobadas / total) * 100).toFixed(1) : "0";

  // Exportar a PDF con tabla multipágina y estadísticas
  const handleExportPDF = () => {
    // Armar los datos de la tabla como arrays
    const tableRows: Array<Array<string | number>> = [];
    // Importar DatosMaterias para obtener el nombre original
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { DatosMaterias } = require('../../data/plan');
    // Agrupar materias por año
    const materiasPorAnio = new Map();
    filteredMaterias.forEach(m => {
      if (!materiasPorAnio.has(m.anio)) materiasPorAnio.set(m.anio, []);
      materiasPorAnio.get(m.anio).push(m);
    });
    Array.from(materiasPorAnio.keys()).sort((a, b) => a - b).forEach(anio => {
      tableRows.push([
        `${anio}º año`, '', '', '', '', ''
      ]);
      materiasPorAnio.get(anio).forEach(m => {
        // Buscar el nombre original por id
        const materiaOriginal = DatosMaterias.find(mat => mat.id === m.id);
        const nombreBase = materiaOriginal ? materiaOriginal.nombre : m.nombre;
        tableRows.push([
          m.id,
          nombreBase + (m.isElectiva ? ' ★' : ''),
          m.estado === 3 ? 'Aprobado' : m.estado === 2 ? 'Regular' : m.estado === 1 ? 'Disponible' : m.estado === 4 ? 'En curso' : 'No disponible',
          m.nota ?? '',
          m.materiasQueNecesitaRegulares.join(", "),
          m.materiasQueNecesitaAprobadas.join(", ")
        ]);
      });
    });
    exportAnaliticoToPDF({
      filename: 'analitico-utn.pdf',
      stats: {
        aprobadas,
        total,
        electivas: electivasAprob,
        promedio: promedioGeneral,
        porcentaje
      },
      tableRows
    });
  };

  // Render tabla para exportar (solo para PDF, no visible)
  function TablaExport() {
    return (
      <div style={{ padding: 12, background: '#fff', color: '#222', fontSize: 13 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>ID</th>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>Nombre</th>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>Estado</th>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>Nota</th>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>Regulares</th>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>Aprobadas</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterias.map(m => (
              <tr key={m.id}>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{m.id}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{m.nombre}{m.isElectiva && ' ★'}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{m.estado === 3 ? 'Aprobado' : m.estado === 2 ? 'Regular' : m.estado === 1 ? 'Disponible' : m.estado === 4 ? 'En curso' : 'No disponible'}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{m.nota ?? ''}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{m.materiasQueNecesitaRegulares.join(", ")}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{m.materiasQueNecesitaAprobadas.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  const ESTADOS = [
    "No disponible",
    "Disponible",
    "Regular",
    "Aprobado",
    "En curso",
  ];

  // Devuelve la clase de color de fondo según el estado de la materia
  // Estado: 0 = no disponible, 1 = disponible, 2 = regular, 3 = aprobada, 4 = en curso
  const getEstadoRowClass = (estado: number) => {
    switch (estado) {
      case 0: return styles.noDisponibleRow;
      case 1: return styles.disponibleRow;
      case 2: return styles.regularRow;
      case 3: return styles.aprobadaRow;
      case 4: return styles.cursoRow;
      default: return "";
    }
  };

  // ...existing code...

  // Recalcula el estado de todas las materias según correlativas
  function recalcularEstados(materias: Materia[]): Materia[] {
    return materias.map(m => {
      // Si ya está regular, aprobado o en curso, no cambiar
      if (m.estado === 2 || m.estado === 3 || m.estado === 4) return m;
      // Si no tiene correlativas, está disponible
      const okReg = m.materiasQueNecesitaRegulares.every(
        (rid) => materias.find((x) => x.id === rid)?.estado === 2 || materias.find((x) => x.id === rid)?.estado === 3
      );
      const okAprob = m.materiasQueNecesitaAprobadas.every(
        (rid) => materias.find((x) => x.id === rid)?.estado === 3
      );
      if (okReg && okAprob) {
        return { ...m, estado: 1 };
      } else {
        return { ...m, estado: 0 };
      }
    });
  }

  // Handlers
  const handleEstadoChange = (id: number, newEstado: number) => {
    updateMateria(id, {
      estado: newEstado,
      nota: newEstado === 3 ? materias.find((m) => m.id === id)?.nota : undefined,
    });
    // Recalcular estados después de cambiar
    setTimeout(() => {
      setMaterias(recalcularEstados(
        materias.map(m => m.id === id ? { ...m, estado: newEstado } : m)
      ));
    }, 0);
  };

  const handleReset = () => {
    if (confirm("Reiniciar materias al plan original")) {
      setMaterias(recalcularEstados(DatosMaterias));
    }
  };

  // Sincronización con LocalStorage 
  useEffect(() => {
    const key = `materias_local`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (Array.isArray(data) && data.length > 0) {
          setMaterias(data);
          return;
        }
      } catch {}
    }
    setMaterias(DatosMaterias);
    localStorage.setItem(key, JSON.stringify(DatosMaterias));
  }, [setMaterias]);

  // Guardar cambios en LocalStorage
  useEffect(() => {
    const key = `materias_local`;
    localStorage.setItem(key, JSON.stringify(materias));
  }, [materias]);

  // Handlers
  // ...existing code...
  const handleNotaChange = (id: number, nuevaNota: number) => {
    updateMateria(id, { nota: nuevaNota });
  };

  // Exportar materias a JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(materias, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    // Fecha en formato YYYY-MM-DD
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const fecha = `${yyyy}-${mm}-${dd}`;
    a.href = url;
    a.download = `materias-utn-${fecha}.json`;
    document.body.appendChild(a);
    a.click();
    if (a.parentNode === document.body) {
      document.body.removeChild(a);
    }
    URL.revokeObjectURL(url);
  };

  // Importar materias desde JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data) && data.every(m => typeof m === 'object')) {
          setMaterias(data);
          alert("Datos importados correctamente.");
        } else {
          alert("El archivo no tiene el formato esperado.");
        }
      } catch {
        alert("Error al leer el archivo JSON.");
      }
    };
    reader.readAsText(file);
    // Limpiar el input para permitir importar el mismo archivo de nuevo si se desea
    e.target.value = "";
  };

  const checkDependencies = (m: Materia) => {
    // Solo cuenta como regular si estado === 2, y como aprobada si estado === 3
    const okReg = m.materiasQueNecesitaRegulares.every(
      (rid) => materias.find((x) => x.id === rid)?.estado === 2 || materias.find((x) => x.id === rid)?.estado === 3
    );
    const okAprob = m.materiasQueNecesitaAprobadas.every(
      (rid) => materias.find((x) => x.id === rid)?.estado === 3
    );
    return okReg && okAprob;
  };

  // 6) Filtros & cálculos
  const [filterYear, setFilterYear] = useState<
    number | "all"
  >("all");
  const [showElectivas, setShowElectivas] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('showElectivas');
      if (stored === 'false') return false;
      if (stored === 'true') return true;
    }
    return true;
  });

  // Persistir showElectivas en localStorage
  useEffect(() => {
    localStorage.setItem('showElectivas', showElectivas ? 'true' : 'false');
  }, [showElectivas]);

  const filteredMaterias = useMemo(
    () =>
      materias.filter((m) => {
        if (filterYear !== "all" && m.anio !== filterYear)
          return false;
        if (!showElectivas && m.isElectiva) return false;
        return true;
      }),
    [materias, filterYear, showElectivas]
  );

  const promedio = useMemo(() => {
    const conNota = filteredMaterias.filter(
      (m) => m.nota! > 0
    );
    if (!conNota.length) return 0;
    return Math.round(
      (conNota.reduce((a, m) => a + m.nota!, 0) /
        conNota.length) *
        100
    ) / 100;
  }, [filteredMaterias]);

  // Porcentaje de materias aprobadas
  const progreso = useMemo(() => {
    // Excluir Seminario del cálculo
    let materiasFiltradas = materias.filter((m) => m.nombre.toLowerCase() !== "seminario");
    let total = 0;
    let aprobadas = 0;
    if (showElectivas) {
      // Separar electivas y no electivas
      const electivas = materiasFiltradas.filter(m => m.isElectiva);
      const noElectivas = materiasFiltradas.filter(m => !m.isElectiva);
      total = noElectivas.length + 7; // Solo 7 electivas cuentan
      const aprobadasNoElectivas = noElectivas.filter(m => m.estado === 3).length;
      const aprobadasElectivas = electivas.filter(m => m.estado === 3).length;
      aprobadas = aprobadasNoElectivas + Math.min(aprobadasElectivas, 7);
    } else {
      // Sin electivas, solo cuentan las no electivas
      materiasFiltradas = materiasFiltradas.filter(m => !m.isElectiva);
      total = materiasFiltradas.length;
      aprobadas = materiasFiltradas.filter(m => m.estado === 3).length;
    }
    return total ? ((aprobadas / total) * 100).toFixed(2) : "0.00";
  }, [materias, showElectivas]);

  const años = useMemo(() => {
    const s = new Set(materias.map((m) => m.anio));
    return Array.from(s).sort((a, b) => a - b);
  }, [materias]);

  return (
    <>
      <Navbar />
      <div className={styles.container}>
      <h1 className={styles.title}>Analitico</h1>

      {/* Barra superior de controles */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button onClick={handleExport} className={styles.exportBtn}>Exportar JSON</button>
          <button onClick={handleExportPDF} className={styles.exportBtn}>Exportar PDF</button>
          <label className={styles.importBtn}>Importar JSON<input type="file" accept="application/json" onChange={handleImport} />
          </label>
          <div className={styles.filters}>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={showElectivas}
                onChange={() => setShowElectivas(v => !v)}
              />
              <span className={styles.slider}></span>
            </label>
            <span className={styles.toggleLabel}>
              {showElectivas ? "Con electivas" : "Sin electivas"}
            </span>
            <span className={styles.electivaBadge} title="Materia electiva">★</span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button className={styles.resetBtn} onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>
      {/* Barra de progreso y promedio visibles */}
      <div style={{ maxWidth: '100%', width: '100%', margin: '0 auto 18px auto' }}>
        <div style={{ fontWeight: 600, fontSize: '1.08rem', marginBottom: 6, textAlign: 'center' }}>{progreso}% Completado <span className={styles.promedioBadge}> - Promedio: {promedio}</span></div>
        <div className={styles.progressContainer} style={{ width: '100%' }}>
          <div
            className={styles.progressBar}
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>
      {/* Estadísticas adicionales solo para PDF (ocultas en pantalla) */}
      <div ref={statsRef} style={{ position: 'absolute', left: -9999, top: 0, width: 800, background: '#fff' }}>
        <div style={{ fontWeight: 600, fontSize: '1.08rem', marginBottom: 6, textAlign: 'center' }}>{progreso}% Completado <span className={styles.promedioBadge}> - Promedio: {promedio}</span></div>
        <div className={styles.progressContainer} style={{ width: '100%' }}>
          <div
            className={styles.progressBar}
            style={{ width: `${progreso}%` }}
          />
        </div>
        <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center', listStyle: 'none', padding: 0, margin: '18px 0 0 0' }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaCheckCircle color="#1976d2" /> <b>Materias aprobadas:</b> {aprobadas}/{total}</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaStar color="#1976d2" /> <b>Electivas aprobadas:</b> {electivasAprob}/7</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaChartBar color="#1976d2" /> <b>Promedio general:</b> {promedioGeneral}</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaChartBar color="#1976d2" /> <b>Porcentaje completado:</b> {porcentaje}%</li>
        </ul>
      </div>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Nota</th>
              <th>Regulares</th>
              <th>Aprobadas</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              // Agrupar materias por año
              const materiasPorAnio = new Map();
              filteredMaterias.forEach(m => {
                if (!materiasPorAnio.has(m.anio)) materiasPorAnio.set(m.anio, []);
                materiasPorAnio.get(m.anio).push(m);
              });
              // Renderizar por año
              const rows = [];
              Array.from(materiasPorAnio.keys()).sort((a, b) => a - b).forEach(anio => {
                rows.push(
                  <tr key={"header-" + anio} className={styles.anioHeaderRow}>
                    <td colSpan={7} className={styles.anioHeaderCell}>
                      <span>{anio}º año</span>
                    </td>
                  </tr>
                );
                materiasPorAnio.get(anio).forEach(m => {
                  rows.push(
                    <tr
                      key={m.id}
                      className={
                        `${styles.row} ` +
                        (m.isElectiva ? styles.electivaRow : "") +
                        (m.anio ? ` ${styles["anio" + m.anio]}` : "") +
                        ` ${getEstadoRowClass(m.estado)}`
                      }
                    >
                      <td>{m.id}</td>
                      <td className={m.isElectiva ? styles.electivaCell : undefined}>
                        {m.nombre}
                        {m.isElectiva && (
                          <span className={styles.electivaBadge} title="Materia electiva">★</span>
                        )}
                      </td>
                      <td>
                        { !checkDependencies(m) ? (
                          <span className={styles.unavailable}>
                            {ESTADOS[0]}
                          </span>
                        ) : (
                          <select
                            className={styles.selectEstado}
                            value={m.estado}
                            onChange={e =>
                              handleEstadoChange(m.id, Number(e.target.value))
                            }
                            disabled={!checkDependencies(m)}
                          >
                            {/* Estado: 1=Disponible, 2=Regular, 3=Aprobado, 4=En curso */}
                            {[1,2,3,4].map((val) => (
                              <option key={val} value={val}>
                                {ESTADOS[val]}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td>
                        {m.estado === 3 && (
                          <input
                            type="number"
                            className={styles.notaInput}
                            value={m.nota ?? 0}
                            min={6}
                            max={10}
                            step={1}
                            onFocus={e => (e.target as HTMLInputElement).select()}
                            onChange={e => {
                              let value = Math.round(Number(e.target.value));
                              if (value < 6) value = 6;
                              if (value > 10) value = 10;
                              handleNotaChange(m.id, value);
                            }}
                          />
                        )}
                      </td>
                      <td>{m.materiasQueNecesitaRegulares.join(", ")}</td>
                      <td>{m.materiasQueNecesitaAprobadas.join(", ")}</td>
                    </tr>
                  );
                });
              });
              return rows;
            })()}
          </tbody>
        </table>
        {/* Render tabla solo para exportar (oculto en pantalla) */}
        <div ref={tablaRef} style={{ position: 'absolute', left: -9999, top: 0, width: 800, background: '#fff' }}>
          <TablaExport />
        </div>
      </div>
      {/* Autor y redes */}
      <div style={{ marginTop: 40, color: '#888', fontSize: '0.98rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span>Hecho por <strong>Ignacio Galoppo</strong></span>
          <div style={{ display: 'flex', gap: 16, marginTop: 2 }}>
            <a href="https://www.linkedin.com/in/ignacio-galoppo-b9623a184" target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 256">
                <path d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453" fill="#0A66C2"/>
              </svg>
            </a>
            <a href="https://github.com/galoppoignacio/" target="_blank" rel="noopener noreferrer" title="GitHub" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="6" fill="#222"/><path d="M16 7.333c-4.6 0-8.333 3.733-8.333 8.333 0 3.68 2.387 6.8 5.693 7.907.42.08.573-.18.573-.4v-1.387c-2.313.507-2.8-1.12-2.8-1.12-.38-.96-.92-1.213-.92-1.213-.76-.52.06-.507.06-.507.84.06 1.28.867 1.28.867.747 1.28 1.96.913 2.44.693.073-.547.293-.913.533-1.12-1.847-.213-3.787-.92-3.787-4.093 0-.907.32-1.653.853-2.24-.087-.213-.373-1.08.08-2.253 0 0 .693-.227 2.267.853.66-.187 1.373-.28 2.08-.28.707 0 1.42.093 2.08.28 1.573-1.08 2.267-.853 2.267-.853.453 1.173.167 2.04.08 2.253.533.587.853 1.333.853 2.24 0 3.187-1.947 3.88-3.8 4.093.3.253.567.76.567 1.547v2.293c0 .22.153.48.573.4C21.947 22.467 24.333 19.347 24.333 15.667c0-4.6-3.733-8.334-8.333-8.334z" fill="white"/></svg>
            </a>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
