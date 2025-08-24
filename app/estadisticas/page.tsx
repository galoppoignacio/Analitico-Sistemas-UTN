"use client";
import "../../styles/globals.css";

import Navbar from "../Navbar";
import { useMateriasStore } from "../../lib/materiasStore";
import { FaCheckCircle, FaStar, FaChartBar } from "react-icons/fa";

export default function EstadisticasPage() {
  const materias = useMateriasStore((state) => state.materias);
  const total = materias.filter(
    (m) =>
      !m.isElectiva &&
      m.nombre.toLowerCase() !== "seminario" &&
      m.nombre.toLowerCase() !== "seminario integrador (analista)"
  ).length;
  const aprobadas = materias.filter(
    (m) =>
      m.estado === 3 &&
      !m.isElectiva &&
      m.nombre.toLowerCase() !== "seminario" &&
      m.nombre.toLowerCase() !== "seminario integrador (analista)"
  ).length;
  const electivas = materias.filter((m) => m.isElectiva && m.estado === 3).length;
  const aprobadasConNota = materias.filter((m) => m.estado === 3 && m.nota > 0);
  const promedio =
    aprobadasConNota.length > 0
      ? (aprobadasConNota.reduce((acc, m) => acc + m.nota, 0) / aprobadasConNota.length).toFixed(2)
      : "-";
  const porcentaje = total > 0 ? ((aprobadas / total) * 100).toFixed(1) : "0";

  return (
    <>
      <Navbar />
      <main className="my-20 md:mx-auto mx-4 max-w-3xl rounded-2xl bg-gradient-to-br from-sky-50 via-white to-sky-100 p-6 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold tracking-wide text-sky-700">
          Estadísticas académicas
        </h1>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <FaCheckCircle className="text-sky-600 text-xl" />
            <span className="text-slate-700 font-medium">
              <b>Materias aprobadas:</b> {aprobadas}/{total}
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <FaStar className="text-sky-600 text-xl" />
            <span className="text-slate-700 font-medium">
              <b>Electivas aprobadas:</b> {electivas}/7
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <FaChartBar className="text-sky-600 text-xl" />
            <span className="text-slate-700 font-medium">
              <b>Promedio general:</b> {promedio}
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <FaChartBar className="text-sky-600 text-xl" />
            <span className="text-slate-700 font-medium">
              <b>Porcentaje completado:</b> {porcentaje}%
            </span>
          </div>
        </div>

        <p className="mt-6 rounded-lg bg-sky-100 px-4 py-3 text-center text-sky-700">
          Podés ver el detalle y editar tus materias desde la pestaña <b>Analitico</b>.
        </p>
      </main>
    </>
  );
}
