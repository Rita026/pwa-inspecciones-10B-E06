import { openDB, type DBSchema, type IDBPDatabase } from "idb";

/**
 * Una inspección guardada localmente, pendiente de sincronizar o ya sincronizada.
 */
export type LocalInspection = {
  localId: string;          // identificador generado en el dispositivo (nunca cambia)
  serverId?: string;        // id que asigna el servidor una vez sincronizada
  location: string;
  date: string;
  inspector: string;
  status: "ok" | "attention";
  statusLabel: string;
  findings: number;
  summary: string;
  updatedAt: number;        // fecha de edición, no cambia durante los reintentos
  syncStatus: "pending" | "syncing" | "synced" | "error";
  retryCount: number;       // intentos iniciados, exitosos o fallidos (máximo 3)
};

interface InspeccionesDB extends DBSchema {
  inspections: {
    key: string; // localId
    value: LocalInspection;
    indexes: { "by-sync-status": string };
  };
}

const DB_NAME = "inspecciones-db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<InspeccionesDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<InspeccionesDB>> {
  if (!dbPromise) {
    dbPromise = openDB<InspeccionesDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore("inspections", {
          keyPath: "localId",
        });
        store.createIndex("by-sync-status", "syncStatus");
      },
    }).catch((error) => {
      // Permite volver a abrir la base si la primera apertura falló.
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}
