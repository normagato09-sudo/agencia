import { NextResponse } from 'next/server';
import { cronPermitido } from '@/lib/cron';
import { avisar } from '@/lib/avisar';

// Cada tarde (20:00 en España): el agente de Puntos te recuerda marcar lo que has hecho.
export async function GET(req: Request) {
  if (!cronPermitido(req)) return NextResponse.json({ error: 'No permitido' }, { status: 401 });
  await avisar({
    agente: 'puntos-diario', nivel: 'importante',
    titulo: 'Toca marcar en Puntos lo que has hecho hoy.',
    texto: 'Entra en la app de Puntos y marca tus tareas del día antes de dormir.',
  });
  return NextResponse.json({ ok: true });
}
