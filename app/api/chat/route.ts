import { NextResponse } from 'next/server';
import { estaDentro } from '@/lib/auth';
import { mensajes, preparar, sql, type Mensaje } from '@/lib/db';
import { responderIA } from '@/lib/ia';

export async function GET() {
  if (!(await estaDentro())) return NextResponse.json({ error: 'No has entrado' }, { status: 401 });
  return NextResponse.json({ mensajes: await mensajes(60) });
}

export async function POST(req: Request) {
  if (!(await estaDentro())) return NextResponse.json({ error: 'No has entrado' }, { status: 401 });
  const { texto } = (await req.json().catch(() => ({}))) as { texto?: string };
  if (!texto?.trim()) return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 });
  await preparar();
  const [mio] = (await sql`INSERT INTO mensajes (de, texto) VALUES ('norma', ${texto.trim()}) RETURNING *`) as Mensaje[];
  const respuesta = await responderIA(texto);
  const [suyo] = (await sql`INSERT INTO mensajes (de, agente, texto)
    VALUES ('agente', 'secretaria', ${respuesta}) RETURNING *`) as Mensaje[];
  return NextResponse.json({ mensajes: [mio, suyo] });
}
