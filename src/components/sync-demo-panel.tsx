"use client";

import { useEffect, useRef, useState } from "react";
import {
  getPendingInspections,
  queueInspection,
  syncPendingInspections,
  type SyncSender
} from "../lib/sync/queue";

type Activity = "creating" | "syncing" | "refreshing" | null;
type Feedback = { kind: "success" | "error"; text: string } | null;

// Esta confirmación solo permite demostrar la cola local. No existe un envío HTTP.
const simulatedSender: SyncSender = async (record) => ({
  ok: true,
  serverId: `demo-${record.localId}`
});

export default function SyncDemoPanel() {
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [activity, setActivity] = useState<Activity>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const countRequest = useRef(0);

  async function refreshCount() {
    const request = ++countRequest.current;
    const pending = await getPendingInspections();
    if (request === countRequest.current) setPendingCount(pending.length);
  }

  useEffect(() => {
    let active = true;
    const request = ++countRequest.current;

    void getPendingInspections()
      .then((pending) => {
        if (active && request === countRequest.current) {
          setPendingCount(pending.length);
        }
      })
      .catch(() => {
        if (active && request === countRequest.current) {
          setFeedback({
            kind: "error",
            text: "No se pudo consultar la cola local. Intenta actualizar el contador."
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleCreate() {
    setActivity("creating");
    setFeedback(null);

    try {
      await queueInspection({
        location: "Laboratorio de demostración",
        date: new Date().toISOString().slice(0, 10),
        inspector: "Técnica de prueba",
        status: "ok",
        statusLabel: "Sin incidencias",
        findings: 0,
        summary: "Inspección sintética creada para probar la cola local."
      });
    } catch {
      setFeedback({
        kind: "error",
        text: "No se pudo guardar la inspección de prueba en este navegador."
      });
      setActivity(null);
      return;
    }

    try {
      await refreshCount();
      setFeedback({
        kind: "success",
        text: "Inspección sintética guardada localmente y pendiente de sincronización."
      });
    } catch {
      setFeedback({
        kind: "error",
        text: "La inspección se guardó, pero no se pudo actualizar el contador."
      });
    } finally {
      setActivity(null);
    }
  }

  async function handleSync() {
    setActivity("syncing");
    setFeedback(null);

    let result: Awaited<ReturnType<typeof syncPendingInspections>>;
    try {
      result = await syncPendingInspections(simulatedSender);
    } catch {
      setFeedback({
        kind: "error",
        text: "No se pudo completar la simulación. Revisa los registros pendientes."
      });
      setActivity(null);
      return;
    }

    try {
      await refreshCount();
      setFeedback({
        kind: result.failed > 0 ? "error" : "success",
        text: `Sincronización simulada: ${result.synced} confirmadas, ${result.failed} fallidas y ${result.skipped} omitidas. No se enviaron datos a un servidor.`
      });
    } catch {
      setFeedback({
        kind: "error",
        text: "La simulación terminó, pero no se pudo actualizar el contador."
      });
    } finally {
      setActivity(null);
    }
  }

  async function handleRefresh() {
    setActivity("refreshing");
    setFeedback(null);

    try {
      await refreshCount();
      setFeedback({ kind: "success", text: "Contador local actualizado." });
    } catch {
      setFeedback({
        kind: "error",
        text: "No se pudo consultar la cola local en este navegador."
      });
    } finally {
      setActivity(null);
    }
  }

  return (
    <section className="sync-demo-panel" aria-labelledby="sync-demo-heading" aria-busy={activity !== null}>
      <div className="sync-demo-intro">
        <p className="eyebrow">Semana 5 · Prueba local</p>
        <h2 id="sync-demo-heading">Cola de sincronización</h2>
        <p>
          Crea una inspección sintética en este navegador y observa cuántas quedan
          pendientes. La sincronización usa una confirmación simulada: no envía
          datos a un servidor.
        </p>
      </div>

      <div className="sync-demo-controls">
        <p className="sync-demo-count" role="status" aria-live="polite">
          {pendingCount === null
            ? "Consultando pendientes…"
            : `${pendingCount} ${pendingCount === 1 ? "inspección pendiente" : "inspecciones pendientes"}`}
        </p>
        <div className="sync-demo-actions">
          <button type="button" onClick={handleCreate} disabled={activity !== null}>
            {activity === "creating" ? "Guardando…" : "Crear inspección de prueba"}
          </button>
          <button
            type="button"
            className="sync-demo-secondary"
            onClick={handleSync}
            disabled={activity !== null || pendingCount === null || pendingCount === 0}
          >
            {activity === "syncing" ? "Sincronizando…" : "Simular sincronización"}
          </button>
          <button
            type="button"
            className="sync-demo-secondary"
            onClick={handleRefresh}
            disabled={activity !== null}
          >
            Actualizar contador
          </button>
        </div>
        {feedback && (
          <p
            className={`sync-demo-feedback sync-demo-feedback-${feedback.kind}`}
            role={feedback.kind === "error" ? "alert" : "status"}
          >
            {feedback.text}
          </p>
        )}
      </div>
    </section>
  );
}
