/**
 * @jest-environment node
 *
 * Semana 9 — Seguridad. Esta parte cubre las cabeceras HTTP (CSP con nonce)
 * y que no haya credenciales en el repositorio. Las cabeceras que entrega el
 * build de producción se comprueban en tests/e2e/security-headers.spec.ts.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { NextRequest } from "next/server";
import {
  NONCE_HEADER,
  PERMISSIONS_POLICY,
  buildContentSecurityPolicy,
  buildSecurityHeaders,
  createNonce
} from "../src/lib/security/headers";
import { middleware } from "../src/middleware";

const root = process.cwd();
const nonce = "c2ludGV0aWNvLW5vbmNlLTEyMw==";

function directivesOf(policy: string): Map<string, string[]> {
  return new Map(
    policy.split(";").map((part): [string, string[]] => {
      const [name, ...sources] = part.trim().split(/\s+/);
      return [name, sources];
    })
  );
}

function nonceOf(policy: string | null): string {
  const match = /'nonce-([^']+)'/.exec(policy ?? "");
  if (!match) throw new Error(`La CSP no trae nonce: ${policy}`);
  return match[1];
}

describe("Cabeceras de seguridad: CSP con nonce", () => {
  it("en producción solo se ejecutan scripts con el nonce de la respuesta (sin 'unsafe-inline' ni 'unsafe-eval')", () => {
    const csp = directivesOf(buildContentSecurityPolicy({ nonce }));

    expect(csp.get("script-src")).toEqual([
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'"
    ]);
  });

  it("bloquea plugins, que otro sitio la incruste y cambios de <base> o del destino de formularios", () => {
    const csp = directivesOf(buildContentSecurityPolicy({ nonce }));

    expect(csp.get("default-src")).toEqual(["'self'"]);
    expect(csp.get("object-src")).toEqual(["'none'"]);
    expect(csp.get("frame-ancestors")).toEqual(["'none'"]);
    expect(csp.get("base-uri")).toEqual(["'self'"]);
    expect(csp.get("form-action")).toEqual(["'self'"]);
  });

  it("permite lo que la PWA carga de su propio origen: Service Worker, manifest y API", () => {
    const csp = directivesOf(buildContentSecurityPolicy({ nonce }));

    expect(csp.get("worker-src")).toEqual(["'self'"]);
    expect(csp.get("manifest-src")).toEqual(["'self'"]);
    expect(csp.get("connect-src")).toEqual(["'self'"]);
  });

  it("ninguna directiva admite orígenes externos ni comodines", () => {
    const sources = Array.from(
      directivesOf(buildContentSecurityPolicy({ nonce })).values()
    ).flat();

    for (const source of sources) {
      expect(source).toMatch(/^'[^']+'$|^(blob|data):$/);
    }
  });

  it("en desarrollo solo agrega 'unsafe-eval', que necesita React Refresh", () => {
    const production = buildContentSecurityPolicy({ nonce });
    const development = buildContentSecurityPolicy({ nonce, isDev: true });

    expect(development).toBe(
      production.replace("'strict-dynamic'", "'strict-dynamic' 'unsafe-eval'")
    );
  });

  it.each(["", "corto", "abc'; script-src *", "abc def ghi jkl mno==", "<script>alert(1)</script>"])(
    "rechaza el nonce %p para que no pueda inyectar directivas",
    (invalid) => {
      expect(() => buildContentSecurityPolicy({ nonce: invalid })).toThrow(
        "Nonce de CSP inválido"
      );
    }
  );

  it("createNonce produce 128 bits aleatorios en base64 y no se repite", () => {
    const nonces = Array.from({ length: 50 }, () => createNonce());

    for (const value of nonces) {
      expect(value).toMatch(/^[A-Za-z0-9+/]{22}==$/);
      expect(() => buildContentSecurityPolicy({ nonce: value })).not.toThrow();
    }
    expect(new Set(nonces).size).toBe(nonces.length);
  });
});

describe("Cabeceras de seguridad: resto de cabeceras", () => {
  it("evita el sniffing de MIME, los iframes y que la URL salga en el Referer a otros sitios", () => {
    expect(buildSecurityHeaders({ nonce })).toMatchObject({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "same-origin",
      "Cross-Origin-Opener-Policy": "same-origin"
    });
  });

  it("Permissions-Policy solo concede cámara y geolocalización al propio origen", () => {
    const features = PERMISSIONS_POLICY.split(", ").map((entry) => entry.split("="));
    const granted = features.filter(([, allow]) => allow !== "()");

    expect(granted).toEqual([
      ["camera", "(self)"],
      ["geolocation", "(self)"]
    ]);
    expect(features).toContainEqual(["microphone", "()"]);
  });

  it("HSTS solo se envía en producción", () => {
    expect(buildSecurityHeaders({ nonce })["Strict-Transport-Security"]).toBe(
      "max-age=63072000; includeSubDomains"
    );
    expect(buildSecurityHeaders({ nonce, isDev: true })).not.toHaveProperty(
      "Strict-Transport-Security"
    );
  });
});

describe("middleware", () => {
  const run = (path = "/") => middleware(new NextRequest(`http://localhost${path}`));

  it("agrega todas las cabeceras de seguridad a la respuesta", () => {
    const response = run("/inspecciones");
    const expected = buildSecurityHeaders({
      nonce: nonceOf(response.headers.get("content-security-policy"))
    });

    for (const [name, value] of Object.entries(expected)) {
      expect(response.headers.get(name)).toBe(value);
    }
  });

  it("entrega a Next.js la misma CSP y el mismo nonce para que los agregue a sus <script>", () => {
    const response = run();
    const csp = response.headers.get("content-security-policy");

    // NextResponse.next({ request }) reenvía a Next.js las cabeceras de la
    // petición modificadas con el prefijo x-middleware-request-.
    expect(response.headers.get(`x-middleware-request-${NONCE_HEADER}`)).toBe(nonceOf(csp));
    expect(response.headers.get("x-middleware-request-content-security-policy")).toBe(csp);
  });

  it("usa un nonce distinto en cada petición", () => {
    const first = nonceOf(run().headers.get("content-security-policy"));
    const second = nonceOf(run().headers.get("content-security-policy"));

    expect(first).not.toBe(second);
  });
});

describe("Credenciales fuera del repositorio", () => {
  const git = (...args: string[]) => spawnSync("git", args, { cwd: root, encoding: "utf8" });

  // Versionados y nuevos que Git no ignora: lo que subiría un `git add .`.
  const listing = git("ls-files", "-z", "--cached", "--others", "--exclude-standard");
  if (listing.status !== 0) {
    throw new Error(`git ls-files falló: ${listing.stderr}`);
  }
  const repoFiles = listing.stdout.split("\0").filter(Boolean);

  // Formatos con prefijo fijo de proveedores comunes: buscan el valor de la
  // credencial, no palabras sueltas que también aparecen en la documentación.
  const CREDENTIAL_PATTERNS: ReadonlyArray<[string, RegExp]> = [
    ["clave privada PEM", /-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----/],
    ["clave de acceso de AWS", /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
    ["credencial de GitHub", /\bgh[pousr]_[A-Za-z0-9]{36,}\b/],
    ["clave de Google Cloud", /\bAIza[0-9A-Za-z_-]{35}\b/],
    ["clave live de Stripe", /\b[rs]k_live_[0-9A-Za-z]{20,}\b/],
    ["credencial de Slack", /\bxox[abposr]-[0-9A-Za-z-]{10,}/],
    ["JWT firmado", /\beyJ[\w-]{10,}\.eyJ[\w-]{10,}\.[\w-]{10,}/],
    ["URL con usuario y contraseña", /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:[^\s/@]+@/i]
  ];

  function findCredentials(file: string, text: string): string[] {
    return text.split(/\r?\n/).flatMap((line, index) =>
      CREDENTIAL_PATTERNS.filter(([, pattern]) => pattern.test(line)).map(
        ([name]) => `${file}:${index + 1} ${name}`
      )
    );
  }

  function readText(file: string): string | null {
    const path = resolve(root, file);
    if (!existsSync(path)) return null;
    const content = readFileSync(path);
    return content.includes(0) ? null : content.toString("utf8");
  }

  it("ningún archivo .env se puede subir (solo se admitiría .env.example)", () => {
    const envFiles = repoFiles.filter(
      (file) => /(^|\/)\.env(\.|$)/.test(file) && !file.endsWith(".env.example")
    );

    expect(envFiles).toEqual([]);
  });

  it.each([".env", ".env.local", ".env.production.local"])(
    "Git ignora %s aunque alguien lo cree localmente",
    (file) => {
      expect(git("check-ignore", "-q", file).status).toBe(0);
    }
  );

  it("Git no ignora .env.example, que solo documenta nombres de variables", () => {
    expect(git("check-ignore", "-q", ".env.example").status).toBe(1);
  });

  it("ningún archivo del repositorio contiene credenciales con formato conocido", () => {
    const findings = repoFiles.flatMap((file) => {
      const text = readText(file);
      return text === null ? [] : findCredentials(file, text);
    });

    expect(repoFiles.length).toBeGreaterThan(50);
    expect(findings).toEqual([]);
  });

  // Se arman al ejecutar para que este archivo no contenga ninguna credencial
  // literal: ni la marca el escaneo anterior ni la protección de push de GitHub.
  const SYNTHETIC_SAMPLES: ReadonlyArray<[string, string]> = [
    ["clave privada PEM", ["-----BEGIN RSA PRIVATE", "KEY-----"].join(" ")],
    ["clave de acceso de AWS", "AKIA" + "X".repeat(16)],
    ["credencial de GitHub", "ghp_" + "x".repeat(36)],
    ["clave de Google Cloud", "AIza" + "x".repeat(35)],
    ["clave live de Stripe", "sk_" + "live_" + "x".repeat(24)],
    ["credencial de Slack", "xoxb-" + "1".repeat(12)],
    ["JWT firmado", ["eyJ" + "a".repeat(12), "eyJ" + "b".repeat(12), "c".repeat(12)].join(".")],
    ["URL con usuario y contraseña", "https://" + "usuario:clave" + "@ejemplo.test"]
  ];

  it.each(SYNTHETIC_SAMPLES)(
    "el detector reconoce una %s sintética (control de la prueba anterior)",
    (name, sample) => {
      expect(findCredentials("muestra.ts", `const valor = "${sample}";`)).toEqual([
        `muestra.ts:1 ${name}`
      ]);
    }
  );

  it("el código no usa variables NEXT_PUBLIC_, que Next.js copia al JavaScript del navegador", () => {
    const publicVariables = repoFiles
      .filter((file) => file.startsWith("src/"))
      .flatMap((file) => readText(file)?.match(/NEXT_PUBLIC_\w*/g) ?? []);

    expect(publicVariables).toEqual([]);
  });
});
