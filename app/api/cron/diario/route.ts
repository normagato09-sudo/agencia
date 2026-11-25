import { NextResponse } from 'next/server';
import { cronPermitido } from '@/lib/cron';
import { avisar } from '@/lib/avisar';
import { resumenDelDia } from '@/lib/chat';

// Cada mañana (08:00 en España): la Secretaria general te manda el resumen.
export async function GET(req: Request) {
  if (!cronPermitido(req)) return NextResponse.json({ error: 'No permitido' }, { status: 401 });
  const resumen = await resumenDelDia();
  await avisar({ agente: 'secretaria', nivel: 'importante', titulo: 'Buenos días, Norma. Este es tu resumen.', texto: resumen });
  return NextResponse.json({ ok: true });
}
