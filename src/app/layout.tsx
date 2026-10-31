import type { Metadata } from "next";
import "./globals.css";
import AppShell from "../components/app-shell";
import ServiceWorkerRegistration from "../lib/pwa/register-service-worker";

export const metadata: Metadata = {
  title: "Inspecciones de laboratorio",
  description: "Proyecto base de Aplicaciones Web Progresivas",
  manifest: "/manifest.webmanifest"
};

// La CSP de src/middleware.ts usa un nonce por petición. Una página
// prerenderada en el build no lo tendría y el navegador bloquearía sus scripts.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <body>
        <ServiceWorkerRegistration />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
