import { createHash } from 'crypto';
import { cookies } from 'next/headers';

// Acceso con una sola contraseña (la tuya), que pones en Vercel como OFICINA_CLAVE.
const COOKIE = 'mo_sesion';

function firma(clave: string) {
  return createHash('sha256').update(`mi-oficina:${clave}`).digest('hex');
}

export function claveConfigurada() {
  return !!process.env.OFICINA_CLAVE;
}

export async function estaDentro(): Promise<boolean> {
  const clave = process.env.OFICINA_CLAVE;
  if (!clave) return false;
  const c = (await cookies()).get(COOKIE)?.value;
  return c === firma(clave);
}

export async function entrar(clave: string): Promise<boolean> {
  const real = process.env.OFICINA_CLAVE;
  if (!real || clave !== real) return false;
  (await cookies()).set(COOKIE, firma(real), {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 90,
  });
  return true;
}

export async function salir() {
  (await cookies()).delete(COOKIE);
}
