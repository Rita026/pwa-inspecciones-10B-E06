import { getDB, type LocalInspection } from "../storage/schema";

export const MAX_RETRIES = 3;

export type SyncSummary = { synced: number; failed: number; skipped: number };

/** Guarda la captura antes de intentar cualquier envío. El ID permanece en los reintentos. */
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

  // add falla ante un ID repetido; put sobrescribiría una captura existente.
  await db.add("inspections", record);
  return record;
}

/** Devuelve todo lo no confirmado, incluso errores agotados, para no ocultar trabajo. */
export async function getPendingInspections(): Promise<LocalInspection[]> {
  const db = await getDB();
  const statuses = ["pending", "error", "syncing"] as const;
  const groups = await Promise.all(
    statuses.map((status) =>
      db.getAllFromIndex("inspections", "by-sync-status", status)
    )
  );
  return groups.flat().sort((a, b) => a.updatedAt - b.updatedAt);
}

/**
 * El receptor debe tratar localId como clave de idempotencia y devolver el mismo
 * resultado ante un reenvío. Sin esa garantía del receptor no hay deduplicación remota.
 */
export type SyncSender = (
  record: LocalInspection
) => Promise<{ ok: boolean; serverId?: string }>;

async function runSync(send: SyncSender): Promise<SyncSummary> {
  const db = await getDB();
  const outstanding = await getPendingInspections();
  const summary: SyncSummary = { synced: 0, failed: 0, skipped: 0 };

  for (const record of outstanding) {
    if (record.retryCount >= MAX_RETRIES) {
      summary.skipped++;
      continue;
    }

    // También recupera un registro que quedó en "syncing" al cerrarse la pestaña.
    // Se escribe antes de enviar para conservar el intento tras un cierre abrupto.
    const attempted: LocalInspection = {
      ...record,
      syncStatus: "syncing",
      retryCount: record.retryCount + 1,
    };
    await db.put("inspections", attempted);

    try {
      const result = await send(attempted);
      if (result.ok) {
        await db.put("inspections", {
          ...attempted,
          syncStatus: "synced",
          serverId: result.serverId,
        });
        summary.synced++;
      } else {
        await db.put("inspections", { ...attempted, syncStatus: "error" });
        summary.failed++;
      }
    } catch {
      await db.put("inspections", { ...attempted, syncStatus: "error" });
      summary.failed++;
    }
  }

  return summary;
}

// Dos clics en la misma pestaña comparten la ejecución y no envían dos veces.
let activeSync: Promise<SyncSummary> | null = null;

export function syncPendingInspections(send: SyncSender): Promise<SyncSummary> {
  if (activeSync) return activeSync;

  activeSync = runSync(send).finally(() => {
    activeSync = null;
  });
  return activeSync;
}
