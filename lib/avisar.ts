import webpush from 'web-push';
import { preparar, sql, type Aviso } from './db';
import { clavesPush } from './ajustes';

export type Nivel = 'normal' | 'importante' | 'urgente';

/**
 * Lo que hace un agente cuando tiene algo que decirte:
 * 1) deja el aviso, 2) te escribe en el chat, 3) si es importante o urgente, te manda una notificación.
 */
export async function avisar(a: { agente: string; nivel?: Nivel; titulo: string; texto?: string }): Promise<Aviso> {
  await preparar();
  const nivel: Nivel = a.nivel ?? 'normal';
  const ag = (await sql`SELECT slug, proyecto, nombre FROM agentes WHERE slug = ${a.agente}`) as
    { slug: string; proyecto: string; nombre: string }[];
  if (!ag[0]) throw new Error(`No existe el agente «${a.agente}»`);
  const texto = a.texto ?? '';
  const filas = (await sql`INSERT INTO avisos (agente, proyecto, nivel, titulo, texto)
    VALUES (${ag[0].slug}, ${ag[0].proyecto}, ${nivel}, ${a.titulo}, ${texto}) RETURNING *`) as Aviso[];
  await sql`INSERT INTO mensajes (de, agente, texto)
    VALUES ('agente', ${ag[0].slug}, ${texto ? `${a.titulo}\n${texto}` : a.titulo})`;
  await sql`UPDATE agentes SET estado = 'trabajando' WHERE slug = ${ag[0].slug}`;
  if (nivel !== 'normal') {
    await enviarPush({
      title: `${nivel === 'urgente' ? '⚠ ' : ''}${ag[0].nombre}`,
      body: a.titulo,
      url: '/',
      tag: nivel === 'urgente' ? `urgente-${filas[0].id}` : undefined,
      urgente: nivel === 'urgente',
    });
  }
  return filas[0];
}

export async function enviarPush(datos: { title: string; body: string; url?: string; tag?: string; urgente?: boolean }) {
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
