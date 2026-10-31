/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No anunciar el framework en cada respuesta (X-Powered-By: Next.js).
  // Las demás cabeceras de seguridad las pone src/middleware.ts.
  poweredByHeader: false
};

export default nextConfig;

