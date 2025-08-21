"use client";
import "../../styles/globals.css";

import { useMateriasStore } from "../../lib/materiasStore";
import Navbar from "../Navbar";

export default function DisponiblesPage() {
  const materias = useMateriasStore((state) => state.materias);

  // Mostrar materias con estado === 1 (disponible)
  const disponibles = materias.filter((m) => m.estado === 1);

  // Agrupar por año
  function groupByYear(arr) {
    const map = new Map();
    arr.forEach((m) => {
      const year = m.anio || 0;
      if (!map.has(year)) map.set(year, []);
      map.get(year).push(m);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }

  const normales = disponibles.filter((m) => !m.isElectiva);
  const electivas = disponibles.filter((m) => m.isElectiva);
  const normalesPorAnio = groupByYear(normales);
  const electivasPorAnio = groupByYear(electivas);

  return (
    <>
      <Navbar />
      <div className="my-20 md:mx-auto mx-4 max-w-5xl rounded-2xl bg-gradient-to-br from-sky-50 via-white to-sky-100 p-8 shadow-md">
        <h1 className="mb-4 text-center text-3xl font-bold tracking-tight text-sky-700">
          Materias Disponibles
        </h1>
        <p className="mb-10 text-center text-base text-slate-700 max-w-2xl mx-auto">
          A continuación se muestran las materias que ya podés cursar según tu avance en la carrera. 
          Están organizadas por año y diferenciadas entre materias obligatorias y electivas. Esta vista 
          te ayuda a planificar de manera más clara tu próximo cuatrimestre.
        </p>

        <div className="grid gap-10 sm:grid-cols-2">
          {/* Materias */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-800">Materias</h2>
            {normalesPorAnio.length === 0 ? (
              <p className="italic text-slate-400">No hay materias disponibles.</p>
            ) : (
              <div className="space-y-6">
                {normalesPorAnio.map(([anio, arr]) => (
                  <div key={anio}>
                    <div className="mb-2 font-semibold text-sky-600">
                      {anio > 0 ? `${anio}º año` : "Sin año"}
                    </div>
                    <ul className="list-disc space-y-1 pl-6 text-slate-700">
                      {arr.map((m) => (
                        <li key={m.id}>{m.nombre}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Electivas */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-800">Electivas</h2>
            {electivasPorAnio.length === 0 ? (
              <p className="italic text-slate-400">No hay electivas disponibles.</p>
            ) : (
              <div className="space-y-6">
                {electivasPorAnio.map(([anio, arr]) => (
                  <div key={anio}>
                    <div className="mb-2 font-semibold text-sky-600">
                      {anio > 0 ? `${anio}º año` : "Sin año"}
                    </div>
                    <ul className="list-disc space-y-1 pl-6 text-slate-700">
                      {arr.map((m) => (
                        <li key={m.id}>{m.nombre}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
