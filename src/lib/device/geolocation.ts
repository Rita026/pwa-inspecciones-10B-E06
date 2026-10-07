export type GeolocationResult =
  | { status: "unsupported" }
  | { status: "denied" }
  | { status: "error"; message: string }
  | {
      status: "granted";
      coords: {
        latitude: number;
        longitude: number;
        accuracy: number | null;
      };
    };

/**
 * Solicita la ubicación actual del dispositivo.
 * Debe llamarse únicamente como respuesta directa a una acción del usuario
 * (ej. botón "Registrar ubicación"), nunca al cargar la página.
 * Usa permisos mínimos y no hace seguimiento continuo (watchPosition).
 */
export async function requestCurrentPosition(
  options?: PositionOptions
): Promise<GeolocationResult> {
  if (
    typeof navigator === "undefined" ||
    !("geolocation" in navigator) ||
    typeof navigator.geolocation.getCurrentPosition !== "function"
  ) {
    return { status: "unsupported" };
  }

  const positionOptions: PositionOptions = {
    enableHighAccuracy: false, // permiso mínimo: no forzar GPS de alta precisión
    timeout: 10_000,
    maximumAge: 60_000,        // aceptar posición reciente (hasta 1 min)
    ...options,
  };

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          status: "granted",
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy ?? null,
          },
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          resolve({ status: "denied" });
          return;
        }
        resolve({
          status: "error",
          message: error.message || "Error al obtener la ubicación",
        });
      },
      positionOptions
    );
  });
}