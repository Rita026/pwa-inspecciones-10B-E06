import { expect, test, type Page } from "@playwright/test";

/** Lo que el formulario guarda en IndexedDB (src/lib/storage/schema.ts). */
type StoredInspection = {
  localId: string;
  serverId?: string;
  location: string;
  date: string;
  inspector: string;
  status: "ok" | "attention";
  findings: number;
  summary: string;
  coordinates?: { latitude: number; longitude: number; accuracy: number | null };
  syncStatus: "pending" | "syncing" | "synced" | "error";
  retryCount: number;
};

const sample = {
  location: "Laboratorio de prueba B-12",
  inspector: "Técnico de prueba",
  date: "2026-10-25",
  status: "attention" as const,
  findings: "2",
  summary: "Extintor ficticio sin sello y luminaria de emergencia apagada.",
};

/** Lee la base local que crea la app; sólo se llama cuando la app ya la abrió. */
async function storedInspections(page: Page): Promise<StoredInspection[]> {
  return page.evaluate(
    () =>
      new Promise<StoredInspection[]>((resolve, reject) => {
        const request = indexedDB.open("inspecciones-db");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const all = db.transaction("inspections", "readonly").objectStore("inspections").getAll();
          all.onerror = () => reject(all.error);
          all.onsuccess = () => {
            db.close();
            resolve(all.result as StoredInspection[]);
          };
        };
      })
  );
}

function inspectionForm(page: Page) {
  return page.getByRole("region", { name: "Registrar inspección" });
}

function syncQueue(page: Page) {
  return page.getByRole("region", { name: "Cola de sincronización" });
}

async function openHome(page: Page) {
  await page.goto("/");
  // El panel de la cola abre IndexedDB al montar; esperar evita leer una base sin crear.
  await expect(syncQueue(page).getByText(/\d+ inspecci(ón|ones) pendientes?/)).toBeVisible();
}

async function fillInspection(page: Page) {
  const form = inspectionForm(page);
  await form.getByLabel("Lugar de inspección").fill(sample.location);
  await form.getByLabel("Responsable").fill(sample.inspector);
  await form.getByLabel("Fecha").fill(sample.date);
  await form.getByLabel("Estado").selectOption(sample.status);
  await form.getByLabel("Número de hallazgos").fill(sample.findings);
  await form.getByLabel("Resumen").fill(sample.summary);
}

async function saveInspection(page: Page) {
  const form = inspectionForm(page);
  await form.getByRole("button", { name: "Guardar inspección" }).click();
  await expect(form.getByText("Inspección guardada localmente y pendiente de sincronización.")).toBeVisible();
}

test.describe("flujo completo de una inspección", () => {
  test("datos inválidos no se guardan y se señalan los campos", async ({ page }) => {
    await openHome(page);
    const form = inspectionForm(page);

    await form.getByLabel("Número de hallazgos").fill("-1");
    await form.getByRole("button", { name: "Guardar inspección" }).click();

    await expect(form.getByText("Revisa los campos señalados antes de guardar.")).toBeVisible();
    await expect(form.getByText("Escribe el lugar de la inspección.")).toBeVisible();
    await expect(form.getByText("Escribe el nombre del responsable.")).toBeVisible();
    await expect(form.getByText("Los hallazgos deben ser un entero mayor o igual a cero.")).toBeVisible();
    await expect(form.getByText("Escribe un resumen de la inspección.")).toBeVisible();
    await expect(form.getByLabel("Lugar de inspección")).toHaveAttribute("aria-invalid", "true");
    expect(await storedInspections(page)).toEqual([]);
  });

  test("captura sin conexión, sobrevive a la recarga y se sincroniza una sola vez", async ({ page, context }) => {
    await openHome(page);
    const queue = syncQueue(page);
    await expect(queue.getByText("0 inspecciones pendientes")).toBeVisible();

    // 1. Sin red: el formulario guarda en IndexedDB, no depende del servidor.
    await context.setOffline(true);
    await fillInspection(page);
    await saveInspection(page);
    await expect(inspectionForm(page).getByLabel("Lugar de inspección")).toHaveValue("");

    await queue.getByRole("button", { name: "Actualizar contador" }).click();
    await expect(queue.getByText("1 inspección pendiente")).toBeVisible();

    const [saved] = await storedInspections(page);
    expect(saved).toMatchObject({
      location: sample.location,
      inspector: sample.inspector,
      date: sample.date,
      status: "attention",
      findings: 2,
      summary: sample.summary,
      syncStatus: "pending",
      retryCount: 0,
    });
    expect(saved.coordinates).toBeUndefined();

    // 2. Vuelve la red y se recarga la app: la captura sigue pendiente con la misma identidad.
    await context.setOffline(false);
    await page.reload();
    await expect(queue.getByText("1 inspección pendiente")).toBeVisible();
    const afterReload = await storedInspections(page);
    expect(afterReload).toHaveLength(1);
    expect(afterReload[0].localId).toBe(saved.localId);

    // 3. Sincronización (receptor simulado de la app): se confirma y sale de pendientes.
    await queue.getByRole("button", { name: "Simular sincronización" }).click();
    await expect(queue.getByText(/1 confirmadas, 0 fallidas y 0 omitidas/)).toBeVisible();
    await expect(queue.getByText("0 inspecciones pendientes")).toBeVisible();
    await expect(queue.getByRole("button", { name: "Simular sincronización" })).toBeDisabled();

    const synced = await storedInspections(page);
    expect(synced).toHaveLength(1);
    expect(synced[0]).toMatchObject({
      localId: saved.localId,
      syncStatus: "synced",
      serverId: `demo-${saved.localId}`,
    });
  });

  test("con permiso concedido la ubicación se guarda junto con la inspección", async ({ page, context }) => {
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 20.53, longitude: -97.46, accuracy: 25 });
    await openHome(page);
    const form = inspectionForm(page);

    await form.getByRole("button", { name: "Obtener ubicación del dispositivo" }).click();
    await expect(form.getByText("Ubicación obtenida correctamente.")).toBeVisible();
    await expect(form.getByText("Coordenadas obtenidas: 20.53000, -97.46000")).toBeVisible();

    await fillInspection(page);
    await saveInspection(page);

    const [saved] = await storedInspections(page);
    expect(saved.coordinates).toEqual({ latitude: 20.53, longitude: -97.46, accuracy: 25 });
  });
});

test.describe("variante con permiso de ubicación negado", () => {
  // Sin concesión explícita, Chromium rechaza la geolocalización (PERMISSION_DENIED).
  test.use({ permissions: [] });

  test("la ubicación se niega, se informa y la inspección se guarda sin coordenadas", async ({ page }) => {
    await openHome(page);
    const form = inspectionForm(page);
    const permission = await page.evaluate(async () => (await navigator.permissions.query({ name: "geolocation" })).state);
    expect(permission).not.toBe("granted");

    await form.getByRole("button", { name: "Obtener ubicación del dispositivo" }).click();
    await expect(form.getByText("Permiso denegado. Puedes guardar la inspección sin ubicación.")).toBeVisible();
    await expect(form.getByText(/Coordenadas obtenidas/)).toHaveCount(0);
    // El botón vuelve a estar disponible: no queda bloqueado ni reintenta solo.
    await expect(form.getByRole("button", { name: "Obtener ubicación del dispositivo" })).toBeEnabled();

    await fillInspection(page);
    await saveInspection(page);

    const queue = syncQueue(page);
    await queue.getByRole("button", { name: "Actualizar contador" }).click();
    await expect(queue.getByText("1 inspección pendiente")).toBeVisible();

    const stored = await storedInspections(page);
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ location: sample.location, syncStatus: "pending" });
    expect(stored[0].coordinates).toBeUndefined();

    await queue.getByRole("button", { name: "Simular sincronización" }).click();
    await expect(queue.getByText(/1 confirmadas, 0 fallidas y 0 omitidas/)).toBeVisible();
    await expect(queue.getByText("0 inspecciones pendientes")).toBeVisible();
  });
});
