import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const PASANTIAS_URL = 'https://seu.frc.utn.edu.ar/?pIs=1286';
// Selector CSS correcto según el HTML recibido
const PASANTIAS_SELECTOR = '#a60492 .show-hide';

export async function GET() {
  try {
    const res = await fetch(PASANTIAS_URL, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'accept': 'text/html',
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('Error al hacer fetch:', res.status, res.statusText);
      return NextResponse.json({ error: 'No se pudo obtener la página de pasantías' }, { status: 500 });
    }
    const html = await res.text();
    const $ = cheerio.load(html);
  const rawText = $(PASANTIAS_SELECTOR).text();
    if (!rawText || rawText.trim().length === 0) {
      console.error('No se encontró el selector de pasantías. Enviando HTML para inspección.');
      return NextResponse.json({ error: 'No se encontró el contenido de pasantías', html }, { status: 500 });
    }
    // Separar por cada "A.R.M." (o similar) para cada pasantía
    const blocks = rawText.split(/A\.R\.M\.? \d+\/\d+/).map(b => b.trim()).filter(Boolean);

    // Campos a buscar y sus variantes
    const fieldPatterns = [
      { key: 'empresa', patterns: [/NOMBRE DE LA EMPRESA\/ORGANISMO:/i, /NOMBRE DE LA EMPRESA:/i, /Nombre de la Empresa:/i] },
      { key: 'direccion', patterns: [/DIRECCION:/i, /DIRECCIÓN:/i] },
      { key: 'ciudad', patterns: [/CIUDAD:/i] },
      { key: 'telefono', patterns: [/TELEFONO Y FAX:/i, /TEL[ÉE]FONO:/i, /TEL:/i, /FAX:/i] },
      { key: 'referente', patterns: [/REFERENTE DE RRHH:/i, /FUNCIONARIO ACTUANTE:/i] },
      { key: 'horarioEntrevista', patterns: [/HORARIO PARA ENTREVISTA:/i] },
      { key: 'perfilSolicitado', patterns: [/PERFIL SOLICITADO/i] },
      { key: 'estudianteODocente', patterns: [/ESTUDIANTE O DOCENTE\.?/i] },
      { key: 'especialidad', patterns: [/ESPECIALIDAD:/i] },
      { key: 'experiencia', patterns: [/EXPERIENCIA:/i] },
      { key: 'otrosConocimientos', patterns: [/OTROS CONOCIMIENTOS:/i] },
      { key: 'otrosRequisitos', patterns: [/OTROS REQUISITOS:/i] },
      { key: 'carrera', patterns: [/ESTUDIANTE DE LA CARRERA:/i, /ESTUDIANTE:/i] },
      { key: 'conocimientos', patterns: [/CONOCIMIENTOS:/i] },
      { key: 'sueldo', patterns: [/ASIGNACI[ÓO]N EST[ÍI]MULO:/i, /REMUNERACION APROXIMADA:/i, /REMUNERACIÓN APROXIMADA:/i] },
      { key: 'horarioTrabajo', patterns: [/HORARIO DE TRABAJO:?/i, /HORARIO:/i] },
      { key: 'puesto', patterns: [/PUESTO\/?[ÁA]REA A CUBRIR:/i, /CARGO A CUBRIR:/i] },
      { key: 'beneficios', patterns: [/BENEFICIOS:/i, /OTROS BENEFICIOS:/i, /SE OFRECE/i] },
      { key: 'cantidad', patterns: [/CANTIDAD DE PASANTES:/i] },
      { key: 'lugar', patterns: [/LUGAR DE TRABAJO:/i] },
      { key: 'modalidad', patterns: [/MODALIDAD \(PRESENCIAL, H[ÍI]BRIDA O REMOTO\):/i, /MODALIDAD \(PRESENCIAL O REMOTO\):/i] },
      { key: 'sexo', patterns: [/SEXO:/i] },
      { key: 'duracion', patterns: [/DURACION DE LA PASANTIA:/i, /DURACIÓN DE LA PASANTÍA:/i, /DURACIÓN:/i] },
      { key: 'email', patterns: [/Enviar CV a:/i] },
      { key: 'link', patterns: [/Link:/i] },
    ];

    // Extrae los campos de un bloque de texto

    // Campos que deben mantener saltos de línea
    const multilineFields = ['conocimientos', 'beneficios', 'otrosRequisitos'];

    function extractFields(block) {
      // Unir todo el bloque en un solo string para buscar campos pegados
      let text = block.replace(/\r/g, '');
      // Reemplazar todos los nombres de campo por un salto de línea + el nombre del campo (si no está al inicio)
      for (const f of fieldPatterns) {
        for (const p of f.patterns) {
          text = text.replace(new RegExp(`([^\n])(${p.source})`, 'gi'), '$1\n$2');
        }
      }
      // Ahora sí, separar por líneas
      const lines = text.split('\n');
      const result = {};
      let currentKey = null;
      let buffer = [];
      // Mapeo de patrón a key
      const patternToKey = [];
      for (const f of fieldPatterns) {
        for (const p of f.patterns) {
          patternToKey.push([p, f.key]);
        }
      }
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let matched = false;
        for (const [pattern, key] of patternToKey) {
          if (pattern.test(line)) {
            if (currentKey) {
              if (multilineFields.includes(currentKey)) {
                result[currentKey] = buffer.map(l => l.trimEnd()).join('\n').replace(/^\n+|\n+$/g, '') || '-';
              } else {
                result[currentKey] = buffer.join(' ').replace(/\s+/g, ' ').trim() || '-';
              }
            }
            currentKey = key;
            buffer = [line.replace(pattern, '').trimEnd()];
            matched = true;
            break;
          }
        }
        if (!matched && currentKey) {
          buffer.push(line.trimEnd());
        }
      }
      if (currentKey) {
        if (multilineFields.includes(currentKey)) {
          result[currentKey] = buffer.map(l => l.trimEnd()).join('\n').replace(/^\n+|\n+$/g, '') || '-';
        } else {
          result[currentKey] = buffer.join(' ').replace(/\s+/g, ' ').trim() || '-';
        }
      }
      for (const f of fieldPatterns) {
        if (!(f.key in result)) {
          result[f.key] = '-';
        }
      }
      return result;
    }

    const pasantias = blocks.map(block => extractFields(block));
    return NextResponse.json({ pasantias });
  } catch (e) {
    console.error('Error en API pasantías:', e);
    return NextResponse.json({ error: 'Error al obtener pasantías' }, { status: 500 });
  }
}
