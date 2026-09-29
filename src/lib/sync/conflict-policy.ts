import type { LocalInspection } from "../storage/schema";

/**
 * Representa el resultado de resolver un conflicto entre dos versiones
 * de la misma inspección: la que existe localmente y la que reporta el servidor.
 */
export type ConflictResolution = {
  winner: LocalInspection;
  reason: "local-newer" | "server-newer" | "equal-timestamps-local-kept";
};

/**
 * Política de resolución de conflictos: "gana el más reciente"
 * (Last-Write-Wins), comparando el campo updatedAt.
 *
 * Se eligió esta estrategia por ser simple, determinista y fácil de explicar,
 * a costa de poder perder cambios si dos ediciones ocurren casi al mismo tiempo
 * (ver limitación documentada en docs/sync-policy.md).
 */
export function resolveConflict(
  local: LocalInspection,
  server: LocalInspection
): ConflictResolution {
  if (local.updatedAt > server.updatedAt) {
    return { winner: local, reason: "local-newer" };
  }

  if (server.updatedAt > local.updatedAt) {
    return { winner: server, reason: "server-newer" };
  }

  // Timestamps iguales: se conserva la versión local para evitar
  // sobreescribir un cambio del usuario sin necesidad.
  return { winner: local, reason: "equal-timestamps-local-kept" };
}