"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LoadingState } from "../../../components/loading-state";
import type { Inspection } from "../../../lib/data/inspections";

type FetchStatus = "loading" | "success" | "error" | "not-found";

export default function InspectionDetailPage() {
  const params = useParams<{ id: string }>();
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loadTimeMs, setLoadTimeMs] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const start = performance.now();

    async function load() {
      setStatus("loading");
      try {
        const searchParamsFromWindow = typeof window !== "undefined" ? window.location.search : "";
        const res = await fetch(`/api/inspecciones/${params.id}${searchParamsFromWindow}`);
        if (cancelled) return;

        if (res.status === 404) {
          setStatus("not-found");
          return;
        }
        if (!res.ok) {
          setStatus("error");
          return;
        }

        const data: Inspection = await res.json();
        setInspection(data);
        setLoadTimeMs(Math.round(performance.now() - start));
        setStatus("success");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (status === "loading") {
    return <LoadingState label="Cargando inspección…" />;
  }

  if (status === "not-found") {
    return (
      <main className="page-shell" role="status">
        <h1>Inspección no encontrada</h1>
        <p>No existe una inspección con ese identificador.</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="page-shell" role="alert">
        <h1>Error al cargar la inspección</h1>
        <p>Ocurrió un problema al obtener los datos. Intenta de nuevo.</p>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <p className="eyebrow">Detalle (renderizado en cliente — CSR)</p>
      <h1>{inspection?.location}</h1>
      <p>{inspection?.summary}</p>
      <dl>
        <div><dt>Responsable</dt><dd>{inspection?.inspector}</dd></div>
        <div><dt>Hallazgos</dt><dd>{inspection?.findings}</dd></div>
      </dl>
      {loadTimeMs !== null && (
        <p className="muted">Cargado en {loadTimeMs} ms (medición CSR)</p>
      )}
    </main>
  );
}