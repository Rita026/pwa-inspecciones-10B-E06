
"use client";

import { useRef, useState } from "react";
import {
  requestCameraAccess,
  stopCameraStream,
} from "../lib/device/camera";
import { requestCurrentPosition } from "../lib/device/geolocation";

type Action = "camera" | "location" | null;

export default function DeviceCapabilitiesPanel() {
  const [busy, setBusy] = useState<Action>(null);
  const [cameraFeedback, setCameraFeedback] = useState(
    "Todavía no se ha solicitado acceso a la cámara."
  );
  const [locationFeedback, setLocationFeedback] = useState(
    "Todavía no se ha solicitado la ubicación."
  );
  const inFlight = useRef(false);

  async function handleCamera() {
    if (inFlight.current) return;

    inFlight.current = true;
    setBusy("camera");
    setCameraFeedback("Solicitando permiso para usar la cámara...");

    try {
      const result = await requestCameraAccess();

      if (result.status === "granted") {
        // La prueba comprueba el permiso, pero no conserva la cámara activa.
        try {
          stopCameraStream(result.stream);
        } catch {
          // Un problema al detener la cámara no debe romper la página.
        }

        setCameraFeedback(
          "Permiso concedido. La cámara está disponible. " +
            "Se detuvo la cámara después de comprobar el acceso."
        );
      } else if (result.status === "denied") {
        setCameraFeedback(
          "Permiso denegado. Puedes revisar los permisos de cámara " +
            "en la configuración del sitio del navegador."
        );
      } else if (result.status === "unsupported") {
        setCameraFeedback(
          "La cámara no está disponible en este navegador o dispositivo. " +
            "Puedes seguir utilizando la aplicación."
        );
      } else {
        setCameraFeedback(
          `No se pudo acceder a la cámara: ${result.message}`
        );
      }
    } catch {
      setCameraFeedback(
        "Ocurrió un error al solicitar la cámara. " +
          "La aplicación sigue funcionando; puedes intentarlo de nuevo."
      );
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  }

  async function handleLocation() {
    if (inFlight.current) return;

    inFlight.current = true;
    setBusy("location");
    setLocationFeedback("Solicitando permiso para obtener la ubicación...");

    try {
      const result = await requestCurrentPosition();

      if (result.status === "granted") {
        const { latitude, longitude, accuracy } = result.coords;

        setLocationFeedback(
          `Permiso concedido. Ubicación obtenida: ` +
            `latitud ${latitude.toFixed(5)}, ` +
            `longitud ${longitude.toFixed(5)}. ` +
            (accuracy !== null
              ? `Precisión aproximada: ${Math.round(accuracy)} metros.`
              : "")
        );
      } else if (result.status === "denied") {
        setLocationFeedback(
          "Permiso denegado. Puedes revisar los permisos de ubicación " +
            "en la configuración del sitio del navegador."
        );
      } else if (result.status === "unsupported") {
        setLocationFeedback(
          "La geolocalización no está disponible en este navegador " +
            "o dispositivo. Puedes seguir utilizando la aplicación."
        );
      } else {
        setLocationFeedback(
          `No se pudo obtener la ubicación: ${result.message}`
        );
      }
    } catch {
      setLocationFeedback(
        "Ocurrió un error al solicitar la ubicación. " +
          "La aplicación sigue funcionando; puedes intentarlo de nuevo."
      );
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  }

  return (
    <section
      className="sync-demo-panel"
      aria-labelledby="device-capabilities-heading"
      aria-busy={busy !== null}
    >
      <div className="sync-demo-intro">
        <p className="eyebrow">Semana 6 · Prueba local</p>
        <h2 id="device-capabilities-heading">
          Cámara y ubicación
        </h2>
        <p>
          Prueba los permisos del dispositivo. Cada permiso se solicita
          únicamente cuando pulsas su botón. Esta demostración no envía
          fotografías ni coordenadas a un servidor.
        </p>
      </div>

      <div className="sync-demo-controls">
        <div className="sync-demo-actions">
          <button
            type="button"
            onClick={() => void handleCamera()}
            disabled={busy !== null}
          >
            {busy === "camera"
              ? "Comprobando cámara..."
              : "Adjuntar evidencia (cámara)"}
          </button>

          <button
            type="button"
            className="sync-demo-secondary"
            onClick={() => void handleLocation()}
            disabled={busy !== null}
          >
            {busy === "location"
              ? "Obteniendo ubicación..."
              : "Obtener ubicación"}
          </button>
        </div>

        <p
          className="sync-demo-feedback"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Cámara: {cameraFeedback}
        </p>

        <p
          className="sync-demo-feedback"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Ubicación: {locationFeedback}
        </p>
      </div>
    </section>
  );
}
