export type CameraResult =
  | { status: "unsupported" }
  | { status: "denied" }
  | { status: "error"; message: string }
  | { status: "granted"; stream: MediaStream };

/**
 * Solicita acceso a la cámara del dispositivo. Debe llamarse únicamente
 * como respuesta directa a una acción del usuario (por ejemplo, un clic
 * en un botón "Adjuntar evidencia"), nunca automáticamente al cargar la
 * página, siguiendo el requisito de permisos mínimos.
 */
export async function requestCameraAccess(): Promise<CameraResult> {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.getUserMedia !== "function"
  ) {
    return { status: "unsupported" };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    return { status: "granted", stream };
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      return { status: "denied" };
    }
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Error desconocido al acceder a la cámara",
    };
  }
}

/**
 * Detiene todas las pistas de un stream de cámara, para liberar el
 * dispositivo cuando ya no se necesita (por ejemplo, al cerrar el panel
 * de captura de evidencia).
 */
export function stopCameraStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}