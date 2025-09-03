'use client';
import React, { useEffect, useState, useRef } from 'react';
import { extraerCarrerasNormalizadas } from '../../lib/mapeoCarreras';
import Navbar from '../Navbar';

interface Pasantia {
  empresa: string;
  referente: string;
  horarioEntrevista: string;
  carrera: string;
  conocimientos: string;
  otrosRequisitos: string;
  sueldo: string;
  horarioTrabajo: string;
  puesto: string;
  beneficios: string;
  cantidad: string;
  lugar: string;
  modalidad: string;
  email: string;
  link: string;
}


export default function PasantiasPage() {
  const [pasantias, setPasantias] = useState<Pasantia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCarreras, setSelectedCarreras] = useState<string[]>([]);
  const [showCarreraDropdown, setShowCarreraDropdown] = useState(false);
  const carreraDropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown si se hace click fuera
  useEffect(() => {
    if (!showCarreraDropdown) return;
    function handleClick(e: MouseEvent) {
      if (carreraDropdownRef.current && !carreraDropdownRef.current.contains(e.target as Node)) {
        setShowCarreraDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCarreraDropdown]);

  // Guardar todas las carreras únicas de los datos originales
  const [allCarreras, setAllCarreras] = useState<string[]>([]);
  useEffect(() => {
    const set = new Set<string>();
    const debugCarreras: { raw: string, normalizadas: string[] }[] = [];
    pasantias.forEach(p => {
      const normalizadas = extraerCarrerasNormalizadas(p.carrera);
      debugCarreras.push({ raw: p.carrera, normalizadas });
      normalizadas.forEach(val => {
        if (val && val !== '-') set.add(val);
      });
    });
    // Log temporal para depuración
    if (debugCarreras.length) {
      // eslint-disable-next-line no-console
      console.log('CARRERAS RAW Y NORMALIZADAS:', debugCarreras);
    }
    setAllCarreras(Array.from(set).sort());
  }, [pasantias]);

  // Filtrar pasantías por carreras seleccionadas
  const filtered = React.useMemo(() => {
    if (!selectedCarreras.length) return pasantias;
    return pasantias.filter(p =>
      selectedCarreras.some(sel =>
        extraerCarrerasNormalizadas(p.carrera).includes(sel)
      )
    );
  }, [pasantias, selectedCarreras]);

  useEffect(() => {
    fetch('/api/pasantias')
      .then(res => res.json())
      .then(data => {
        setPasantias(data.pasantias || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar las pasantías');
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />
      <div className="mt-6 mb-8 px-3 sm:px-6">
        <div className="mx-auto max-w-[98vw] rounded-2xl border border-[#e3e7ea] bg-white/90 shadow-[0_10px_30px_rgba(44,62,80,0.10)] backdrop-blur-sm">
          <div className="rounded-t-2xl bg-gradient-to-r from-[#e0f7fa] via-white to-[#f0f7ff] px-5 py-5 sm:px-8 sm:py-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1976d2]">Pasantías</h1>
            <p className="mt-2 text-[#1976d2] text-[1.08rem]">Listado actualizado de pasantías rentadas para estudiantes de la UTN FRC.</p>
          </div>
          <div className="w-full overflow-x-auto px-2 pb-6 sm:px-6">
            {loading && <p className="py-8 text-center text-lg">Cargando...</p>}
            {error && <p className="py-8 text-center text-red-600 font-semibold">{error}</p>}
            {!loading && !error && (
              <table className="mt-4 w-full min-w-[1600px] border-collapse overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(44,62,80,0.08)]">
                <thead>
                  <tr className="bg-gradient-to-r from-[#3c8dbc] to-[#2e86c1]">
                    <th className="px-3 py-3 text-left text-[1.02rem] font-semibold tracking-wide text-white border-b border-white/20">Empresa</th>
                    <th className="px-3 py-3 text-left text-[1.02rem] font-semibold tracking-wide text-white border-b border-white/20">Referente RRHH</th>
                    <th className="px-3 py-3 text-left text-[1.02rem] font-semibold tracking-wide text-white border-b border-white/20">Horario Entrevista</th>
                    <th className="px-3 py-3 text-left text-[1.02rem] font-semibold tracking-wide text-white border-b border-white/20 relative select-none">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          className="text-white font-semibold flex items-center gap-1 focus:outline-none"
                          onClick={() => setShowCarreraDropdown(v => !v)}
                        >
                          Carrera
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="inline ml-1"><path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z"/></svg>
                        </button>
                        {showCarreraDropdown && !loading && allCarreras.length > 0 && (
                          <div
                            ref={carreraDropdownRef}
                            className="absolute left-0 z-20 mt-2 w-[240px] max-h-72 overflow-y-auto rounded-lg border border-[#b2ebf2] bg-white shadow-lg p-2"
                          >
                            <div className="flex flex-col gap-1">
                              {allCarreras.map(c => (
                                <label key={c} className="flex items-center gap-2 cursor-pointer text-[#1976d2] text-sm px-1 py-1 rounded hover:bg-[#e0f7fa]">
                                  <input
                                    type="checkbox"
                                    checked={selectedCarreras.includes(c)}
                                    onChange={e => {
                                      if (e.target.checked) {
                                        setSelectedCarreras([...selectedCarreras, c]);
                                      } else {
                                        setSelectedCarreras(selectedCarreras.filter(x => x !== c));
                                      }
                                    }}
                                  />
                                  {c}
                                </label>
                              ))}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button
                                className="px-2 py-1 rounded bg-[#e0f7fa] text-[#1976d2] font-semibold border border-[#b2ebf2] hover:bg-[#b2ebf2] transition text-xs"
                                onClick={() => setSelectedCarreras([])}
                                type="button"
                              >
                                Limpiar
                              </button>
                              <button
                                className="px-2 py-1 rounded bg-[#3c8dbc] text-white font-semibold border border-[#b2ebf2] hover:bg-[#1976d2] transition text-xs"
                                onClick={() => setShowCarreraDropdown(false)}
                                type="button"
                              >
                                Cerrar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="px-3 py-3 text-left text-[1.02rem] font-semibold tracking-wide text-white border-b border-white/20">Conocimientos</th>
                    <th className="px-3 py-3 text-left text-[1.02rem] font-semibold tracking-wide text-white border-b border-white/20">Otros Requisitos</th>
                    <th className="px-3 py-3 text-left text-[1.02rem] font-semibold tracking-wide text-white border-b border-white/20">Sueldo</th>
                    <th className="px-3 py-3 text-left text-[1.02rem] font-semibold tracking-wide text-white border-b border-white/20">Horario Trabajo</th>
                    <th className="px-3 py-3 text-left text-[1.02rem] font-semibold tracking-wide text-white border-b border-white/20">Puesto</th>
                    <th className="px-3 py-3 text-left text-[1.02rem] font-semibold tracking-wide text-white border-b border-white/20">Beneficios</th>
                    <th className="px-3 py-3 text-left text-[1.02rem] font-semibold tracking-wide text-white border-b border-white/20">Cantidad</th>
                    <th className="px-3 py-3 text-left text-[1.02rem] font-semibold tracking-wide text-white border-b border-white/20">Lugar</th>
                    <th className="px-3 py-3 text-left text-[1.02rem] font-semibold tracking-wide text-white border-b border-white/20">Modalidad</th>
                    <th className="px-3 py-3 text-left text-[1.02rem] font-semibold tracking-wide text-white border-b border-white/20">Email</th>
                    <th className="px-3 py-3 text-left text-[1.02rem] font-semibold tracking-wide text-white border-b border-white/20">Link</th>
                  </tr>
                </thead>
                <tbody className="text-[0.98rem]">
                  {filtered.map((p, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-[#f6fff7]' : 'bg-white'}>
                      <td className="px-3 py-2 align-top border-b border-[#e3e7ea]">{p.empresa}</td>
                      <td className="px-3 py-2 align-top border-b border-[#e3e7ea]">{p.referente}</td>
                      <td className="px-3 py-2 align-top border-b border-[#e3e7ea]">{(p.horarioEntrevista || '').replace(/\s*SOLICITA\s*/gi, '').trim()}</td>
                      <td className="px-3 py-2 align-top border-b border-[#e3e7ea]">{p.carrera}</td>
                      <td className="px-3 py-2 align-top border-b border-[#e3e7ea] whitespace-pre-line max-w-[700px]">{p.conocimientos}</td>
                      <td className="px-3 py-2 align-top border-b border-[#e3e7ea] whitespace-pre-line max-w-[220px]">{p.otrosRequisitos}</td>
                      <td className="px-3 py-2 align-top border-b border-[#e3e7ea] whitespace-pre-line max-w-[160px]">{p.sueldo}</td>
                      <td className="px-3 py-2 align-top border-b border-[#e3e7ea]">{p.horarioTrabajo}</td>
                      <td className="px-3 py-2 align-top border-b border-[#e3e7ea]">{p.puesto}</td>
                      <td className="px-3 py-2 align-top border-b border-[#e3e7ea] whitespace-pre-line max-w-[220px]">{p.beneficios}</td>
                      <td className="px-3 py-2 align-top border-b border-[#e3e7ea]">{p.cantidad}</td>
                      <td className="px-3 py-2 align-top border-b border-[#e3e7ea]">{p.lugar}</td>
                      <td className="px-3 py-2 align-top border-b border-[#e3e7ea]">{p.modalidad}</td>
                      <td className="px-3 py-2 align-top border-b border-[#e3e7ea]">
                        {p.email !== '-' ? (
                          <a href={`mailto:${p.email}`} className="text-blue-700 underline">{p.email}</a>
                        ) : '-' }
                      </td>
                      <td className="px-3 py-2 align-top border-b border-[#e3e7ea]">
                        {p.link !== '-' ? (
                          <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Link</a>
                        ) : '-' }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
