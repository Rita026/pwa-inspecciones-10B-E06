/**
 * Cabeceras de seguridad de la PWA (Semana 9).
 *
 * Las aplica `src/middleware.ts` a cada respuesta. La CSP usa un nonce nuevo
 * por petición: Next.js lo copia a sus propios <script>, así que cualquier
 * script inyectado sin ese nonce queda bloqueado por el navegador.
 */

export const NONCE_HEADER = "x-nonce";

export type SecurityHeaderOptions = {
  nonce: string;
  /** `next dev` necesita 'unsafe-eval' para React Refresh; producción no. */
  isDev?: boolean;
};

// Solo caracteres de base64: un nonce con comillas o «;» podría inyectar directivas.
const NONCE_PATTERN = /^[A-Za-z0-9+/]{16,}={0,2}$/;

/** Nonce de 128 bits en base64 con el generador criptográfico del runtime. */
export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));
}

export function buildContentSecurityPolicy({
  nonce,
  isDev = false
}: SecurityHeaderOptions): string {
  if (!NONCE_PATTERN.test(nonce)) {
    throw new Error("Nonce de CSP inválido: debe ser base64.");
  }

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // 'strict-dynamic' deja cargar los chunks que pide un script con nonce;
    // 'self' solo sirve de respaldo a navegadores sin CSP nivel 3.
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      ...(isDev ? ["'unsafe-eval'"] : [])
    ],
    // offline.html y React usan estilos en línea; un estilo no ejecuta código.
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "blob:", "data:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'"],
    "worker-src": ["'self'"],
    "manifest-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"]
  };

  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
    .join("; ");
}

/**
 * La cámara y la geolocalización solo se permiten al propio origen
 * (src/lib/device/); el resto de las funciones sensibles quedan apagadas.
 */
export const PERMISSIONS_POLICY = [
  "camera=(self)",
  "geolocation=(self)",
  "microphone=()",
  "payment=()",
  "usb=()"
].join(", ");

export function buildSecurityHeaders(
  options: SecurityHeaderOptions
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Security-Policy": buildContentSecurityPolicy(options),
    // Las URL de detalle incluyen el id de la inspección: no salen del origen.
    "Referrer-Policy": "same-origin",
    "X-Content-Type-Options": "nosniff",
    // Respaldo de frame-ancestors para navegadores antiguos.
    "X-Frame-Options": "DENY",
    "Permissions-Policy": PERMISSIONS_POLICY,
    "Cross-Origin-Opener-Policy": "same-origin"
  };

  // Solo en producción: en desarrollo fijaría HTTPS para localhost en el navegador.
  if (!options.isDev) {
    headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains";
  }

  return headers;
}
