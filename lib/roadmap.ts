// Calculador de roadmap óptimo de cursada UTN
// Considera correlativas, modalidad, electivas, y distribución de carga

import { DatosMaterias, Materia } from "../data/plan";
export type { Materia } from "../data/plan";

export interface RoadmapStep {
  year: number;
  cuatrimestre: 1 | 2 | "A" | "rendir";
  materias: Materia[];
}

export interface RoadmapResult {
  steps: RoadmapStep[];
  electivasUsadas: number;
}

// Utilidad: filtra materias habilitadas para cursar en el cuatrimestre dado el estado actual
// Simula la cursada cuatrimestre a cuatrimestre y arma el roadmap





export function calcularRoadmap(
  estadoActual: Record<number, "aprobada" | "regular" | "pendiente" | "disponible" | "en curso">
): RoadmapResult {
  const materiasBase = DatosMaterias.map(m => ({ ...m }));
  // Mapear correctamente los estados según el JSON y la store:
  // 3 = aprobada, 2 = regular, 4 = en curso, 1 = disponible, 0 = no disponible
  let materiasSim = materiasBase.map(m => ({
    ...m,
    estado:
      estadoActual[m.id] === "aprobada" ? 3 :
      estadoActual[m.id] === "regular" ? 2 :
      estadoActual[m.id] === "en curso" ? 4 :
      estadoActual[m.id] === "disponible" ? 1 :
      0
  }));

  // Guardar los IDs de materias ya aprobadas al inicio
  const idsAprobadasInicial = new Set<number>();
  for (const m of materiasSim) {
    if (m.estado === 3) idsAprobadasInicial.add(m.id);
  }

  const currentYear = new Date().getFullYear();
  let year = currentYear;
  let steps: RoadmapStep[] = [];
  const totalNormales = materiasSim.filter(m => !m.isElectiva && !m.nombre.toLowerCase().includes("seminario")).length;
  let maxAnios = 15;
  let anioSimulado = 0;

  // Nueva simulación robusta: año a año, cuatrimestre a cuatrimestre, mostrando TODO lo pendiente
  let materiasPendientes = () => materiasSim.filter(m => !m.isElectiva && !m.nombre.toLowerCase().includes("seminario") && m.estado !== 3);
  let materiasYaEnRoadmap = new Set<number>();
  let materiasYaEnRendir = new Set<number>();
  year = currentYear;
  anioSimulado = 0;
  let cuatrimestreActual: 1 | 2 = 1;
  while (materiasPendientes().length > 0 && anioSimulado < maxAnios) {
    // 1. Materias regulares (estado 2) que no estén ya en "Rendir"
    if (cuatrimestreActual === 1) { // Solo agregar "Rendir" una vez por año
    const regulares = materiasSim.filter(m => m.estado === 2 && !m.isElectiva && !m.nombre.toLowerCase().includes("seminario") && !materiasYaEnRendir.has(m.id));
      if (regulares.length > 0) {
        steps.push({ year, cuatrimestre: 'rendir', materias: regulares });
        regulares.forEach(m => materiasYaEnRendir.add(m.id));
      }
    }
    // 2. Materias disponibles para cursar este cuatrimestre
    const disponibles = materiasSim.filter(m => m.estado === 1 && !m.isElectiva && !m.nombre.toLowerCase().includes("seminario") && !materiasYaEnRoadmap.has(m.id));
    if (disponibles.length > 0) {
      steps.push({ year, cuatrimestre: cuatrimestreActual, materias: disponibles });
      disponibles.forEach(m => materiasYaEnRoadmap.add(m.id));
    }
    // 3. Materias en curso (estado 4) solo si no están ya en roadmap
    const enCurso = materiasSim.filter(m => m.estado === 4 && !m.isElectiva && !m.nombre.toLowerCase().includes("seminario") && !materiasYaEnRoadmap.has(m.id));
    if (enCurso.length > 0) {
      steps.push({ year, cuatrimestre: cuatrimestreActual, materias: enCurso });
      enCurso.forEach(m => materiasYaEnRoadmap.add(m.id));
    }
    // 4. Marcar como aprobadas las materias cursadas este cuatrimestre (disponibles y en curso)
    if (disponibles.length > 0 || enCurso.length > 0) {
      materiasSim = materiasSim.map(m =>
        (disponibles.some(c => c.id === m.id) || enCurso.some(c => c.id === m.id)) ? { ...m, estado: 3 } : m
      );
    }
    // 5. Recalcular el estado de TODAS las materias (simular el algoritmo de la tabla principal)
    materiasSim = materiasSim.map(m => {
      if (m.estado === 3) return m;
      const regOk = m.materiasQueNecesitaRegulares.every(rid => {
        const mat = materiasSim.find(x => x.id === rid);
        return mat && (mat.estado === 2 || mat.estado === 3 || mat.estado === 4);
      });
      const aprOk = m.materiasQueNecesitaAprobadas.every(rid => {
        const mat = materiasSim.find(x => x.id === rid);
        return mat && mat.estado === 3;
      });
      return regOk && aprOk ? { ...m, estado: 1 } : { ...m, estado: 0 };
    });
    // Alternar cuatrimestre
    if (cuatrimestreActual === 1) {
      cuatrimestreActual = 2;
    } else {
      cuatrimestreActual = 1;
      year++;
      anioSimulado++;
    }
  }
  return { steps, electivasUsadas: 0 };
}
