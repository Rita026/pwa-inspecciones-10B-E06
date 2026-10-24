/**
 * @jest-environment node
 */
import "fake-indexeddb/auto";

const muestra = {
  location: "Laboratorio de integración",
  date: "2026-10-12",
  inspector: "Técnica A",
  status: "attention" as const,
  statusLabel: "Requiere atención",
  findings: 1,
  summary: "Inspección sintética guardada sin conexión.",
};

async function cargarCola() {
  // Simula recargar la página: se pierde el estado en memoria de los módulos,
  // pero IndexedDB conserva los datos.
  jest.resetModules();
  return import("../../src/lib/sync/queue");
}

describe("integración: persistencia tras recargar", () => {
  it("una inspección guardada sin conexión sigue pendiente después de recargar", async () => {
    const antesDeRecargar = await cargarCola();
    const guardada = await antesDeRecargar.queueInspection(muestra);

    const despuesDeRecargar = await cargarCola();
    const pendientes = await despuesDeRecargar.getPendingInspections();

    expect(pendientes).toHaveLength(1);
    expect(pendientes[0]).toMatchObject({
      localId: guardada.localId,
      location: muestra.location,
      syncStatus: "pending",
    });
  });
});