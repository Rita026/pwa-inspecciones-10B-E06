import { fireEvent, render, screen } from "@testing-library/react";
import SyncDemoPanel from "../src/components/sync-demo-panel";
import {
  getPendingInspections,
  queueInspection,
  syncPendingInspections
} from "../src/lib/sync/queue";
import type { LocalInspection } from "../src/lib/storage/schema";

jest.mock("../src/lib/sync/queue", () => ({
  getPendingInspections: jest.fn(),
  queueInspection: jest.fn(),
  syncPendingInspections: jest.fn()
}));

const record: LocalInspection = {
  localId: "local-test-1",
  location: "Laboratorio de demostración",
  date: "2026-09-29",
  inspector: "Técnica de prueba",
  status: "ok",
  statusLabel: "Sin incidencias",
  findings: 0,
  summary: "Registro sintético de prueba.",
  updatedAt: 1,
  syncStatus: "pending",
  retryCount: 0
};

describe("panel de sincronización de demostración", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("crea un registro sintético, actualiza el contador y confirma con un ID determinista simulado", async () => {
    jest.mocked(getPendingInspections)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([record])
      .mockResolvedValueOnce([]);
    jest.mocked(queueInspection).mockResolvedValue(record);
    jest.mocked(syncPendingInspections).mockResolvedValue({
      synced: 1,
      failed: 0,
      skipped: 0
    });

    render(<SyncDemoPanel />);

    expect(await screen.findByText("0 inspecciones pendientes")).toBeInTheDocument();
    expect(screen.getByText(/no envía datos a un servidor/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Crear inspección de prueba" }));
    expect(await screen.findByText("1 inspección pendiente")).toBeInTheDocument();
    expect(queueInspection).toHaveBeenCalledWith(
      expect.objectContaining({
        location: "Laboratorio de demostración",
        inspector: "Técnica de prueba"
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "Simular sincronización" }));
    expect(await screen.findByText("0 inspecciones pendientes")).toBeInTheDocument();
    expect(screen.getByText(/Sincronización simulada: 1 confirmadas/)).toBeInTheDocument();

    const sender = jest.mocked(syncPendingInspections).mock.calls[0][0];
    await expect(sender(record)).resolves.toEqual({
      ok: true,
      serverId: "demo-local-test-1"
    });
  });
});
