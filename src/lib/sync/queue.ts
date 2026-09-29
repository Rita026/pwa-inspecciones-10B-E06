import { getDB, type LocalInspection } from "../storage/schema";

const MAX_RETRIES = 3;

/**
 * Guarda una nueva inspección localmente con estado "pending".
 * Genera un localId único para poder identificarla siempre,
 * incluso antes de que el servidor la conozca.
 */
export async function queueInspection(
  data: Omit<
    LocalInspection,
    "localId" | "syncStatus" | "retryCount" | "updatedAt" | "serverId"
  >
): Promise<LocalInspection> {
  const db = await getDB();

  const record: LocalInspection = {
    ...data,
    localId: crypto.randomUUID(),
    syncStatus: "pending",
    retryCount: 0,
    updatedAt: Date.now(),
  };

  await db.put("inspections", record);
  return record;
}

/**
 * Regresa todas las inspecciones que aún no se han sincronizado.
 */
export async function getPendingInspections(): Promise<LocalInspection[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("inspections", "by-sync-status", "pending");
  return all;
}

/**
 * Tipo de función que representa "enviar al servidor". Se inyecta desde
 * afuera para poder probar la cola sin depender de una red real.
 */
export type SyncSender = (
  record: LocalInspection
) => Promise<{ ok: boolean; serverId?: string }>;

/**
 * Intenta sincronizar todas las inspecciones pendientes.
 * - Si el envío tiene éxito: marca la inspección como "synced" y guarda el serverId.
 * - Si falla: incrementa retryCount; si llega al máximo, marca "error" y deja de reintentar.
 * Es idempotente: cada registro se identifica por su localId, así que reintentar
 * un envío que ya se procesó en el servidor no debería crear una copia duplicada
 * (el servidor debe usar ese localId para deduplicar).
 */
export async function syncPendingInspections(send: SyncSender): Promise<{
  synced: number;
  failed: number;
  skipped: number;
}> {
  const db = await getDB();
  const pending = await getPendingInspections();

  let synced = 0;
  let failed = 0;
  let skipped = 0;

  for (const record of pending) {
    if (record.retryCount >= MAX_RETRIES) {
      skipped++;
      continue;
    }

    const updated: LocalInspection = { ...record, syncStatus: "syncing" };
    await db.put("inspections", updated);

    try {
      const result = await send(updated);

      if (result.ok) {
        await db.put("inspections", {
          ...updated,
          syncStatus: "synced",
          serverId: result.serverId,
        });
        synced++;
      } else {
        await db.put("inspections", {
          ...updated,
          syncStatus: "error",
          retryCount: updated.retryCount + 1,
        });
        failed++;
      }
    } catch {
      await db.put("inspections", {
        ...updated,
        syncStatus: "error",
        retryCount: updated.retryCount + 1,
      });
      failed++;
    }
  }

  return { synced, failed, skipped };
}