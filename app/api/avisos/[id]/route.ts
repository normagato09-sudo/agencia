import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { estaDentro } from '@/lib/auth';
import { preparar, sql } from '@/lib/db';
import { cuandoVolver } from '@/lib/horas';

/**
 * Botones de un aviso (desde el chat o desde la notificación del móvil):
 *   { accion: 'hecho' }                          → lo marca como hecho
 *   { accion: 'tarde', cuando: '1h'|'tarde'|'manana' } → lo marca y lo vuelve a avisar entonces
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await estaDentro())) return NextResponse.json({ error: 'No has entrado' }, { status: 401 });
  const id = Number((await params).id);
  const b = (await req.json().catch(() => ({}))) as { accion?: string; cuando?: string };
  await preparar();
  const [aviso] = (await sql`SELECT id, agente, titulo FROM avisos WHERE id = ${id}`) as { id: number; agente: string; titulo: string }[];
  if (!aviso) return NextResponse.json({ error: 'No existe' }, { status: 404 });

  await sql`UPDATE avisos SET leido = true WHERE id = ${id}`;
  let mensaje = 'Hecho';
  if (b.accion === 'tarde') {
    const c = cuandoVolver(b.cuando ?? '1h');
    await sql`INSERT INTO recordatorios (agente, fecha, hora, texto) VALUES (${aviso.agente}, ${c.fecha}::date, ${c.hora}, ${aviso.titulo.slice(0, 300)})`;
    mensaje = `Te lo vuelvo a avisar ${c.texto}`;
  }
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, mensaje });
}
