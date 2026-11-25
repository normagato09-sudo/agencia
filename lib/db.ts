import { neon } from '@neondatabase/serverless';
import { AGENTES, PROYECTOS } from './seed';

// Vercel + Neon crea DATABASE_URL automáticamente al conectar la base de datos.
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';

export const sql = neon(url || 'postgres://falta:falta@localhost/falta');

export type Proyecto = { slug: string; nombre: string; tipo: 'sede' | 'edificio' | 'casa'; color: string; orden: number };
export type Agente = {
  id: number; slug: string; proyecto: string; nombre: string; planta: string; app: string;
  trabajo: string; estado: 'esperando' | 'trabajando'; activo: boolean;
};
export type Aviso = {
  id: number; agente: string | null; proyecto: string | null; nivel: 'normal' | 'importante' | 'urgente';
  titulo: string; texto: string; leido: boolean; creado: string;
};
export type Mensaje = { id: number; de: 'norma' | 'agente'; agente: string | null; texto: string; creado: string };

let listo: Promise<void> | null = null;

/** Crea las tablas y mete los proyectos/agentes iniciales la primera vez. */
export function preparar(): Promise<void> {
  if (!url) return Promise.reject(new Error('Falta DATABASE_URL: conecta una base de datos Neon en Vercel.'));
  if (!listo) {
    listo = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS proyectos (
        slug text PRIMARY KEY, nombre text NOT NULL, tipo text NOT NULL, color text NOT NULL, orden int NOT NULL DEFAULT 0)`;
      await sql`CREATE TABLE IF NOT EXISTS agentes (
        id serial PRIMARY KEY, slug text UNIQUE NOT NULL, proyecto text NOT NULL REFERENCES proyectos(slug),
        nombre text NOT NULL, planta text NOT NULL DEFAULT '', app text NOT NULL DEFAULT '', trabajo text NOT NULL DEFAULT '',
        estado text NOT NULL DEFAULT 'esperando', activo boolean NOT NULL DEFAULT true, creado timestamptz NOT NULL DEFAULT now())`;
      await sql`CREATE TABLE IF NOT EXISTS avisos (
        id serial PRIMARY KEY, agente text, proyecto text, nivel text NOT NULL DEFAULT 'normal',
        titulo text NOT NULL, texto text NOT NULL DEFAULT '', leido boolean NOT NULL DEFAULT false,
        creado timestamptz NOT NULL DEFAULT now())`;
      await sql`CREATE TABLE IF NOT EXISTS mensajes (
        id serial PRIMARY KEY, de text NOT NULL, agente text, texto text NOT NULL, creado timestamptz NOT NULL DEFAULT now())`;
      await sql`CREATE TABLE IF NOT EXISTS push_subs (
        endpoint text PRIMARY KEY, datos jsonb NOT NULL, creado timestamptz NOT NULL DEFAULT now())`;
      for (const p of PROYECTOS) {
        await sql`INSERT INTO proyectos (slug, nombre, tipo, color, orden)
          VALUES (${p.slug}, ${p.nombre}, ${p.tipo}, ${p.color}, ${p.orden}) ON CONFLICT (slug) DO NOTHING`;
      }
      for (const a of AGENTES) {
        await sql`INSERT INTO agentes (slug, proyecto, nombre, planta, app, trabajo)
          VALUES (${a.slug}, ${a.proyecto}, ${a.nombre}, ${a.planta}, ${a.app}, ${a.trabajo}) ON CONFLICT (slug) DO NOTHING`;
      }
    })().catch((e) => { listo = null; throw e; });
  }
  return listo;
}

export async function proyectos(): Promise<Proyecto[]> {
  await preparar();
  return (await sql`SELECT * FROM proyectos ORDER BY orden`) as Proyecto[];
}

export async function agentes(proyecto?: string): Promise<Agente[]> {
  await preparar();
  return (proyecto
    ? await sql`SELECT * FROM agentes WHERE proyecto = ${proyecto} AND activo ORDER BY id`
    : await sql`SELECT * FROM agentes WHERE activo ORDER BY id`) as Agente[];
}

export async function avisos(opts: { soloSinLeer?: boolean; limite?: number; proyecto?: string } = {}): Promise<Aviso[]> {
  await preparar();
  const lim = opts.limite ?? 30;
  const sinLeer = opts.soloSinLeer ?? false;
  const proy = opts.proyecto ?? null;
  return (await sql`SELECT * FROM avisos
    WHERE (${sinLeer}::boolean = false OR leido = false)
      AND (${proy}::text IS NULL OR proyecto = ${proy})
    ORDER BY creado DESC LIMIT ${lim}`) as Aviso[];
}

export async function mensajes(limite = 40): Promise<Mensaje[]> {
  await preparar();
  const filas = (await sql`SELECT * FROM mensajes ORDER BY creado DESC LIMIT ${limite}`) as Mensaje[];
  return filas.reverse();
}
