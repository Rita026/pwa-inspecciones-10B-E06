export type InspectionStatus = "ok" | "attention";

export type Inspection = {
  id: string;
  location: string;
  date: string;
  inspector: string;
  status: InspectionStatus;
  statusLabel: string;
  findings: number;
  summary: string;
};

export const inspections: Inspection[] = [
  {
    id: "inspection-001",
    location: "Laboratorio de Redes",
    date: "2026-08-28",
    inspector: "Técnica A",
    status: "ok",
    statusLabel: "Sin incidencias",
    findings: 0,
    summary: "Revisión visual de cableado, ventilación y estaciones de trabajo."
  },
  {
    id: "inspection-002",
    location: "Laboratorio de Electrónica",
    date: "2026-08-27",
    inspector: "Técnico B",
    status: "attention",
    statusLabel: "Requiere atención",
    findings: 2,
    summary: "Se registraron dos observaciones sintéticas para seguimiento de mantenimiento."
  },
  {
    id: "inspection-003",
    location: "Laboratorio de Software",
    date: "2026-08-26",
    inspector: "Técnica C",
    status: "ok",
    statusLabel: "Sin incidencias",
    findings: 0,
    summary: "Comprobación de equipo, señalización y disponibilidad del espacio."
  }
];

export type InspectionScenario = "ok" | "empty" | "error";

  const NETWORK_DELAY_MS = 600;

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Simula una llamada a un servicio remoto para obtener inspecciones.
   * Permite forzar los escenarios de error y vacío mediante `scenario`,
   * útil para demostrar los estados de carga, error y vacío del shell.
   */
  export async function getInspections(
    scenario: InspectionScenario = "ok"
  ): Promise<Inspection[]> {
    await delay(NETWORK_DELAY_MS);

    if (scenario === "error") {
      throw new Error("No se pudo obtener el listado de inspecciones.");
    }

    if (scenario === "empty") {
      return [];
    }

    return inspections;
}

