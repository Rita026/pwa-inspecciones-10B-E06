import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  registerServiceWorker,
  SERVICE_WORKER_URL
} from "../src/lib/pwa/register-service-worker";

type WorkerHandler = (event: any) => void;

const serviceWorkerPath = resolve(process.cwd(), "public", "sw.js");

async function loadWorker(options?: {
  cacheNames?: string[];
  entries?: Record<string, unknown>;
  fetchImplementation?: jest.Mock;
}) {
  const source = await readFile(serviceWorkerPath, "utf8");
  const handlers = new Map<string, WorkerHandler>();
  const entries = new Map(Object.entries(options?.entries ?? {}));
  const addAll = jest.fn(async (urls: string[]) => {
    urls.forEach((url) => entries.set(url, { url }));
  });
  const cache = {
    addAll,
    match: jest.fn(async (url: string) => entries.get(url))
  };
  const caches = {
    open: jest.fn(async () => cache),
    keys: jest.fn(async () => options?.cacheNames ?? ["inspecciones-cache-v1"]),
    delete: jest.fn(async () => true)
  };
  const clients = { claim: jest.fn(async () => undefined) };
  const self = {
    addEventListener: jest.fn((type: string, handler: WorkerHandler) => {
      handlers.set(type, handler);
    }),
    clients
  };
  const fetchImplementation =
    options?.fetchImplementation ?? jest.fn(async () => ({ ok: true }));

  new Function("self", "caches", "fetch", source)(
    self,
    caches,
    fetchImplementation
  );

  return { addAll, cache, caches, clients, fetchImplementation, handlers };
}

async function waitFor(eventHandler: WorkerHandler) {
  const pending: Promise<unknown>[] = [];
  eventHandler({
    waitUntil: (work: Promise<unknown>) => pending.push(work)
  });
  await Promise.all(pending);
}

async function respondToNavigation(
  eventHandler: WorkerHandler,
  path = "/"
) {
  let response: Promise<unknown> | undefined;
  eventHandler({
    request: {
      method: "GET",
      mode: "navigate",
      url: `https://inspecciones.test${path}`
    },
    respondWith: (work: Promise<unknown>) => {
      response = work;
    }
  });
  return response;
}

describe("service worker de inspecciones", () => {
  it("precarga la página principal, el manifest y la página offline en inspecciones-cache-v1", async () => {
    const worker = await loadWorker();
    const install = worker.handlers.get("install");

    expect(install).toBeDefined();
    await waitFor(install!);

    expect(worker.caches.open).toHaveBeenCalledWith("inspecciones-cache-v1");
    expect(worker.addAll).toHaveBeenCalledWith([
      "/",
      "/manifest.webmanifest",
      "/offline.html"
    ]);
  });

  it("elimina únicamente las cachés antiguas de inspecciones al activarse", async () => {
    const worker = await loadWorker({
      cacheNames: [
        "inspecciones-cache-v0",
        "inspecciones-cache-v1",
        "cache-de-otra-aplicacion"
      ]
    });
    const activate = worker.handlers.get("activate");

    expect(activate).toBeDefined();
    await waitFor(activate!);

    expect(worker.caches.delete).toHaveBeenCalledWith("inspecciones-cache-v0");
    expect(worker.caches.delete).not.toHaveBeenCalledWith(
      "inspecciones-cache-v1"
    );
    expect(worker.caches.delete).not.toHaveBeenCalledWith(
      "cache-de-otra-aplicacion"
    );
    expect(worker.clients.claim).toHaveBeenCalledTimes(1);
  });

  it("cuando no hay red sirve inicio guardado y, si falta, la página offline", async () => {
    const offlineFetch = jest.fn(async () => Promise.reject(new Error("offline")));
    const withHome = await loadWorker({
      entries: { "/": "inicio guardado", "/offline.html": "sin conexión" },
      fetchImplementation: offlineFetch
    });
    const fetchHandler = withHome.handlers.get("fetch");

    expect(fetchHandler).toBeDefined();
    await expect(respondToNavigation(fetchHandler!)).resolves.toBe(
      "inicio guardado"
    );

    const withoutHome = await loadWorker({
      entries: { "/offline.html": "sin conexión" },
      fetchImplementation: offlineFetch
    });
    await expect(
      respondToNavigation(withoutHome.handlers.get("fetch")!)
    ).resolves.toBe("sin conexión");
  });
});

describe("registro del service worker", () => {
  const serviceWorkerDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    "serviceWorker"
  );

  afterEach(() => {
    if (serviceWorkerDescriptor) {
      Object.defineProperty(navigator, "serviceWorker", serviceWorkerDescriptor);
      return;
    }

    delete (navigator as Navigator & { serviceWorker?: unknown }).serviceWorker;
  });

  it("registra /sw.js con alcance raíz cuando el navegador lo admite", async () => {
    const registration = { scope: "/" } as ServiceWorkerRegistration;
    const register = jest.fn(async () => registration);
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { register }
    });

    await expect(registerServiceWorker()).resolves.toBe(registration);
    expect(register).toHaveBeenCalledWith(SERVICE_WORKER_URL, { scope: "/" });
  });
});
