// TEMP: Log roadmap steps for debug
import { useEffect } from "react";
import { Materia, RoadmapStep } from "../../lib/roadmap";

export default function RoadmapLogger({ steps }: { steps: RoadmapStep[] }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("ROADMAP STEPS:", steps.map(s => ({ year: s.year, cuat: s.cuatrimestre, materias: s.materias.map(m => m.nombre) })));
  }, [steps]);
  return null;
}
