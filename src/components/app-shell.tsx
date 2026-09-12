import React from "react";
import Link from "next/link";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="site-container">
      <header className="app-header">
        <div className="app-header-content">
          <Link href="/" className="app-brand">
            Inspecciones de laboratorio
          </Link>

          <nav aria-label="Navegación principal" className="app-nav">
            <Link href="/" className="nav-link active">
              Inicio
            </Link>
          </nav>
        </div>
      </header>

      <div className="app-main">{children}</div>
    </div>
  );
}