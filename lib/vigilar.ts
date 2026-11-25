import { preparar, sql } from './db';
import { avisar } from './avisar';
import { guardarAjuste, leerAjuste } from './ajustes';

/** Manda los recordatorios cuya fecha y hora (hora de España) ya han llegado. */
export async function enviarRecordatorios(): Promise<number> {
  await preparar();
  const toca = (await sql`UPDATE recordatorios SET enviado = true
    WHERE enviado = false AND ((fecha + hora::time) AT TIME ZONE 'Europe/Madrid') <= now()
    RETURNING id, agente, texto`) as { id: number; agente: string; texto: string }[];
  for (const r of toca) {
    await avisar({ agente: r.agente, nivel: 'importante', titulo: `Recordatorio: ${r.texto}` }).catch(() => {});
  }
  return toca.length;
}

/**
 * Tickets de Discord de Lanzora: mira los canales del servidor con el bot y avisa de los nuevos.
 * Variables: DISCORD_BOT_TOKEN, DISCORD_TICKETS_SERVIDOR (id del servidor) y, opcional,
 * DISCORD_TICKETS_CATEGORIA (id de la categoría donde se crean los tickets). Sin categoría,
 * cuenta como ticket cualquier canal con «ticket» en el nombre.
 */
export async function revisarTickets(): Promise<number | null> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const servidor = process.env.DISCORD_TICKETS_SERVIDOR;
  if (!token || !servidor) return null;
  const categoria = process.env.DISCORD_TICKETS_CATEGORIA;

  const r = await fetch(`https://discord.com/api/v10/guilds/${servidor}/channels`, {
    headers: { Authorization: `Bot ${token}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`Discord respondió ${r.status}`);
  const canales = (await r.json()) as { id: string; name: string; type: number; parent_id: string | null }[];
  const tickets = canales.filter((c) =>
    (c.type === 0 || c.type === 5) && (categoria ? c.parent_id === categoria : c.name.toLowerCase().includes('ticket')),
  );

  const vistosTxt = await leerAjuste('tickets_vistos');
  const ids = tickets.map((c) => c.id);
  await guardarAjuste('tickets_vistos', JSON.stringify(ids));
  if (vistosTxt === null) return 0; // primera vez: solo se apunta lo que ya había
  const vistos = new Set(JSON.parse(vistosTxt) as string[]);
  const nuevos = tickets.filter((c) => !vistos.has(c.id));
  for (const c of nuevos) {
    await avisar({
      agente: 'lanzora-tickets', nivel: 'importante',
      titulo: `Ticket nuevo en el Discord de Lanzora: #${c.name}`,
      texto: `https://discord.com/channels/${servidor}/${c.id}`,
    });
  }
  return nuevos.length;
}
