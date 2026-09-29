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
  updatedAt: number;        // timestamp de la última modificación (para resolver conflictos)
  syncStatus: "pending" | "syncing" | "synced" | "error";
  retryCount: number;       // cuántas veces se ha intentado enviar
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

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<InspeccionesDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore("inspections", {
          keyPath: "localId",
        });
        store.createIndex("by-sync-status", "syncStatus");
      },
    });
  }
  return dbPromise;
}