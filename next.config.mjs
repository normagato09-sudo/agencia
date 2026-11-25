/** @type {import('next').NextConfig} */
const nextConfig = {
  // Versión de la app = commit que Vercel está desplegando. Sirve para detectar actualizaciones.
  env: { NEXT_PUBLIC_VERSION: process.env.VERCEL_GIT_COMMIT_SHA || 'local' },
};
export default nextConfig;
