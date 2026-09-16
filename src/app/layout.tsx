import type { Metadata } from "next";
import "./globals.css";
import AppShell from "../components/app-shell";
import ServiceWorkerRegistration from "../lib/pwa/register-service-worker";

export const metadata: Metadata = {
  title: "Inspecciones de laboratorio",
  description: "Proyecto base de Aplicaciones Web Progresivas",
  manifest: "/manifest.webmanifest"
};

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
