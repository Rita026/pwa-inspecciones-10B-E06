/**
 * @jest-environment node
 */
import "fake-indexeddb/auto";
import {
  queueInspection,
  getPendingInspections,
  syncPendingInspections,
  MAX_RETRIES,
} from "../../src/lib/sync/queue";

const base = {
  location: "Lab unit",
  date: "2026-10-12",
  inspector: "Técnica B",
  status: "ok" as const,
  statusLabel: "Sin incidencias",
  findings: 0,
  summary: "Unit test de cola",
};

describe("unit: cola de sincronización", () => {
  it("un registro sincronizado deja de aparecer en pendientes", async () => {
    const record = await queueInspection(base);
    const sender = jest.fn(async () => ({ ok: true, serverId: "srv-1" }));

    const result = await syncPendingInspections(sender);

    expect(result.synced).toBe(1);
    expect(result.failed).toBe(0);

    const pendientes = await getPendingInspections();
    expect(pendientes.find((p) => p.localId === record.localId)).toBeUndefined();
    expect(sender).toHaveBeenCalledTimes(1);
  });

  it("al agotar reintentos marca skipped y no sigue enviando ese registro", async () => {
    await queueInspection(base);

    const sender = jest.fn(async () => ({ ok: false }));

    for (let i = 0; i < MAX_RETRIES; i++) {
      await syncPendingInspections(sender);
    }

    const last = await syncPendingInspections(sender);

    expect(last.skipped).toBeGreaterThanOrEqual(1);
    expect(sender.mock.calls.length).toBeLessThanOrEqual(MAX_RETRIES);
  });
});