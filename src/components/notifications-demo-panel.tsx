"use client";

import { useEffect, useRef, useState } from "react";
import {
  getNotificationState,
  requestNotificationPermission,
  showTestNotification,
  type NotificationState,
  type TestNotificationResult
} from "../lib/notifications/client";

const stateMessages: Record<NotificationState, string> = {
  default: "Permiso sin conceder. Solicítalo si quieres probar las notificaciones.",
  granted: "Permiso concedido. Puedes enviar una notificación de prueba.",
  denied: "Notificaciones bloqueadas. Puedes cambiar el permiso en la configuración del sitio del navegador.",
  unsupported: "Este navegador no admite las notificaciones necesarias. Puedes continuar usando las inspecciones.",
  insecure: "Para probar las notificaciones, abre la aplicación en HTTPS o localhost."
};

function resultMessage(result: TestNotificationResult): string {
  if (result.status === "sent") {
    return "Notificación de prueba enviada al navegador. Si no la ves, revisa los ajustes de notificaciones del sistema y el modo No molestar.";
  }
  if (result.status === "unavailable") {
    return "El servicio de notificaciones aún no está listo. Espera unos segundos y vuelve a probar; si persiste, recarga la página con conexión.";
  }
  if (result.status === "error") return result.message;
  return stateMessages[result.status];
}

export default function NotificationsDemoPanel() {
  const [state, setState] = useState<NotificationState | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    const refresh = () => setState(getNotificationState());
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  async function handleAction(action: "permission" | "test") {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setFeedback(null);
    try {
      const result = await (action === "permission"
        ? requestNotificationPermission()
        : showTestNotification());
      setState(getNotificationState());
      setFeedback(resultMessage(result));
    } catch {
      setFeedback("No se pudo completar la prueba. Puedes volver a intentarlo.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="sync-demo-panel" aria-labelledby="notifications-demo-heading" aria-busy={busy}>
      <div className="sync-demo-intro">
        <p className="eyebrow">Semana 6 · Prueba local</p>
        <h2 id="notifications-demo-heading">Notificaciones de prueba</h2>
        <p>
          El permiso es opcional y solo se solicita al pulsar el botón. La prueba
          usa un mensaje sintético y no envía datos a un servidor.
        </p>
      </div>
      <div className="sync-demo-controls">
        <p className="sync-demo-count">
          {state === null ? "Comprobando disponibilidad…" : stateMessages[state]}
        </p>
        <div className="sync-demo-actions">
          <button
            type="button"
            onClick={() => void handleAction("permission")}
            disabled={busy || state !== "default"}
          >
            Pedir permiso de notificaciones
          </button>
          <button
            type="button"
            className="sync-demo-secondary"
            onClick={() => void handleAction("test")}
            disabled={busy || state !== "granted"}
          >
            Mostrar notificación de prueba
          </button>
        </div>
        <p className="sync-demo-feedback" role="status" aria-live="polite" aria-atomic="true">
          {busy ? "Procesando solicitud…" : feedback}
        </p>
      </div>
    </section>
  );
}
