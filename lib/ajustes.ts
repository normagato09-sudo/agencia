import { randomBytes } from 'crypto';
import webpush from 'web-push';
import { preparar, sql } from './db';

// Ajustes guardados en la base de datos, para no tener que configurar claves a mano.
async function tabla() {
  await preparar();
  await sql`CREATE TABLE IF NOT EXISTS ajustes (clave text PRIMARY KEY, valor text NOT NULL)`;
}

export async function leerAjuste(clave: string): Promise<string | null> {
  await tabla();
  const f = (await sql`SELECT valor FROM ajustes WHERE clave = ${clave}`) as { valor: string }[];
  return f[0]?.valor ?? null;
}

export async function guardarAjuste(clave: string, valor: string) {
  await tabla();
  await sql`INSERT INTO ajustes (clave, valor) VALUES (${clave}, ${valor})
    ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor`;
}

/** Claves para las notificaciones push (se crean solas la primera vez). */
export async function clavesPush(): Promise<{ publica: string; privada: string }> {
  let publica = await leerAjuste('vapid_publica');
  let privada = await leerAjuste('vapid_privada');
  if (!publica || !privada) {
    const k = webpush.generateVAPIDKeys();
    publica = k.publicKey; privada = k.privateKey;
    await guardarAjuste('vapid_publica', publica);
    await guardarAjuste('vapid_privada', privada);
  }
  return { publica, privada };
}

/** Clave secreta que tus otras apps usan para mandar avisos a Mi Oficina. */
export async function claveEventos(): Promise<string> {
  let k = await leerAjuste('clave_eventos');
  if (!k) {
    k = 'mo_' + randomBytes(24).toString('hex');
    await guardarAjuste('clave_eventos', k);
  }
  return k;
}
