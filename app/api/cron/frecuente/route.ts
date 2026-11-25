import { NextResponse } from 'next/server';
import { cronPermitido } from '@/lib/cron';
import { enviarRecordatorios, revisarTickets } from '@/lib/vigilar';

export const dynamic = 'force-dynamic';

// Se llama cada 10 minutos (GitHub Actions, ver .github/workflows/vigilar.yml): recordatorios y tickets.
export async function GET(req: Request) {
  if (!cronPermitido(req)) return NextResponse.json({ error: 'No permitido' }, { status: 401 });
  const resultado: Record<string, unknown> = {};
  try { resultado.recordatorios = await enviarRecordatorios(); } catch (e) { resultado.errorRecordatorios = (e as Error).message; }
  try { resultado.tickets = await revisarTickets(); } catch (e) { resultado.errorTickets = (e as Error).message; }
  return NextResponse.json({ ok: true, ...resultado });
}
