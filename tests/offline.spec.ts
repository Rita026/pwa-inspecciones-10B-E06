/**
 * Prueba del comportamiento offline del Service Worker (public/sw.js).
 * Simula el entorno de un Service Worker (self, caches, fetch) porque
 * Jest no ejecuta un navegador real ni un Service Worker de verdad.
 */

type Listener = (event: any) => void;

function loadServiceWorker() {
  let listeners: Record<string, Listener> = {};
  let cacheStore = new Map<string, string>();
  let deletedCaches: string[] = [];
  let claimed = false;

  (global as any).self = {
    addEventListener: (type: string, handler: Listener) => {
      listeners[type] = handler;
    },
    clients: {
      claim: () => {
        claimed = true;
      },
    },
  };

  const fakeCache = {
    addAll: async (urls: string[]) => {
      urls.forEach((url) => cacheStore.set(url, `cached:${url}`));
    },
    match: async (url: string) => {
      const value = cacheStore.get(url);
      return value ? { url, body: value } : undefined;
    },
  };

  (global as any).caches = {
    open: async (_name: string) => fakeCache,
    keys: async () => ["inspecciones-cache-v0", "inspecciones-cache-v1", "otra-cache-ajena"],
    delete: async (name: string) => {
      deletedCaches.push(name);
      return true;
    },
  };

  jest.resetModules();
  require("../public/sw.js");

  return { listeners, cacheStore, deletedCaches, isClaimed: () => claimed };
}

describe("Service Worker (public/sw.js) - comportamiento offline", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("en 'install', guarda en caché la página principal, el manifest y la página offline", async () => {
    const { listeners, cacheStore } = loadServiceWorker();

    let installPromise: Promise<any> | undefined;
    await listeners["install"]({
      waitUntil: (p: Promise<any>) => {
        installPromise = p;
      },
    });
    await installPromise;

    expect(cacheStore.has("/")).toBe(true);
    expect(cacheStore.has("/manifest.webmanifest")).toBe(true);
    expect(cacheStore.has("/offline.html")).toBe(true);
  });

  it("en 'activate', borra únicamente las cachés viejas del proyecto y conserva la actual", async () => {
    const { listeners, deletedCaches, isClaimed } = loadServiceWorker();

    let activatePromise: Promise<any> | undefined;
    await listeners["activate"]({
      waitUntil: (p: Promise<any>) => {
        activatePromise = p;
      },
    });
    await activatePromise;

    expect(deletedCaches).toContain("inspecciones-cache-v0");
    expect(deletedCaches).not.toContain("inspecciones-cache-v1");
    expect(deletedCaches).not.toContain("otra-cache-ajena");
    expect(isClaimed()).toBe(true);
  });

  it("en 'fetch' de navegación, si la red falla, responde con la página cacheada", async () => {
    const { listeners } = loadServiceWorker();

    (global as any).fetch = jest.fn(async () => {
      throw new Error("network error");
    });

    // Precache manual para esta prueba: simulamos que "/" ya estaba guardado
    await listeners["install"]({ waitUntil: async (p: Promise<any>) => p });

    let respondWithPromise: Promise<any> | undefined;
    listeners["fetch"]({
      request: { method: "GET", mode: "navigate", destination: "document", url: "http://localhost/" },
      respondWith: (p: Promise<any>) => {
        respondWithPromise = p;
      },
    });

    const response = await respondWithPromise;
    expect(response).toBeDefined();
    expect(response.body).toBe("cached:/");
  });

  it("en 'fetch' que no es navegación (ej. una imagen), no intercepta la petición", () => {
    const { listeners } = loadServiceWorker();

    let respondWithCalled = false;
    listeners["fetch"]({
      request: { method: "GET", mode: "no-cors", destination: "image", url: "http://localhost/logo.png" },
      respondWith: () => {
        respondWithCalled = true;
      },
    });

    expect(respondWithCalled).toBe(false);
  });
});