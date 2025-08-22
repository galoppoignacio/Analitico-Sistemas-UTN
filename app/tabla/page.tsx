"use client";
import "../../styles/globals.css"

import { useState, useMemo, useEffect, useRef } from "react";
import { DatosMaterias, Materia } from "../../data/plan";
import { useMateriasStore } from "../../lib/materiasStore";
import Navbar from "../Navbar";
import { FaCheckCircle, FaStar, FaChartBar } from "react-icons/fa";
import { exportAnaliticoToPDF } from "../../lib/exportPDF";
import dynamic from "next/dynamic";
// No importar pdfjs-dist arriba, usar dynamic import dentro de la función para evitar errores en Next.js
// Función para importar PDF de analítico de la facultad
async function importarAnaliticoPDF(file: File): Promise<string> {
  try {
    if (!(window as any).pdfjsLib) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
        script.async = true;
        script.onload = () => { resolve(null); };
        script.onerror = (e) => { console.error('Error cargando pdfjsLib de jsdelivr', e); reject(e); };
        document.body.appendChild(script);
      });
    }
    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib) {
      throw new Error('No se pudo cargar pdfjsLib');
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
    const arrayBuffer = await file.arrayBuffer();
    let pdf;
    try {
      pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    } catch (err) {
      console.error('Error en getDocument:', err);
      throw err;
    }
    let texto = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      texto += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return texto;
  } catch (err) {
    console.error('Error al leer el PDF:', err);
    throw err;
  }
}

// Utilidad para normalizar texto: minúsculas, sin tildes, sin signos, sin espacios
function normalizarTexto(str: string): string {
  return str
    .replace(/[\r\n]+/g, " ") // reemplazar saltos de línea por espacio
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar tildes
    .replace(/[^a-z0-9áéíóúüñ\s]/gi, "") // quitar signos
    .replace(/\s+/g, "") // quitar todos los espacios
    .trim();
}

// Parsear materias desde el texto extraído del PDF
function parsearMateriasDesdePDF(texto: string, materiasBase: Materia[]): Materia[] {
  // Tabla de equivalencias: nombre actual -> variantes posibles
  const equivalencias: Record<string, string[]> = {
    "Sistemas y Procesos de Negocios": ["SPN", "SOR", "Sistemas y Organizaciones"],
    "Lógica y Estructuras Discretas": ["LED", "MAD", "Matemática Discreta"],
    "Base de Datos": ["BDA", "GDA", "Gestión de Datos"],
  };
  const textoNorm = normalizarTexto(texto);
    const nuevasMaterias = materiasBase.map(m => ({ ...m, estado: 0, nota: 0 }));  
  
    for (const m of nuevasMaterias) {
      const variantes = [m.nombre, ...(equivalencias[m.nombre] || [])];
      let encontrada = false;
      let notaEncontrada: number | null = null;
      for (const variante of variantes) {
        // Regex: nombre + solo espacios/saltos de línea + nota (6-10) + palabra separadora o fin
        const regex = new RegExp(
          variante.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
          "[ \t\r\n]{1,5}(6|7|8|9|10)(?![0-9])",
          "i"
        );
        const match = texto.match(regex);
        if (match) {
          notaEncontrada = parseInt(match[1], 10);
          encontrada = true;
          break;
        } else {
          // Si no hay nota, igual marcamos como encontrada si aparece el nombre SOLO si no está seguido de un número
          const regexNombre = new RegExp(
            variante.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
            "(?![ \t\r\n]*(6|7|8|9|10))",
            "i"
          );
          if (texto.match(regexNombre)) {
            encontrada = true;
            break;
          }
        }
      }
      if (encontrada) {
        if (notaEncontrada !== null) {
          m.estado = 3; // Aprobado
          m.nota = notaEncontrada;
        } else {
          m.estado = 2; // Regular
          m.nota = 0;
        }
      }
      // Si no aparece, queda pendiente (estado 0)
    }
  for (const m of nuevasMaterias) {
    const variantes = [m.nombre, ...(equivalencias[m.nombre] || [])];
    let encontrada = false;
    let notaEncontrada: number | null = null;
    for (const variante of variantes) {
      const varianteNorm = normalizarTexto(variante);
      const idx = textoNorm.indexOf(varianteNorm);
      if (idx !== -1) {
        // Buscar la nota en los siguientes 20 caracteres del texto original (sin normalizar)
        // Busco la posición del nombre en el texto original (puede haber diferencias por normalización, pero es lo más robusto posible)
        const textoSinEspacios = texto.replace(/[\r\n]+/g, " ").replace(/\s+/g, "");
        const varianteSinEspacios = variante.replace(/[\r\n]+/g, " ").replace(/\s+/g, "");
        const idxOrig = textoSinEspacios.toLowerCase().indexOf(varianteSinEspacios.toLowerCase());
        let ventana = "";
        if (idxOrig !== -1) {
          ventana = textoSinEspacios.slice(idxOrig + varianteSinEspacios.length, idxOrig + varianteSinEspacios.length + 20);
        }
        // Buscar número entre 6 y 10 en la ventana
        const matchNota = ventana.match(/([6-9]|10)/);
        if (matchNota && matchNota[1]) {
          notaEncontrada = parseInt(matchNota[1], 10);
        }
        encontrada = true;
        break;
      }
    }
    if (encontrada) {
      if (notaEncontrada !== null) {
        m.estado = 3; // Aprobado
        m.nota = notaEncontrada;
      } else {
        m.estado = 2; // Regular
        m.nota = 0;
      }
    }
    // Si no aparece, queda pendiente (estado 0)
  }
  return nuevasMaterias;
}

export default function TablaPage() {
  // --------------- Refs ---------------
  const statsRef = useRef<HTMLDivElement>(null);
  const tablaRef = useRef<HTMLDivElement>(null);

  // --------------- Store ---------------
  const materias = useMateriasStore((state) => state.materias);
  const setMaterias = useMateriasStore((state) => state.setMaterias);
  const updateMateria = useMateriasStore((state) => state.updateMateria);

  // --------------- Stats ---------------
  const total = materias.filter(m => !m.isElectiva && m.nombre.toLowerCase() !== "seminario").length;
  const aprobadas = materias.filter(m => m.estado === 3 && !m.isElectiva && m.nombre.toLowerCase() !== "seminario").length;
  const electivasAprob = materias.filter(m => m.isElectiva && m.estado === 3).length;
  const aprobadasConNota = materias.filter(m => m.estado === 3 && m.nota > 0);
  const promedioGeneral = aprobadasConNota.length > 0 ? (aprobadasConNota.reduce((acc, m) => acc + m.nota, 0) / aprobadasConNota.length).toFixed(2) : "-";
  const porcentaje = total > 0 ? ((aprobadas / total) * 100).toFixed(1) : "0";

  // --------------- Export PDF ---------------
  const handleExportPDF = () => {
    // Exportar el PDF con formato compatible para el importador
    // Usar los nombres originales de las materias y el formato de nota esperado
    const tableRows: Array<Array<string | number>> = [];
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { DatosMaterias } = require("../../data/plan");
    const materiasPorAnio = new Map<number, Materia[]>();
    filteredMaterias.forEach(m => {
      if (!materiasPorAnio.has(m.anio)) materiasPorAnio.set(m.anio, []);
      materiasPorAnio.get(m.anio)!.push(m);
    });
    Array.from(materiasPorAnio.keys()).sort((a, b) => a - b).forEach(anio => {
      materiasPorAnio.get(anio)!.forEach(m => {
        const materiaOriginal = DatosMaterias.find(mat => mat.id === m.id);
        const nombreBase = materiaOriginal ? materiaOriginal.nombre : m.nombre;
        let nombreParaPDF = nombreBase;
        if (m.isElectiva) nombreParaPDF += " ★";
        let estadoStr = m.estado === 3 ? "Aprobado" : m.estado === 2 ? "Regular" : m.estado === 1 ? "Disponible" : m.estado === 4 ? "En curso" : "No disponible";
        let notaStr = m.estado === 3 && m.nota ? String(m.nota) : "-";
        let nombreYNota = nombreParaPDF;
        if (m.estado === 3 && m.nota) nombreYNota += ` ${m.nota}`;
        let regStr = "";
        let aprStr = "";
        tableRows.push([
          nombreYNota,
          m.modalidad || "",
          estadoStr,
          notaStr,
          regStr,
          aprStr,
        ]);
      });
    });
    exportAnaliticoToPDF({
      filename: "analitico-utn.pdf",
      stats: { aprobadas, total, electivas: electivasAprob, promedio: promedioGeneral, porcentaje },
      tableRows: tableRows,
    });
  };

  // --------------- Tabla Export oculta ---------------
  function TablaExport() {
    return (
      <div style={{ padding: 12, background: "#fff", color: "#222", fontSize: 13 }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 4 }}>Nombre</th>
              <th style={{ border: "1px solid #ccc", padding: 4 }}>Modalidad</th>
              <th style={{ border: "1px solid #ccc", padding: 4 }}>Estado</th>
              <th style={{ border: "1px solid #ccc", padding: 4 }}>Nota</th>
              <th style={{ border: "1px solid #ccc", padding: 4 }}>Regulares</th>
              <th style={{ border: "1px solid #ccc", padding: 4 }}>Aprobadas</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterias.map(m => (
              <tr key={m.id}>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>
                  {m.nombre}
                  {m.isElectiva && " ★"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>{m.modalidad}</td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>
                  {m.estado === 3
                    ? "Aprobado"
                    : m.estado === 2
                    ? "Regular"
                    : m.estado === 1
                    ? "Disponible"
                    : m.estado === 4
                    ? "En curso"
                    : "No disponible"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>{m.nota ?? ""}</td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>{m.materiasQueNecesitaRegulares.join(", ")}</td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>{m.materiasQueNecesitaAprobadas.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // --------------- Constantes de estilo (solo UI) ---------------
  const btnBase =
    "inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 font-semibold text-base transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const btnPrimary =
    `${btnBase} bg-gradient-to-b from-[#46a6d7] to-[#3c8dbc] text-white hover:from-[#2a7bb0] hover:to-[#24618a] focus-visible:ring-[#3c8dbc]`;
  const btnDanger =
    `${btnBase} bg-gradient-to-b from-[#f06a5d] to-[#e74c3c] text-white hover:from-[#d44d41] hover:to-[#c0392b] focus-visible:ring-[#e74c3c]`;
  const pillBadge =
    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm";

  // --------------- Estados ---------------
  const ESTADOS = ["No disponible", "Disponible", "Regular", "Aprobado", "En curso"];

  const getEstadoRowClass = (estado: number) => {
    switch (estado) {
      case 0: return "bg-gray-50";
      case 1: return "bg-gray-100";
      case 2: return "bg-yellow-50";
      case 3: return "bg-green-50";
      case 4: return "bg-blue-50";
      default: return "";
    }
  };

  const getYearRowClass = (anio: number) => {
    switch (anio) {
      case 1: return "bg-[#f6fff7]";
      case 2: return "bg-[#f7fbff]";
      case 3: return "bg-[#fffaf6]";
      case 4: return "bg-[#f9f6ff]";
      case 5: return "bg-[#fff6fa]";
      default: return "";
    }
  };

  // --------------- Lógica de correlatividades y handlers ---------------
  function recalcularEstados(materias: Materia[]): Materia[] {
    return materias.map(m => {
      if (m.estado === 2 || m.estado === 3 || m.estado === 4) return m;
      const okReg = m.materiasQueNecesitaRegulares.every(
        rid => materias.find(x => x.id === rid)?.estado === 2 || materias.find(x => x.id === rid)?.estado === 3
      );
      const okAprob = m.materiasQueNecesitaAprobadas.every(rid => materias.find(x => x.id === rid)?.estado === 3);
      if (okReg && okAprob) return { ...m, estado: 1 };
      return { ...m, estado: 0 };
    });
  }

  const handleEstadoChange = (id: number, newEstado: number) => {
    updateMateria(id, { estado: newEstado, nota: newEstado === 3 ? materias.find(m => m.id === id)?.nota : undefined });
    setTimeout(() => {
      setMaterias(
        recalcularEstados(
          materias.map(m => (m.id === id ? { ...m, estado: newEstado } : m))
        )
      );
    }, 0);
  };

  const handleReset = () => {
    if (confirm("Reiniciar materias al plan original")) {
      setMaterias(recalcularEstados(DatosMaterias));
    }
  };

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

  useEffect(() => {
    const key = `materias_local`;
    localStorage.setItem(key, JSON.stringify(materias));
  }, [materias]);

  const handleNotaChange = (id: number, nuevaNota: number) => {
    updateMateria(id, { nota: nuevaNota });
  };

  // Importar materias desde JSON o PDF
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.name.toLowerCase().endsWith('.pdf')) {
      // Importar desde PDF
      importarAnaliticoPDF(file).then(texto => {
        // Usar DatosMaterias como base
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { DatosMaterias } = require('../../data/plan');
        let nuevasMaterias = parsearMateriasDesdePDF(texto, DatosMaterias);
        // Recalcular estados de correlatividades
        nuevasMaterias = recalcularEstados(nuevasMaterias);
        setMaterias(nuevasMaterias);
        // Actualizar localStorage manualmente para persistir el cambio
        localStorage.setItem('materias-utn', JSON.stringify({ state: { materias: nuevasMaterias }, version: 0 }));
      }).catch(() => {
        // No alert, solo log
        console.error('No se pudo leer el PDF.');
      });
    } else {
      // Importar desde JSON
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (Array.isArray(data) && data.every(m => typeof m === 'object')) {
            setMaterias(data);
            localStorage.setItem('materias-utn', JSON.stringify({ state: { materias: data }, version: 0 }));
          } else {
            console.error('El archivo no tiene el formato esperado.');
          }
        } catch {
          console.error('Error al leer el archivo JSON.');
        }
      };
      reader.readAsText(file);
    }
    // Limpiar el input para permitir importar el mismo archivo de nuevo si se desea
    e.target.value = "";
  };

  const checkDependencies = (m: Materia) => {
    const okReg = m.materiasQueNecesitaRegulares.every(
      rid => materias.find(x => x.id === rid)?.estado === 2 || materias.find(x => x.id === rid)?.estado === 3
    );
    const okAprob = m.materiasQueNecesitaAprobadas.every(rid => materias.find(x => x.id === rid)?.estado === 3);
    return okReg && okAprob;
  };

  // 6) Filtros & cálculos
  const [filterYear, setFilterYear] = useState<number | "all">("all");
  const [showElectivas, setShowElectivas] = useState(true);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('showElectivas');
      if (stored === 'false') setShowElectivas(false);
      if (stored === 'true') setShowElectivas(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("showElectivas", showElectivas ? "true" : "false");
  }, [showElectivas]);

  const filteredMaterias = useMemo(
    () =>
      materias.filter(m => {
        if (filterYear !== "all" && m.anio !== filterYear) return false;
        if (!showElectivas && m.isElectiva) return false;
        return true;
      }),
    [materias, filterYear, showElectivas]
  );

  const promedio = useMemo(() => {
    const conNota = filteredMaterias.filter(m => m.nota! > 0);
    if (!conNota.length) return 0;
    return Math.round((conNota.reduce((a, m) => a + m.nota!, 0) / conNota.length) * 100) / 100;
  }, [filteredMaterias]);

  const progreso = useMemo(() => {
    let materiasFiltradas = materias.filter(m => m.nombre.toLowerCase() !== "seminario");
    let total = 0;
    let aprobadas = 0;
    if (showElectivas) {
      const electivas = materiasFiltradas.filter(m => m.isElectiva);
      const noElectivas = materiasFiltradas.filter(m => !m.isElectiva);
      total = noElectivas.length + 7;
      const aprobadasNoElectivas = noElectivas.filter(m => m.estado === 3).length;
      const aprobadasElectivas = electivas.filter(m => m.estado === 3).length;
      aprobadas = aprobadasNoElectivas + Math.min(aprobadasElectivas, 7);
    } else {
      materiasFiltradas = materiasFiltradas.filter(m => !m.isElectiva);
      total = materiasFiltradas.length;
      aprobadas = materiasFiltradas.filter(m => m.estado === 3).length;
    }
    return total ? ((aprobadas / total) * 100).toFixed(2) : "0.00";
  }, [materias, showElectivas]);

  const años = useMemo(() => {
    const s = new Set(materias.map(m => m.anio));
    return Array.from(s).sort((a, b) => a - b);
  }, [materias]);

  // --------------- UI ---------------
  return (
    <>
      <Navbar />
      {/* Contenedor principal con fondo sutil */}
      <div className="mt-6 mb-8 px-3 sm:px-6">
        <div className="mx-auto max-w-[1200px] rounded-2xl border border-[#e3e7ea] bg-white/90 shadow-[0_10px_30px_rgba(44,62,80,0.10)] backdrop-blur-sm">
          {/* header con gradiente */}
          <div className="rounded-t-2xl bg-gradient-to-r from-[#e0f7fa] via-white to-[#f0f7ff] px-5 py-5 sm:px-8 sm:py-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1976d2]">
              Analítico
            </h1>
            {/* KPIs superiores */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {/* Progreso */}
              <span className={`${pillBadge} bg-[#e8f5e9] text-[#2e7d32]`}>
                <FaCheckCircle className="-ml-0.5" />
                <span className="font-bold">{progreso}%</span> completado
              </span>
              {/* Promedio DESTACADO */}
              <span className={`${pillBadge} bg-[#e3f2fd] text-[#0d47a1] ring-1 ring-[#90caf9]/60 shadow-md`}>
                <FaChartBar className="-ml-0.5" />
                <span className="text-lg font-black leading-none">{promedio}</span>
                <span className="opacity-80 font-semibold">promedio</span>
              </span>
              {/* Electivas */}
              <span className={`${pillBadge} bg-[#f3e5f5] text-[#6a1b9a]`}>
                <FaStar className="-ml-0.5" />
                <span className="font-bold">{electivasAprob}/7</span> electivas aprobadas
              </span>
            </div>
          </div>
          {/* Top bar de acciones */}
          <div
            className={[
              "flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8",
              "max-[600px]:flex-col max-[600px]:items-stretch",
            ].join(" ")}
          >
            <div className="flex flex-wrap items-center gap-3 max-[600px]:flex-col max-[600px]:items-stretch">
              <button onClick={handleExportPDF} className={`${btnPrimary} min-w-[140px] cursor-pointer`}>
                Exportar PDF
              </button>
              {/* Import JSON/PDF */}
              <label className={`${btnPrimary} min-w-[140px] cursor-pointer`}>
                Importar JSON/PDF
                <input type="file" accept="application/json,application/pdf" onChange={handleImport} className="hidden" />
              </label>
              {/* Filtros */}
              <div className="flex h-10 items-center gap-3 max-[600px]:justify-center">
                {/* switch */}
                <label className="relative inline-block h-6 w-[50px]">
                  <input
                    type="checkbox"
                    checked={showElectivas}
                    onChange={() => setShowElectivas(v => !v)}
                    className="peer sr-only"
                  />
                  <span className="absolute inset-0 cursor-pointer rounded-full bg-[#cfd8dc] transition before:absolute before:left-[3px] before:bottom-[3px] before:h-[18px] before:w-[18px] before:rounded-full before:bg-white before:shadow before:transition peer-checked:bg-[#4caf50] peer-checked:before:translate-x-[26px]" />
                </label>
                <span className="select-none text-[0.95rem]">
                  {showElectivas ? "Con electivas" : "Sin electivas"}
                </span>
                <span className="inline-flex items-center justify-center rounded-md bg-[#1976d2] px-2 py-[2px] text-white text-sm font-bold">
                  ★
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <button className={`${btnDanger} min-w-[120px] cursor-pointer`} onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
          {/* Barra de progreso visual */}
          <div className="px-5 pb-2 sm:px-8">
            <div className="relative h-5 w-full overflow-hidden rounded-full bg-[#e0e0e0]">
              <div
                className="h-full bg-gradient-to-r from-[#66bb6a] to-[#43a047] transition-[width] duration-500"
                style={{ width: `${progreso}%` }}
              />
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="text-xs font-semibold text-white drop-shadow">
                  {progreso}% completado — <span className="font-black">Promedio: {promedio}</span>
                </span>
              </div>
            </div>
          </div>
          {/* Tabla */}
          <div className="w-full overflow-x-auto px-2 pb-6 sm:px-6">
            <table className="mt-4 w-full min-w-[600px] border-collapse overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(44,62,80,0.08)]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-[#3c8dbc] to-[#2e86c1]">
                  {["ID", "Nombre", "Modalidad", "Estado", "Nota", "Regulares", "Aprobadas"].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-left text-[1.02rem] font-semibold tracking-wide text-white border-b border-white/20"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[0.98rem]">
                {(() => {
                  const materiasPorAnio = new Map<number, Materia[]>();
                  filteredMaterias.forEach(m => {
                    if (!materiasPorAnio.has(m.anio)) materiasPorAnio.set(m.anio, []);
                    materiasPorAnio.get(m.anio)!.push(m);
                  });
                  const rows = [];
                  Array.from(materiasPorAnio.keys())
                    .sort((a, b) => a - b)
                    .forEach(anio => {
                      rows.push(
                        <tr key={`header-${anio}`}>
                          <td
                            colSpan={7}
                            className="bg-[#e0f7fa] px-3 py-3 text-center text-[1.05rem] font-extrabold tracking-wide text-[#1976d2] border-y-[2px] border-[#b2ebf2]"
                          >
                            {anio}º año
                          </td>
                        </tr>
                      );
                      materiasPorAnio.get(anio)!.forEach((m, idx) => {
                        const rowBgByYear = getYearRowClass(m.anio);
                        const rowBgByEstado = getEstadoRowClass(m.estado);
                        const electivaBg = m.isElectiva ? "bg-[#f0f7fa]" : "";
                        const zebra = idx % 2 === 1 ? "bg-black/[0.02]" : "";
                        const tdBase = "px-3 py-2 align-middle border-b border-[#e3e7ea]";
                        return rows.push(
                          <tr
                            key={m.id}
                            className={[
                              "group transition-colors hover:[&>td]:bg-pink-50",
                              rowBgByYear,
                              rowBgByEstado,
                              electivaBg,
                              zebra,
                            ].join(" ")}
                          >
                            <td className={tdBase}>{m.id}</td>
                            <td className={tdBase}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{m.nombre}</span>
                                {m.isElectiva && (
                                  <span
                                    className="inline-block rounded-md bg-[#1976d2] px-2 py-[2px] text-white text-[0.8em] font-bold"
                                    title="Materia electiva"
                                  >
                                    ★
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className={tdBase}>{m.modalidad}</td>  {/* 👈 Nueva columna */}
                            <td className={tdBase}>
                              {!checkDependencies(m) ? (
                                <span className="italic text-[#999]">{"No disponible"}</span>
                              ) : (
                                <select
                                  className="font-bold text-black appearance-none bg-white border border-[#bbb] rounded px-3 pr-8 py-1 cursor-pointer focus:outline-none focus:border-[#4caf50] focus:[box-shadow:0_0_0_3px_rgba(76,175,80,0.25)]"
                                  style={{
                                    backgroundImage:
                                      "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D'10'%20height%3D'6'%20viewBox%3D'0%200%2010%206'%20xmlns%3D'http%3A//www.w3.org/2000/svg'%3E%3Cpath%20d%3D'M0%200l5%206%205%200z'%20fill%3D'%23777'%2F%3E%3C%2Fsvg%3E\")",
                                    backgroundRepeat: "no-repeat",
                                    backgroundPosition: "right 10px center",
                                    width: 130,
                                  }}
                                  value={m.estado}
                                  onChange={e => handleEstadoChange(m.id, Number(e.target.value))}
                                  disabled={!checkDependencies(m)}
                                >
                                  {[1, 2, 3, 4].map(val => (
                                    <option key={val} value={val}>
                                      {ESTADOS[val]}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </td>
                            <td className={tdBase}>
                              {m.estado === 3 && (
                                <input
                                  type="number"
                                  className="w-[64px] rounded border border-[#ccc] px-2 py-1 text-center focus:outline-none focus:border-[#4caf50] focus:[box-shadow:0_0_0_3px_rgba(76,175,80,0.25)] disabled:bg-[#f0f0f0] disabled:cursor-not-allowed disabled:text-[#777]"
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
                            <td className={`${tdBase} text-gray-700`}>{m.materiasQueNecesitaRegulares.join(", ")}</td>
                            <td className={`${tdBase} text-gray-700`}>{m.materiasQueNecesitaAprobadas.join(", ")}</td>
                          </tr>
                        );
                      });
                    });
                  return rows;
                })()}
              </tbody>
            </table>
            {/* Tabla oculta para export (PDF) */}
            <div ref={tablaRef} style={{ position: "absolute", left: -9999, top: 0, width: 800, background: "#fff" }}>
              <TablaExport />
            </div>
          </div>
          {/* Stats ocultas para PDF */}
          <div ref={statsRef} style={{ position: "absolute", left: -9999, top: 0, width: 800, background: "#fff" }}>
            <div className="mb-1.5 text-center text-[1.08rem] font-semibold">
              {progreso}% Completado <span className="font-semibold"> - Promedio: {promedio}</span>
            </div>
            <div className="relative h-5 w-full overflow-hidden rounded bg-[#e0e0e0]">
              <div className="h-full bg-[#4caf50]" style={{ width: `${progreso}%` }} />
            </div>
            <ul className="mt-[18px] flex list-none flex-wrap justify-center gap-[18px] p-0">
              <li className="flex items-center gap-2">
                <FaCheckCircle color="#1976d2" /> <b>Materias aprobadas:</b> {aprobadas}/{total}
              </li>
              <li className="flex items-center gap-2">
                <FaStar color="#1976d2" /> <b>Electivas aprobadas:</b> {electivasAprob}/7
              </li>
              <li className="flex items-center gap-2">
                <FaChartBar color="#1976d2" /> <b>Promedio general:</b> {promedioGeneral}
              </li>
              <li className="flex items-center gap-2">
                <FaChartBar color="#1976d2" /> <b>Porcentaje completado:</b> {porcentaje}%
              </li>
            </ul>
          </div>
          {/* Footer autor */}
          <div className="px-5 pb-8 text-center text-[#7a7a7a] sm:px-8">
            <div className="mt-3 flex flex-col items-center gap-2 text-[0.98rem]">
              <span>
                Hecho por <strong>Ignacio Galoppo</strong>
              </span>
              <div className="flex gap-4">
                <a
                  href="https://www.linkedin.com/in/ignacio-galoppo-b9623a184"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn"
                  className="inline-flex items-center hover:opacity-80"
                >
                  <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 256">
                    <path d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453" fill="#0A66C2"/>
                  </svg>
                </a>
                <a
                  href="https://github.com/galoppoignacio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="GitHub"
                  className="inline-flex items-center hover:opacity-80"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="6" fill="#222" />
                    <path d="M16 7.333c-4.6 0-8.333 3.733-8.333 8.333 0 3.68 2.387 6.8 5.693 7.907.42.08.573-.18.573-.4v-1.387c-2.313.507-2.8-1.12-2.8-1.12-.38-.96-.92-1.213-.92-1.213-.76-.52.06-.507.06-.507.84.06 1.28.867 1.28.867.747 1.28 1.96.913 2.44.693.073-.547.293-.913.533-1.12-1.847-.213-3.787-.92-3.787-4.093 0-.907.32-1.653.853-2.24-.087-.213-.373-1.08.08-2.253 0 0 .693-.227 2.267.853.66-.187 1.373-.28 2.08-.28.707 0 1.42.093 2.08.28 1.573-1.08 2.267-.853 2.267-.853.453 1.173.167 2.04.08 2.253.533.587.853 1.333.853 2.24 0 3.187-1.947 3.88-3.8 4.093.3.253.567.76.567 1.547v2.293c0 .22.153.48.573.4C21.947 22.467 24.333 19.347 24.333 15.667c0-4.6-3.733-8.334-8.333-8.334z" fill="white" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
