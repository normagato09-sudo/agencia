import webpush from 'web-push';
import { preparar, sql, type Aviso } from './db';
import { clavesPush } from './ajustes';

export type Nivel = 'normal' | 'importante' | 'urgente';

/** Emoji de cada proyecto para el título de las notificaciones. */
export const EMOJI: Record<string, string> = {
  agentes: '🤖', lanzora: '🚀', cifa: '🎓', defensem: '🏛️', rubiko: '🧩',
  'mi-dinero': '💸', organizator: '📚', puntos: '⭐', lego: '🧱', futbol: '⚽',
};

const URL_RE = /https?:\/\/[^\s)]+/;

/** Separa el primer enlace del texto (se convierte en el botón «Abrir») y deja el texto limpio. */
export function separarEnlace(texto: string): { texto: string; url: string | null } {
  const m = texto.match(URL_RE);
  if (!m) return { texto: texto.trim(), url: null };
  const limpio = texto.replace(m[0], '').split('\n').map((l) => l.trimEnd()).filter((l, i, arr) => l !== '' || (i > 0 && arr[i - 1] !== '')).join('\n').trim();
  return { texto: limpio, url: m[0] };
}

/**
 * Lo que hace un agente cuando tiene algo que decirte:
 * 1) deja el aviso, 2) te lo escribe en el chat (con botones), 3) si es importante o urgente, notificación al móvil.
 */
export async function avisar(a: { agente: string; nivel?: Nivel; titulo: string; texto?: string; url?: string }): Promise<Aviso> {
  await preparar();
  const nivel: Nivel = a.nivel ?? 'normal';
  const ag = (await sql`SELECT a.slug, a.proyecto, a.nombre, p.nombre AS proyecto_nombre
    FROM agentes a JOIN proyectos p ON p.slug = a.proyecto WHERE a.slug = ${a.agente}`) as
    { slug: string; proyecto: string; nombre: string; proyecto_nombre: string }[];
  if (!ag[0]) throw new Error(`No existe el agente «${a.agente}»`);
  const { texto, url: enlaceTexto } = separarEnlace(a.texto ?? '');
  const url = a.url ?? enlaceTexto;
  const [aviso] = (await sql`INSERT INTO avisos (agente, proyecto, nivel, titulo, texto, url)
    VALUES (${ag[0].slug}, ${ag[0].proyecto}, ${nivel}, ${a.titulo}, ${texto}, ${url}) RETURNING *`) as Aviso[];
  await sql`INSERT INTO mensajes (de, agente, texto, aviso_id)
    VALUES ('agente', ${ag[0].slug}, ${texto ? `${a.titulo}\n${texto}` : a.titulo}, ${aviso.id})`;
  await sql`UPDATE agentes SET estado = 'trabajando' WHERE slug = ${ag[0].slug}`;

  if (nivel !== 'normal') {
    const emoji = nivel === 'urgente' ? '🚨' : EMOJI[ag[0].proyecto] ?? '🔔';
    const primeraLinea = texto.split('\n').find((l) => l.trim()) ?? '';
    await enviarPush({
      title: `${emoji} ${ag[0].proyecto_nombre} · ${ag[0].nombre}`,
      body: primeraLinea ? `${a.titulo}\n${primeraLinea.replace(/^[•\-]\s*/, '')}` : a.titulo,
      icon: `/api/icono/${ag[0].proyecto}`,
      url: url ?? '/',
      avisoId: aviso.id,
      tag: `aviso-${aviso.id}`,
      urgente: nivel === 'urgente',
      acciones: [
        { action: 'abrir', title: url ? 'Abrir' : 'Ver' },
        { action: 'tarde', title: 'En 1 hora' },
      ],
    });
  }
  return aviso;
}

export async function enviarPush(datos: {
  title: string; body: string; url?: string; tag?: string; urgente?: boolean; icon?: string;
  avisoId?: number; acciones?: { action: string; title: string }[];
}) {
  const { publica, privada } = await clavesPush();
  webpush.setVapidDetails('mailto:hola@lanzora.net', publica, privada);
  const subs = (await sql`SELECT endpoint, datos FROM push_subs`) as { endpoint: string; datos: webpush.PushSubscription }[];
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification(s.datos, JSON.stringify(datos));
    } catch (e: unknown) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) await sql`DELETE FROM push_subs WHERE endpoint = ${s.endpoint}`;
    }
  }));
}
