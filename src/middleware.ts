import { NextResponse, type NextRequest } from "next/server";
import {
  NONCE_HEADER,
  buildSecurityHeaders,
  createNonce
} from "./lib/security/headers";

export function middleware(request: NextRequest) {
  const nonce = createNonce();
  const securityHeaders = buildSecurityHeaders({
    nonce,
    isDev: process.env.NODE_ENV === "development"
  });

  // Next.js lee el nonce de la CSP de la petición y lo agrega a sus <script>.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(NONCE_HEADER, nonce);
  requestHeaders.set(
    "Content-Security-Policy",
    securityHeaders["Content-Security-Policy"]
  );

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  for (const [name, value] of Object.entries(securityHeaders)) {
    response.headers.set(name, value);
  }
  return response;
}

export const config = {
  // Los archivos de _next/static llevan hash en el nombre y no son HTML.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
