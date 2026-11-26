'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { estaDentro, salir } from '@/lib/auth';
import { preparar, sql } from '@/lib/db';

async function asegurar() {
  if (!(await estaDentro())) redirect('/login');
  await preparar();
}

export async function marcarLeido(form: FormData) {
  await asegurar();
  const id = Number(form.get('id'));
  if (id) await sql`UPDATE avisos SET leido = true WHERE id = ${id}`;
  revalidatePath('/', 'layout');
}

export async function marcarTodoLeido() {
  await asegurar();
  await sql`UPDATE avisos SET leido = true`;
  revalidatePath('/', 'layout');
}

export async function crearAgente(form: FormData) {
  await asegurar();
  const nombre = String(form.get('nombre') ?? '').trim();
  const proyecto = String(form.get('proyecto') ?? '');
  if (!nombre || !proyecto) return;
  const base = `${proyecto}-${nombre}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const slug = `${base}-${Date.now().toString(36).slice(-4)}`;
  await sql`INSERT INTO agentes (slug, proyecto, nombre, planta, app, trabajo)
    VALUES (${slug}, ${proyecto}, ${nombre}, ${String(form.get('planta') ?? '').trim() || 'General'},
            ${String(form.get('app') ?? '').trim()}, ${String(form.get('trabajo') ?? '').trim()})`;
  revalidatePath('/', 'layout');
}

export async function desactivarAgente(form: FormData) {
  await asegurar();
  const slug = String(form.get('slug') ?? '');
  if (slug && slug !== 'secretaria') await sql`UPDATE agentes SET activo = false WHERE slug = ${slug}`;
  revalidatePath('/', 'layout');
}

export async function probarAviso(form: FormData) {
  await asegurar();
  const { avisar } = await import('@/lib/avisar');
  const nivel = String(form.get('nivel') ?? 'importante') as 'normal' | 'importante' | 'urgente';
  await avisar({ agente: 'secretaria', nivel, titulo: `Aviso de prueba (${nivel})`, texto: 'Si ves esto, los avisos funcionan.' });
  revalidatePath('/', 'layout');
}

export async function cerrarSesion() {
  await salir();
  redirect('/login');
}

export async function crearRecordatorio(form: FormData) {
  await asegurar();
  const agente = String(form.get('agente') ?? '');
  const fecha = String(form.get('fecha') ?? '');
  const hora = String(form.get('hora') ?? '') || '09:00';
  const texto = String(form.get('texto') ?? '').trim().slice(0, 300);
  if (!agente || !/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}$/.test(hora) || !texto) return;
  await sql`INSERT INTO recordatorios (agente, fecha, hora, texto) VALUES (${agente}, ${fecha}, ${hora}, ${texto})`;
  revalidatePath('/', 'layout');
}

export async function borrarRecordatorio(form: FormData) {
  await asegurar();
  const id = Number(form.get('id'));
  if (id) await sql`DELETE FROM recordatorios WHERE id = ${id}`;
  revalidatePath('/', 'layout');
}

/** Serie: una línea por día, empezando el día elegido, a la misma hora. */
export async function crearSerie(form: FormData) {
  await asegurar();
  const agente = String(form.get('agente') ?? '');
  const desde = String(form.get('fecha') ?? '');
  const hora = String(form.get('hora') ?? '') || '18:00';
  const lineas = String(form.get('lista') ?? '')
    .split('\n')
    .map((l) => l.replace(/^\s*\d+[.)]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 60);
  if (!agente || !/^\d{4}-\d{2}-\d{2}$/.test(desde) || !/^\d{2}:\d{2}$/.test(hora) || lineas.length === 0) return;
  for (let i = 0; i < lineas.length; i++) {
    await sql`INSERT INTO recordatorios (agente, fecha, hora, texto)
      VALUES (${agente}, ${desde}::date + ${i}::int, ${hora}, ${lineas[i].slice(0, 300)})`;
  }
  revalidatePath('/', 'layout');
}
