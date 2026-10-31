import type { LocalInspection } from "@/lib/storage/schema";

/**
 * Devuelve únicamente los campos necesarios para un resumen estadístico.
 * Excluye identificadores, nombres, coordenadas, descripciones y datos
 * internos de sincronización.
 *
 * No modifica ni elimina la inspección original.
 */
export type PrivacySafeInspectionSummary = Pick<
  LocalInspection,
  "status" | "findings"
>;

export function toPrivacySafeSummary(
  inspection: LocalInspection
): PrivacySafeInspectionSummary {
  return {
    status: inspection.status,
    findings: inspection.findings,
  };
}