import { agentes, avisos, mensajes, proyectos, sql } from './db';
import { guardarAjuste, leerAjuste } from './ajustes';
import { responder as responderSinIA } from './chat';

// IA de los agentes: Claude Haiku 5.5 (el modelo más barato).
// Se activa sola al poner ANTHROPIC_API_KEY en Vercel. Sin clave, el chat usa las órdenes sencillas.
const MODELO = 'claude-haiku-5-5';
const PRECIO_ENTRADA = 0.10 / 1_000_000; // $ por token (mensajes de hasta 100k tokens)
const PRECIO_SALIDA = 0.50 / 1_000_000;

export const iaActiva = () => !!process.env.ANTHROPIC_API_KEY;
const limiteMensual = () => Number(process.env.IA_LIMITE_MENSUAL ?? '1'); // en $, por defecto 1

const mesActual = () => new Date().toISOString().slice(0, 7);

export async function gastoDelMes(): Promise<number> {
  return Number((await leerAjuste(`ia_gasto_${mesActual()}`)) ?? '0');
}

async function sumarGasto(entrada: number, salida: number) {
  const total = (await gastoDelMes()) + entrada * PRECIO_ENTRADA + salida * PRECIO_SALIDA;
  await guardarAjuste(`ia_gasto_${mesActual()}`, total.toFixed(6));
}

const HERRAMIENTAS = [
  {
    name: 'marcar_avisos_vistos',
    description: 'Marca como vistos los avisos pendientes. Si se indica proyecto, solo los de ese proyecto.',
    input_schema: { type: 'object', properties: { proyecto: { type: 'string', description: 'slug del proyecto (opcional)' } } },
  },
];

async function contexto() {
  const [ps, ags, pend] = await Promise.all([proyectos(), agentes(), avisos({ soloSinLeer: true, limite: 40 })]);
  const hoy = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'full', timeStyle: 'short' });
  return `Eres la Secretaria general de «Mi Oficina», la app personal de Norma (18 años, Barcelona). Hablas en español, cercana y breve (2-5 frases salvo que te pida algo largo). No uses markdown con almohadillas; usa guiones o viñetas «•» si hace falta.
Coordinas a sus agentes. Cada agente vigila una app y deja avisos. Fecha y hora: ${hoy}.

PROYECTOS (slug: nombre):
${ps.map((p) => `- ${p.slug}: ${p.nombre}`).join('\n')}

AGENTES (slug → proyecto: trabajo):
${ags.map((a) => `- ${a.slug} → ${a.proyecto}: ${a.nombre}. ${a.trabajo}`).join('\n')}

AVISOS PENDIENTES (${pend.length}):
${pend.map((a) => `- [${a.nivel}] ${a.proyecto} / ${a.agente}: ${a.titulo}${a.texto ? ` — ${a.texto.slice(0, 200)}` : ''}`).join('\n') || '- ninguno'}

Si te pide algo que ningún agente puede hacer todavía (porque su app aún no está conectada), díselo con sinceridad y propón qué se podría conectar. No inventes datos que no estén aquí.`;
}

type Bloque = { type: 'text'; text: string } | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> };

async function llamar(system: string, msgs: unknown[]) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model: MODELO, max_tokens: 800, system, tools: HERRAMIENTAS, messages: msgs }),
  });
  if (!r.ok) throw new Error(`IA ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = (await r.json()) as { content: Bloque[]; stop_reason: string; usage: { input_tokens: number; output_tokens: number } };
  await sumarGasto(j.usage.input_tokens, j.usage.output_tokens);
  return j;
}

export async function responderIA(texto: string): Promise<string> {
  if (!iaActiva()) return responderSinIA(texto);
  if ((await gastoDelMes()) >= limiteMensual()) {
    return `He llegado al límite de IA de este mes (${limiteMensual()} $), así que hasta el mes que viene uso las órdenes sencillas.\n\n${await responderSinIA(texto)}`;
  }
  try {
    const historial = (await mensajes(12)).map((m) => ({ role: m.de === 'norma' ? 'user' : 'assistant', content: m.texto }));
    // El historial ya incluye el mensaje que acaba de escribir: lo quitamos para no repetirlo.
    if (historial.length && historial[historial.length - 1].role === 'user') historial.pop();
    // La API pide que el primer mensaje sea del usuario y que los turnos se alternen.
    const msgs: { role: string; content: unknown }[] = [];
    for (const h of historial) {
      if (!msgs.length && h.role !== 'user') continue;
      const ult = msgs[msgs.length - 1];
      if (ult && ult.role === h.role) ult.content = `${ult.content}\n\n${h.content}`;
      else msgs.push({ ...h });
    }
    if (msgs.length && msgs[msgs.length - 1].role === 'user') msgs.push({ role: 'assistant', content: '(visto)' });
    msgs.push({ role: 'user', content: texto });

    const system = await contexto();
    let r = await llamar(system, msgs);
    for (let i = 0; i < 3 && r.stop_reason === 'tool_use'; i++) {
      const resultados = [];
      for (const b of r.content) {
        if (b.type !== 'tool_use') continue;
        if (b.name === 'marcar_avisos_vistos') {
          const p = typeof b.input.proyecto === 'string' ? b.input.proyecto : null;
          if (p) await sql`UPDATE avisos SET leido = true WHERE proyecto = ${p}`;
          else await sql`UPDATE avisos SET leido = true`;
          resultados.push({ type: 'tool_result', tool_use_id: b.id, content: 'Hecho' });
        }
      }
      msgs.push({ role: 'assistant', content: r.content });
      msgs.push({ role: 'user', content: resultados });
      r = await llamar(system, msgs);
    }
    const out = r.content.filter((b): b is { type: 'text'; text: string } => b.type === 'text').map((b) => b.text).join('\n').trim();
    return out || 'Hecho.';
  } catch (e) {
    console.error(e);
    return `La IA no ha podido responder ahora mismo, así que uso las órdenes sencillas.\n\n${await responderSinIA(texto)}`;
  }
}
