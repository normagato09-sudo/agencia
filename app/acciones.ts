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
