"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-shell" role="alert">
      <section className="content-section">
        <p className="eyebrow">Error</p>
        <h2>No se pudieron cargar las inspecciones</h2>
        <p className="lead">
          Ocurrió un problema al obtener los datos. Puede deberse a una conexión
          intermitente. Intenta de nuevo en unos segundos.
        </p>
        <button type="button" onClick={() => reset()} className="retry-button">
          Reintentar
        </button>
      </section>
    </main>
  );
}