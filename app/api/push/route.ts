import { NextResponse } from 'next/server';
import { estaDentro } from '@/lib/auth';
import { clavesPush } from '@/lib/ajustes';
import { sql } from '@/lib/db';
import { enviarPush } from '@/lib/avisar';

// GET: clave pública para activar notificaciones.  POST: guardar este dispositivo.
export async function GET() {
  if (!(await estaDentro())) return NextResponse.json({ error: 'No has entrado' }, { status: 401 });
  return NextResponse.json({ publica: (await clavesPush()).publica });
}

export async function POST(req: Request) {
  if (!(await estaDentro())) return NextResponse.json({ error: 'No has entrado' }, { status: 401 });
  const sub = (await req.json()) as { endpoint?: string };
  if (!sub?.endpoint) return NextResponse.json({ error: 'Suscripción no válida' }, { status: 400 });
  await sql`INSERT INTO push_subs (endpoint, datos) VALUES (${sub.endpoint}, ${JSON.stringify(sub)}::jsonb)
    ON CONFLICT (endpoint) DO UPDATE SET datos = EXCLUDED.datos`;
  await enviarPush({ title: 'Mi Oficina', body: 'Notificaciones activadas en este dispositivo.' });
  return NextResponse.json({ ok: true });
}
