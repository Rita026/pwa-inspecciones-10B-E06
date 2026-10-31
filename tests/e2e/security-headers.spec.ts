import { expect, test } from "@playwright/test";

/**
 * Semana 9: las cabeceras de src/middleware.ts en el build de producción y la
 * app funcionando bajo esa CSP. Las reglas de cada cabecera se prueban en
 * tests/security.spec.ts; aquí se comprueba lo que recibe el navegador.
 */

function nonceOf(policy: string | undefined): string {
  const match = /'nonce-([^']+)'/.exec(policy ?? "");
  if (!match) throw new Error(`La CSP no trae nonce: ${policy}`);
  return match[1];
}

const SERVED_PATHS = [
  "/",
  "/inspecciones",
  "/inspecciones/inspection-001",
  "/api/inspecciones/inspection-001",
  "/sw.js",
  "/manifest.webmanifest",
  "/offline.html",
];

test.describe("Cabeceras de seguridad en el build de producción", () => {
  for (const path of SERVED_PATHS) {
    test(`${path} responde con la CSP con nonce y las cabeceras de endurecimiento`, async ({ request }) => {
      const response = await request.get(path);
      const headers = response.headers();

      expect(response.ok()).toBe(true);
      expect(headers["content-security-policy"]).toMatch(
        /script-src 'self' 'nonce-[A-Za-z0-9+/]+={0,2}' 'strict-dynamic';/
      );
      expect(headers["content-security-policy"]).not.toContain("unsafe-eval");
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["referrer-policy"]).toBe("same-origin");
      expect(headers["permissions-policy"]).toContain("geolocation=(self)");
      expect(headers["x-powered-by"]).toBeUndefined();
    });
  }

  test("cada <script> del HTML lleva el nonce de su respuesta y el nonce cambia en cada petición", async ({ request }) => {
    const first = await request.get("/");
    const second = await request.get("/");
    const nonce = nonceOf(first.headers()["content-security-policy"]);
    const scripts = (await first.text()).match(/<script\b[^>]*>/g) ?? [];

    expect(nonceOf(second.headers()["content-security-policy"])).not.toBe(nonce);
    expect(scripts.length).toBeGreaterThan(0);
    for (const tag of scripts) {
      expect(tag).toContain(`nonce="${nonce}"`);
    }
  });

  test("la app se hidrata, registra el Service Worker y consulta la API sin violar la CSP", async ({ page }) => {
    const violations: string[] = [];
    page.on("console", (message) => {
      if (/Content Security Policy/i.test(message.text())) violations.push(message.text());
    });

    await page.goto("/");
    // El registro ocurre en un useEffect: solo pasa si los scripts con nonce se ejecutaron.
    const serviceWorkerActive = await page.evaluate(
      async () => Boolean((await navigator.serviceWorker.ready).active)
    );
    expect(serviceWorkerActive).toBe(true);

    // Detalle CSR: fetch a /api desde el navegador (connect-src 'self').
    await page.goto("/inspecciones/inspection-001");
    await expect(page.getByRole("heading", { name: "Laboratorio de Redes" })).toBeVisible();

    // offline.html usa un <style> en línea (style-src 'unsafe-inline').
    await page.goto("/offline.html");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(244, 246, 251)");

    expect(violations).toEqual([]);
  });

  test("el navegador bloquea un script inyectado en el HTML sin el nonce", async ({ page }) => {
    // Simula un XSS almacenado: se modifica el HTML que entrega el servidor
    // conservando sus cabeceras. El script con el nonce correcto es el control
    // de que la inyección sí llegó a la página.
    await page.route("/", async (route) => {
      const response = await route.fetch();
      const nonce = nonceOf(response.headers()["content-security-policy"]);
      const html = (await response.text()).replace(
        "</body>",
        `<script>window.sinNonce = true;</script>` +
          `<script nonce="${nonce}">window.conNonce = true;</script></body>`
      );
      await route.fulfill({ response, body: html });
    });

    await page.goto("/");
    const executed = await page.evaluate(() => {
      const flags = window as unknown as { sinNonce?: boolean; conNonce?: boolean };
      return { sinNonce: flags.sinNonce ?? false, conNonce: flags.conNonce ?? false };
    });

    expect(executed).toEqual({ sinNonce: false, conNonce: true });
  });
});
