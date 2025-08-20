
import styles from "./RoadmapTable.module.css";
import { Materia, RoadmapStep } from "../../lib/roadmap";
import RoadmapLogger from "./RoadmapLogger";

interface Props {
  steps: RoadmapStep[];
}

// Agrupa por año
function agruparPorAnio(steps: RoadmapStep[]) {
  const anios: { [year: number]: { 1?: Materia[]; 2?: Materia[]; rendir?: Materia[] } } = {};
  steps.forEach((step) => {
    if (!anios[step.year]) anios[step.year] = {};
    if (step.cuatrimestre === 1 || step.cuatrimestre === 2) {
      anios[step.year][step.cuatrimestre] = step.materias;
    } else if (step.cuatrimestre === 'rendir') {
      anios[step.year].rendir = step.materias;
    }
  });
  return anios;
}

export default function RoadmapTable({ steps }: Props) {
  const anios = agruparPorAnio(steps);

  // Buscar materias anuales por año
  const getAnuales = (mats1: Materia[] = [], mats2: Materia[] = []) => {
    const ids = new Set<number>();
    const anuales: Materia[] = [];
    [...mats1, ...mats2].forEach(m => {
      if (m.modalidad === "A" && !ids.has(m.id)) {
        anuales.push(m);
        ids.add(m.id);
      }
    });
    return anuales;
  };
  // 1C-2C solo en 1C, 2C-1C solo en 2C, el resto normal
  const getCuatrimestrales = (mats: Materia[] = [], cuat: 1 | 2) =>
    mats.filter(m => {
      if (m.modalidad === "A") return false;
      if (m.modalidad === "1C-2C") return cuat === 1;
      if (m.modalidad === "2C-1C") return cuat === 2;
      return m.modalidad !== "A";
    });


  // Buscar materias regulares (estado 2) para la columna "Rendir"
  const getRegulares = (mats: Materia[] = []) =>
    mats.filter(m => m.estado === 2);

  // Filtrar materias que NO estén regulares para las columnas de cursada
  const filtrarNoRegulares = (mats: Materia[] = []) =>
    mats.filter(m => m.estado !== 2);

  return (
    <>
      <RoadmapLogger steps={steps} />
      <table className={styles.table} style={{ marginTop: 32 }}>
        <thead>
          <tr>
            <th className={styles.anioHeaderCell}>Año</th>
            <th className={styles.anioHeaderCell}>1° Cuatrimestre</th>
            <th className={styles.anioHeaderCell}>2° Cuatrimestre</th>
            <th className={styles.anioHeaderCell}>Rendir</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(anios).map(([year, cuats], idx) => {
            // Filtrar materias regulares para que solo aparezcan en "Rendir"
            const anuales = filtrarNoRegulares(getAnuales(cuats[1], cuats[2]));
            const cuat1 = filtrarNoRegulares(getCuatrimestrales(cuats[1], 1));
            const cuat2 = filtrarNoRegulares(getCuatrimestrales(cuats[2], 2));
            // Materias regulares para rendir (de ambos cuat y de paso especial 'rendir')
            const regulares = [
              ...getRegulares([...(cuats[1] || []), ...(cuats[2] || [])]),
              ...(cuats.rendir || [])
            ];
            // Unir todas las materias en una sola lista de filas, cada fila solo una materia
            const maxFilas = Math.max(anuales.length, cuat1.length, cuat2.length, regulares.length);
            const filas = Array.from({ length: maxFilas }, (_, i) => ({
              anual: anuales[i],
              cuat1: cuat1[i],
              cuat2: cuat2[i],
              regular: regulares[i],
            }));
            return filas.map((fila, i) => (
              <tr key={year + '-' + i}>
                {i === 0 && (
                  <td className={styles.anioHeaderCell} rowSpan={maxFilas}>{year}</td>
                )}
                <td>
                  {fila.anual ? (
                    <div className={styles.anualCell}>
                      {fila.anual.nombre} {fila.anual.isElectiva && <span className={styles.electiva}>Electiva</span>}
                      <span className={styles.materiaModalidad}>({fila.anual.modalidad})</span>
                    </div>
                  ) : fila.cuat1 ? (
                    <div className={styles.cuatrimestralCell}>
                      {fila.cuat1.nombre} {fila.cuat1.isElectiva && <span className={styles.electiva}>Electiva</span>}
                      <span className={styles.materiaModalidad}>({fila.cuat1.modalidad})</span>
                    </div>
                  ) : null}
                </td>
                <td>
                  {fila.anual ? (
                    <div className={styles.anualCell}>
                      {fila.anual.nombre} {fila.anual.isElectiva && <span className={styles.electiva}>Electiva</span>}
                      <span className={styles.materiaModalidad}>({fila.anual.modalidad})</span>
                    </div>
                  ) : fila.cuat2 ? (
                    <div className={styles.cuatrimestralCell}>
                      {fila.cuat2.nombre} {fila.cuat2.isElectiva && <span className={styles.electiva}>Electiva</span>}
                      <span className={styles.materiaModalidad}>({fila.cuat2.modalidad})</span>
                    </div>
                  ) : null}
                </td>
                <td>
                  {fila.regular ? (
                    <div className={styles.regularCell}>
                      {fila.regular.nombre} {fila.regular.isElectiva && <span className={styles.electiva}>Electiva</span>}
                      <span className={styles.materiaModalidad}>({fila.regular.modalidad})</span>
                    </div>
                  ) : null}
                </td>
              </tr>
            ));
          })}
        </tbody>
      </table>
    </>
  );
}
