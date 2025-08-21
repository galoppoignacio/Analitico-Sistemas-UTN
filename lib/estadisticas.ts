import { DatosMaterias } from "../data/plan";

export function getEstadisticas() {
  const total = DatosMaterias.filter(m => !m.isElectiva).length;
  const aprobadas = DatosMaterias.filter(m => m.estado === 3 && !m.isElectiva).length;
  const faltan = total - aprobadas;
  const electivas = DatosMaterias.filter(m => m.isElectiva && m.estado === 3).length;
  // Promedio solo de materias aprobadas con nota > 0
  const aprobadasConNota = DatosMaterias.filter(m => m.estado === 3 && m.nota > 0);
  const promedio = aprobadasConNota.length > 0 ? (aprobadasConNota.reduce((acc, m) => acc + m.nota, 0) / aprobadasConNota.length).toFixed(2) : "-";
  return { aprobadas, faltan, electivas, promedio };
}
