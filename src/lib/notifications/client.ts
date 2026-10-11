export type NotificationState = NotificationPermission | "unsupported" | "insecure";

export type NotificationPermissionResult =
  | { status: NotificationState }
  | { status: "error"; message: string };

export type TestNotificationResult =
  | { status: "sent" }
  | { status: "unavailable" }
  | NotificationPermissionResult;

/** Consulta soporte y permiso sin abrir ningún diálogo; también es segura en SSR. */
export function getNotificationState(): NotificationState {
  if (typeof window === "undefined") return "unsupported";
  if (!window.isSecureContext) return "insecure";
  if (typeof window.Notification === "undefined") return "unsupported";
  return window.Notification.permission;
}

/** Llamar directamente desde un clic, nunca al montar un componente. */
export async function requestNotificationPermission(): Promise<NotificationPermissionResult> {
  const status = getNotificationState();
  if (status !== "default") return { status };

  if (typeof window.Notification.requestPermission !== "function") {
    return { status: "unsupported" };
  }

  try {
    // No hay un await previo: se conserva la interacción directa del usuario.
    return { status: await window.Notification.requestPermission() };
  } catch {
    return {
      status: "error",
      message: "No se pudo solicitar el permiso. Puedes volver a intentarlo."
    };
  }
}

/** Envía solo una prueba local y sintética; no pide permiso ni crea suscripciones push. */
export async function showTestNotification(): Promise<TestNotificationResult> {
  const status = getNotificationState();
  if (status !== "granted") return { status };

  if (
    !("serviceWorker" in navigator) ||
    typeof navigator.serviceWorker?.getRegistration !== "function"
  ) {
    return { status: "unsupported" };
  }

  try {
    // Reutiliza el registro de la app. No espera ready, que puede no resolverse
    // si el registro falló; la UI ofrece reintentar cuando todavía no está activo.
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration?.active) return { status: "unavailable" };
    if (typeof registration.showNotification !== "function") {
      return { status: "unsupported" };
    }

    await registration.showNotification("Inspecciones · Prueba de notificación", {
      body: "Notificación local con datos sintéticos. No hay una incidencia real.",
      tag: "inspecciones-prueba",
      lang: "es"
    });

    // La API aceptó la solicitud; el sistema operativo decide su presentación.
    return { status: "sent" };
  } catch {
    return {
      status: "error",
      message: "No se pudo enviar la notificación. Revisa los permisos e inténtalo de nuevo."
    };
  }
}
