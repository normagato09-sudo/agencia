import { agentes, avisos, preparar, proyectos, sql } from './db';

// Respuestas del chat SIN IA: entiende órdenes sencillas.
// Más adelante se puede enchufar la IA aquí sin cambiar el resto de la app.

const quitarTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export async function resumenDelDia(): Promise<string> {
  const [ps, pend] = await Promise.all([proyectos(), avisos({ soloSinLeer: true, limite: 100 })]);
  if (pend.length === 0) return 'Todo tranquilo: no tienes avisos pendientes.';
  const porProyecto = new Map<string, number>();
  for (const a of pend) porProyecto.set(a.proyecto ?? '?', (porProyecto.get(a.proyecto ?? '?') ?? 0) + 1);
  const lineas = ps
    .filter((p) => porProyecto.has(p.slug))
    .map((p) => `• ${p.nombre}: ${porProyecto.get(p.slug)} ${porProyecto.get(p.slug) === 1 ? 'aviso' : 'avisos'}`);
  const urgentes = pend.filter((a) => a.nivel === 'urgente').length;
  return `Tienes ${pend.length} ${pend.length === 1 ? 'aviso pendiente' : 'avisos pendientes'}${urgentes ? ` (${urgentes} urgente${urgentes > 1 ? 's' : ''})` : ''}:\n${lineas.join('\n')}`;
}

const AYUDA = `Por ahora entiendo estas órdenes:
• «resumen» — lo que tienes pendiente
• «avisos de Lanzora» (o de cualquier proyecto)
• «agentes» — quién trabaja en cada proyecto
• «leído» — marco todos los avisos como leídos
Cuando conectemos la IA, podrás hablarme normal.`;

export async function responder(texto: string): Promise<string> {
  await preparar();
  const t = quitarTildes(texto.trim());
  const ps = await proyectos();
  const proyecto = ps.find((p) => t.includes(quitarTildes(p.nombre).split(' ')[0]) || t.includes(p.slug));

  if (/^(hola|buenas|buenos dias|resumen|que tengo|que hay)/.test(t) || t === 'resumen') {
    return `Hola, Norma. ${await resumenDelDia()}`;
  }
  if (t.includes('leido') || t.includes('leidos')) {
    if (proyecto) await sql`UPDATE avisos SET leido = true WHERE proyecto = ${proyecto.slug}`;
    else await sql`UPDATE avisos SET leido = true`;
    return proyecto ? `Hecho: avisos de ${proyecto.nombre} marcados como leídos.` : 'Hecho: todos los avisos marcados como leídos.';
  }
  if (t.includes('aviso')) {
    const lista = await avisos({ soloSinLeer: true, limite: 10, proyecto: proyecto?.slug });
    if (!lista.length) return proyecto ? `No hay avisos pendientes de ${proyecto.nombre}.` : 'No hay avisos pendientes.';
    return lista.map((a) => `• ${a.titulo}`).join('\n');
  }
  if (t.includes('agente')) {
    const ags = await agentes(proyecto?.slug);
    if (proyecto) return ags.length ? `${proyecto.nombre} tiene ${ags.length}: ${ags.map((a) => a.nombre).join(', ')}.` : `${proyecto.nombre} no tiene agentes por ahora.`;
    const n = new Map<string, number>();
    for (const a of ags) n.set(a.proyecto, (n.get(a.proyecto) ?? 0) + 1);
    return `Tienes ${ags.length} agentes:\n` + ps.map((p) => `• ${p.nombre}: ${n.get(p.slug) ?? 0}`).join('\n');
  }
  return AYUDA;
}
