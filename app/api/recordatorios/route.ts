import { NextResponse } from 'next/server';
import { claveEventos } from '@/lib/ajustes';
import { preparar, sql } from '@/lib/db';

/**
 * Tus otras apps pueden programar recordatorios (p. ej. CIFA: «reunión en 15 minutos»).
 * POST /api/recordatorios  con  Authorization: Bearer <clave de eventos>
 * Cuerpo: { "agente": "cifa-reuniones", "fecha": "AAAA-MM-DD", "hora": "HH:MM", "texto": "..." }
 * Si ya existe uno igual (mismo agente, día, hora y texto) no se repite.
 */
export async function POST(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${await claveEventos()}`) {
    return NextResponse.json({ error: 'Clave incorrecta' }, { status: 401 });
  }
  const b = (await req.json().catch(() => ({}))) as { agente?: string; fecha?: string; hora?: string; texto?: string };
  const texto = (b.texto ?? '').trim().slice(0, 300);
  if (!b.agente || !/^\d{4}-\d{2}-\d{2}$/.test(b.fecha ?? '') || !/^\d{2}:\d{2}$/.test(b.hora ?? '') || !texto) {
    return NextResponse.json({ error: 'Faltan agente, fecha, hora o texto' }, { status: 400 });
  }
  await preparar();
  const existe = (await sql`SELECT 1 FROM agentes WHERE slug = ${b.agente}`) as unknown[];
  if (!existe.length) return NextResponse.json({ error: `No existe el agente «${b.agente}»` }, { status: 400 });
  const r = (await sql`INSERT INTO recordatorios (agente, fecha, hora, texto)
    SELECT ${b.agente}, ${b.fecha}::date, ${b.hora}, ${texto}
    WHERE NOT EXISTS (SELECT 1 FROM recordatorios WHERE agente = ${b.agente} AND fecha = ${b.fecha}::date AND hora = ${b.hora} AND texto = ${texto})
    RETURNING id`) as { id: number }[];
  return NextResponse.json({ ok: true, nuevo: r.length > 0 });
}
