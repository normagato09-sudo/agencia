import { agentes, avisos, mensajes, proyectos } from './db';

/** Todo lo que necesitan las pantallas, de una vez. */
export async function datosOficina() {
  const [ps, ags, pend, ultimos, chat] = await Promise.all([
    proyectos(), agentes(), avisos({ soloSinLeer: true, limite: 200 }), avisos({ limite: 20 }), mensajes(60),
  ]);
  const proyectoDe = Object.fromEntries(ps.map((p) => [p.slug, p]));
  const nombreAgente = Object.fromEntries(ags.map((a) => [a.slug, a.nombre]));
  const agentesPor = (slug: string) => ags.filter((a) => a.proyecto === slug);
  const pendientesPor = (slug: string) => pend.filter((a) => a.proyecto === slug).length;
  return { ps, ags, pend, ultimos, chat, proyectoDe, nombreAgente, agentesPor, pendientesPor };
}

export const iniciales = (n: string) => n.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g, '').trim().slice(0, 2).toUpperCase();
