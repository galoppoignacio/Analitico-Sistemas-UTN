"use client";
import { useMateriasStore } from "../../lib/materiasStore";
import Navbar from "../Navbar";

  
export default function DisponiblesPage() {
  const materias = useMateriasStore((state) => state.materias);

  // Mostrar materias con estado === 1 (disponible)
  const disponibles = materias.filter(m => m.estado === 1);

  // Agrupar por año
  function groupByYear(arr) {
    const map = new Map();
    arr.forEach(m => {
      const year = m.anio || 0;
      if (!map.has(year)) map.set(year, []);
      map.get(year).push(m);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }

  const normales = disponibles.filter(m => !m.isElectiva);
  const electivas = disponibles.filter(m => m.isElectiva);
  const normalesPorAnio = groupByYear(normales);
  const electivasPorAnio = groupByYear(electivas);

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '32px auto', padding: '1.5rem', background: '#f8fafc', borderRadius: 12, boxShadow: '0 2px 12px rgba(44,62,80,0.07)' }}>
        <h1 style={{ fontSize: '2rem', color: '#3c8dbc', marginBottom: 18, textAlign: 'center' }}>Materias Disponibles</h1>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h2 style={{ fontSize: '1.2rem', color: '#222', marginBottom: 10 }}>Materias</h2>
            {normalesPorAnio.length === 0 ? (
              <div style={{ color: '#888', fontStyle: 'italic' }}>No hay materias disponibles.</div>
            ) : (
              <>
                {normalesPorAnio.map(([anio, arr]) => (
                  <div key={anio} style={{ marginBottom: 14 }}>
                    <div style={{ fontWeight: 600, color: '#3c8dbc', marginBottom: 4 }}>{anio > 0 ? `${anio}º año` : 'Sin año'}</div>
                    <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
                      {arr.map(m => (
                        <li key={m.id} style={{ marginBottom: 6 }}>{m.nombre}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h2 style={{ fontSize: '1.2rem', color: '#222', marginBottom: 10 }}>Electivas</h2>
            {electivasPorAnio.length === 0 ? (
              <div style={{ color: '#888', fontStyle: 'italic' }}>No hay electivas disponibles.</div>
            ) : (
              <>
                {electivasPorAnio.map(([anio, arr]) => (
                  <div key={anio} style={{ marginBottom: 14 }}>
                    <div style={{ fontWeight: 600, color: '#3c8dbc', marginBottom: 4 }}>{anio > 0 ? `${anio}º año` : 'Sin año'}</div>
                    <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
                      {arr.map(m => (
                        <li key={m.id} style={{ marginBottom: 6 }}>{m.nombre}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
