import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import * as cheerio from 'cheerio';
import { diffWords } from 'diff';
import { Resend } from 'resend';


const PASANTIAS_URL = 'https://seu.frc.utn.edu.ar/?pIs=1286';
const PASANTIAS_SELECTOR = '#a60492 .show-hide';

// --- Scraping y parsing reutilizando tu lógica ---
async function obtenerPasantiasDeLaWeb() {
  const res = await fetch(PASANTIAS_URL, { headers: { 'user-agent': 'Mozilla/5.0' }, cache: 'no-store' });
  if (!res.ok) throw new Error('No se pudo obtener la página de pasantías');
  const html = await res.text();
  const $ = cheerio.load(html);
  const rawText = $(PASANTIAS_SELECTOR).text();
  if (!rawText || rawText.trim().length === 0) throw new Error('No se encontró el selector de pasantías');
  const blocks = rawText.split(/A\.R\.M\.? \d+\/\d+/).map(b => b.trim()).filter(Boolean);
  // ...reutiliza tu lógica de parsing de campos aquí...
  // Por simplicidad, solo devuelvo los bloques, pero deberías copiar tu extractFields
  return blocks;
}


const resend = new Resend(process.env.RESEND_API_KEY);

function resaltarCambios(oldText: string, newText: string) {
  const diff = diffWords(oldText, newText);
  return diff.map(part => {
    if (part.added) return `<span style="background:#ccffcc">${part.value}</span>`;
    if (part.removed) return `<span style="background:#ffcccc;text-decoration:line-through">${part.value}</span>`;
    return part.value;
  }).join('');
}

async function enviarMailConCambios(anterior: any, nuevo: any) {
  const oldStr = JSON.stringify(anterior, null, 2);
  const newStr = JSON.stringify(nuevo, null, 2);
  const htmlDiff = resaltarCambios(oldStr, newStr);
  await resend.emails.send({
    from: 'notificaciones@tudominio.com', // Cambia por tu dominio verificado
  to: 'ignaa.galoppo@gmail.com',
    subject: 'Cambios detectados en pasantías',
    html: `<h2>Cambios detectados</h2><pre style="font-family:monospace">${htmlDiff}</pre>`
  });
}

export async function GET() {
  try {
    const nuevasPasantias = await obtenerPasantiasDeLaWeb();
    const { data: anterior, error } = await supabase
      .from('pasantias_snapshot')
      .select('data')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    const hayCambios = !anterior || JSON.stringify(anterior.data) !== JSON.stringify(nuevasPasantias);
    if (hayCambios) {
      await supabase.from('pasantias_snapshot').insert([{ data: nuevasPasantias }]);
      await enviarMailConCambios(anterior?.data, nuevasPasantias);
    }
    return NextResponse.json({ ok: true, hayCambios });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
