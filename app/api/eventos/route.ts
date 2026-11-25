import { NextResponse } from 'next/server';
import { claveEventos } from '@/lib/ajustes';
import { avisar, type Nivel } from '@/lib/avisar';

/**
 * Puerta de entrada para tus otras apps (Lanzora, Mi Dinero…).
 * POST /api/eventos  con cabecera  Authorization: Bearer <clave de eventos>
 * Cuerpo: { "agente": "lanzora-solicitudes", "nivel": "urgente", "titulo": "...", "texto": "..." }
 */
export async function POST(req: Request) {
  const clave = await claveEventos();
  if (req.headers.get('authorization') !== `Bearer ${clave}`) {
    return NextResponse.json({ error: 'Clave incorrecta' }, { status: 401 });
  }
  const b = (await req.json().catch(() => ({}))) as { agente?: string; nivel?: Nivel; titulo?: string; texto?: string };
  if (!b.agente || !b.titulo) return NextResponse.json({ error: 'Faltan «agente» y «titulo»' }, { status: 400 });
  const nivel: Nivel = b.nivel === 'urgente' || b.nivel === 'importante' ? b.nivel : 'normal';
  try {
    const aviso = await avisar({ agente: b.agente, nivel, titulo: b.titulo.slice(0, 200), texto: (b.texto ?? '').slice(0, 2000) });
    return NextResponse.json({ ok: true, id: aviso.id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
