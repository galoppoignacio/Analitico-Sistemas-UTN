// Mapeo y normalización de carreras para filtros
export const mapeoCarreras: Record<string, string> = {
  // Ingeniería en Sistemas
  "ingenieria en sistemas": "Ingeniería en Sistemas",
  "ing sistemas": "Ingeniería en Sistemas",
  "ing. en sistemas": "Ingeniería en Sistemas",
  "informatica": "Ingeniería en Sistemas",
  "informática": "Ingeniería en Sistemas",
  "computacion": "Ingeniería en Sistemas",
  "computación": "Ingeniería en Sistemas",
  "sistemas": "Ingeniería en Sistemas",
  "sistemas o relacionadas": "Ingeniería en Sistemas",
  "ing. informática": "Ingeniería en Sistemas",
  "ingenieria informatica": "Ingeniería en Sistemas",
  "ingeniería informática": "Ingeniería en Sistemas",
  "informática (avanzado)": "Ingeniería en Sistemas",
  "ingenieria en sistemas o relacionadas": "Ingeniería en Sistemas",
  "ingeniera industrial y sistemas": "Ingeniería en Sistemas",
  // Ingeniería Industrial
  "ingenieria industrial": "Ingeniería Industrial",
  "industrial": "Ingeniería Industrial",
  "ing industrial": "Ingeniería Industrial",
  "ing. industrial": "Ingeniería Industrial",
  // Ingeniería Electrónica
  "ingenieria electronica": "Ingeniería Electrónica",
  "electronica": "Ingeniería Electrónica",
  "ing electronica": "Ingeniería Electrónica",
  "ing. electronica": "Ingeniería Electrónica",
  "electrónica": "Ingeniería Electrónica",
  "electrónicos": "Ingeniería Electrónica",
  "electrónico": "Ingeniería Electrónica",
  // Ingeniería Química
  "ingenieria quimica": "Ingeniería Química",
  "quimica": "Ingeniería Química",
  "ing quimica": "Ingeniería Química",
  "ing. quimica": "Ingeniería Química",
  // Ingeniería Mecánica
  "ingenieria mecanica": "Ingeniería Mecánica",
  "mecanica": "Ingeniería Mecánica",
  "mecánicos": "Ingeniería Mecánica",
  "mecánico": "Ingeniería Mecánica",
  "ing mecanica": "Ingeniería Mecánica",
  "ing. mecanica": "Ingeniería Mecánica",
  // Otras variantes comunes
  "civil": "Ingeniería Civil",
  "ingenieria civil": "Ingeniería Civil",
  "ing civil": "Ingeniería Civil",
  "ing. civil": "Ingeniería Civil",
};


// Función para quitar tildes y normalizar mayúsculas/minúsculas
function normalizarTexto(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/\./g, '')
    .trim();
}

// Devuelve un array de carreras normalizadas únicas a partir de un string de entrada
export function extraerCarrerasNormalizadas(input: string): string[] {
  if (!input) return [];
  // Separar por conectores y signos comunes, pero NO por 'en'
  const partes = input
    .split(/,|\/|\||\n| y | o | – | - |·|•/i)
    .map(p => p.trim())
    .filter(Boolean);

  // Palabras a ignorar si aparecen solas
  const ignorar = [
    'afines', 'relacionadas', 'relacionados', 'afin', 'afin.', 'afines.', 'afines,', 'afines;', 'afines:',
    'etc', 'etc.', 'otras', 'otro', 'otros', 'otras.', 'otro.', 'otros.', 'tecnicatura', 'tecnicaturas', 'licenciatura', 'licenciaturas', 'carrera', 'carreras', 'formacion', 'formacion.', 'formacion.'
  ];

  const resultado = new Set<string>();
  for (let parte of partes) {
    let key = normalizarTexto(parte);
    if (!key || ignorar.includes(key)) continue;
    // Normalización exacta
    if (mapeoCarreras[key]) {
      resultado.add(mapeoCarreras[key]);
      continue;
    }
    // Fuzzy
    if (/sistema|informatic|computaci/.test(key)) {
      resultado.add("Ingeniería en Sistemas");
      continue;
    }
    if (/industrial/.test(key)) {
      resultado.add("Ingeniería Industrial");
      continue;
    }
    if (/electromecanic/.test(key)) {
      resultado.add("Ingeniería Electromecánica");
      continue;
    }
    if (/electronic/.test(key)) {
      resultado.add("Ingeniería Electrónica");
      continue;
    }
    if (/quimic/.test(key)) {
      resultado.add("Ingeniería Química");
      continue;
    }
    if (/mecanic/.test(key)) {
      resultado.add("Ingeniería Mecánica");
      continue;
    }
    if (/civil/.test(key)) {
      resultado.add("Ingeniería Civil");
      continue;
    }
    if (/electric/.test(key)) {
      resultado.add("Ingeniería Eléctrica");
      continue;
    }
    if (/higiene.*seguridad|seguridad.*higiene/.test(key)) {
      resultado.add("Higiene y Seguridad en el Trabajo");
      continue;
    }
    if (/programaci/.test(key)) {
      resultado.add("Tecnicatura en Programación");
      continue;
    }
    // Si no matchea, devolver la parte original capitalizada
    resultado.add(
      parte.trim()
        .replace(/\s+/g, ' ')
        .replace(/^([a-z])/g, l => l.toUpperCase())
    );
  }
  return Array.from(resultado);
}
