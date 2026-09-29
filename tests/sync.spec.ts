import "fake-indexeddb/auto";
import { deserialize, serialize } from "node:v8";
import { getDB, type LocalInspection } from "../src/lib/storage/schema";
import {
  getPendingInspections,
  MAX_RETRIES,
  queueInspection,
  syncPendingInspections,
} from "../src/lib/sync/queue";
import { resolveConflict } from "../src/lib/sync/conflict-policy";

const sample = {
  location: "Laboratorio sintético",
  date: "2026-09-29",
  inspector: "Técnica de prueba",
  status: "ok" as const,
  statusLabel: "Sin incidencias",
  findings: 0,
  summary: "Registro creado solo para pruebas.",
};

let nextId = 0;

beforeAll(() => {
  Object.defineProperty(globalThis, "structuredClone", {
    configurable: true,
    value: <T,>(value: T): T => deserialize(serialize(value)),
  });
  Object.defineProperty(globalThis.crypto, "randomUUID", {
    configurable: true,
    value: () => `test-local-${++nextId}`,
  });
});

beforeEach(async () => {
  const db = await getDB();
  await db.clear("inspections");
});

describe("persistencia y cola de sincronización", () => {
  it("guarda una captura sintética en IndexedDB con ID local y estado pendiente", async () => {
    const record = await queueInspection(sample);
    const db = await getDB();

    expect(record).toMatchObject({
      ...sample,
      localId: expect.stringMatching(/^test-local-/),
      syncStatus: "pending",
      retryCount: 0,
    });
    expect(await db.get("inspections", record.localId)).toEqual(record);
    expect(await getPendingInspections()).toEqual([record]);
  });

  it("conserva localId en el envío y no vuelve a enviar un registro confirmado", async () => {
    const record = await queueInspection(sample);
    const send = jest.fn(async (item: LocalInspection) => ({
      ok: true,
      serverId: `demo-${item.localId}`,
    }));

    expect(await syncPendingInspections(send)).toEqual({
      synced: 1,
      failed: 0,
      skipped: 0,
    });
    expect(await syncPendingInspections(send)).toEqual({
      synced: 0,
      failed: 0,
      skipped: 0,
    });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0].localId).toBe(record.localId);
    expect(await getPendingInspections()).toHaveLength(0);
    expect(await (await getDB()).get("inspections", record.localId)).toMatchObject({
      syncStatus: "synced",
      serverId: `demo-${record.localId}`,
      retryCount: 1,
    });
  });

  it("reintenta un error con el mismo ID y mantiene visible el pendiente", async () => {
    const record = await queueInspection(sample);
    const seenIds: string[] = [];
    const send = jest.fn(async (item: LocalInspection) => {
      seenIds.push(item.localId);
      if (seenIds.length === 1) throw new Error("Red interrumpida");
      return { ok: true, serverId: "server-synthetic-1" };
    });

    expect(await syncPendingInspections(send)).toMatchObject({ failed: 1 });
    expect(await getPendingInspections()).toMatchObject([
      { localId: record.localId, syncStatus: "error", retryCount: 1 },
    ]);
    expect(await syncPendingInspections(send)).toMatchObject({ synced: 1 });
    expect(seenIds).toEqual([record.localId, record.localId]);
    expect(await getPendingInspections()).toHaveLength(0);
  });

  it("un receptor idempotente devuelve el mismo serverId tras perder la primera respuesta", async () => {
    const record = await queueInspection(sample);
    const received = new Map<string, string>();
    let lostResponse = true;
    const send = jest.fn(async (item: LocalInspection) => {
      if (!received.has(item.localId)) {
        received.set(item.localId, `server-${received.size + 1}`);
      }
      if (lostResponse) {
        lostResponse = false;
        throw new Error("Respuesta perdida después de aceptar el registro");
      }
      return { ok: true, serverId: received.get(item.localId) };
    });

    expect(await syncPendingInspections(send)).toMatchObject({ failed: 1 });
    expect(await syncPendingInspections(send)).toMatchObject({ synced: 1 });
    expect(received.size).toBe(1);
    expect(send).toHaveBeenCalledTimes(2);
    expect(await (await getDB()).get("inspections", record.localId)).toMatchObject({
      serverId: "server-1",
      syncStatus: "synced",
    });
  });

  it("limita los envíos a tres intentos y no oculta el error agotado", async () => {
    const record = await queueInspection(sample);
    const send = jest.fn(async () => ({ ok: false }));

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      expect(await syncPendingInspections(send)).toMatchObject({ failed: 1 });
    }
    expect(await syncPendingInspections(send)).toEqual({
      synced: 0,
      failed: 0,
      skipped: 1,
    });
    expect(send).toHaveBeenCalledTimes(MAX_RETRIES);
    expect(await getPendingInspections()).toMatchObject([
      { localId: record.localId, syncStatus: "error", retryCount: MAX_RETRIES },
    ]);
  });

  it("recupera en el siguiente intento una captura interrumpida en syncing", async () => {
    const record = await queueInspection(sample);
    await (await getDB()).put("inspections", {
      ...record,
      syncStatus: "syncing",
      retryCount: 1,
    });
    const send = jest.fn(async () => ({ ok: true, serverId: "server-recovered" }));

    expect(await syncPendingInspections(send)).toMatchObject({ synced: 1 });
    expect(send).toHaveBeenCalledTimes(1);
    expect(await (await getDB()).get("inspections", record.localId)).toMatchObject({
      syncStatus: "synced",
      retryCount: 2,
    });
  });

  it("comparte una ejecución entre dos clics simultáneos en la pestaña", async () => {
    await queueInspection(sample);
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const send = jest.fn(async () => {
      await gate;
      return { ok: true, serverId: "server-once" };
    });

    const first = syncPendingInspections(send);
    const second = syncPendingInspections(send);
    expect(first).toBe(second);
    release();
    expect(await first).toMatchObject({ synced: 1 });
    expect(send).toHaveBeenCalledTimes(1);
  });
});

describe("política de conflictos", () => {
  const local: LocalInspection = {
    ...sample,
    localId: "same-local-id",
    syncStatus: "pending",
    retryCount: 0,
    updatedAt: 100,
  };

  it("elige la versión local si es más reciente", () => {
    expect(resolveConflict(local, { ...local, updatedAt: 99 })).toEqual({
      winner: local,
      reason: "local-newer",
    });
  });

  it("elige la versión del servidor si es más reciente", () => {
    const server = { ...local, updatedAt: 101 };
    expect(resolveConflict(local, server)).toEqual({
      winner: server,
      reason: "server-newer",
    });
  });

  it("mantiene la versión local si los tiempos son iguales", () => {
    expect(resolveConflict(local, { ...local })).toEqual({
      winner: local,
      reason: "equal-timestamps-local-kept",
    });
  });
});
