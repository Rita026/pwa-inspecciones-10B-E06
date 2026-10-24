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
  summary: "Inspección sintética para probar idempotencia.",
};

async function cargarCola() {
  jest.resetModules();
  return import("../../src/lib/sync/queue");
}

describe("integración: no duplicar al reintentar sync", () => {
  it("sincronizar dos veces la misma inspección no deja pendientes ni reenvía", async () => {
    const cola = await cargarCola();

    const sender = jest.fn(async (record: { localId: string }) => ({
      ok: true as const,
      serverId: `srv-${record.localId}`,
    }));

    const guardada = await cola.queueInspection(muestra);

    const r1 = await cola.syncPendingInspections(sender);
    expect(r1.synced).toBe(1);
    expect(r1.failed).toBe(0);

    const r2 = await cola.syncPendingInspections(sender);
    expect(r2.synced).toBe(0);
    expect(r2.failed).toBe(0);

    const pendientes = await cola.getPendingInspections();
    expect(pendientes).toHaveLength(0);

    expect(sender).toHaveBeenCalledTimes(1);
    expect(sender).toHaveBeenCalledWith(
      expect.objectContaining({ localId: guardada.localId })
    );
  });
});