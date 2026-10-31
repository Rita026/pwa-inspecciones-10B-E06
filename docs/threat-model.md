# Modelo de amenazas — PWA de inspecciones de laboratorios

## 1. Alcance y supuestos

- Aplicación: PWA Next.js para registrar inspecciones de mantenimiento de laboratorios (datos **sintéticos**).
- Contexto: sujeto obligado mexicano; se documentan controles de seguridad y privacidad aunque el demo no trate datos personales reales.
- Componentes en alcance: UI y formulario, validación de entradas, IndexedDB (cola local), Service Worker, permisos de cámara y geolocalización, cabeceras HTTP/CSP, sincronización simulada.
- Fuera de alcance de este incremento: autenticación real de usuarios, backend de producción con autorización, cifrado de disco del dispositivo.

## 2. Activos

| ID | Activo | Dónde vive |
|----|--------|------------|
| A1 | Datos de inspección (location, date, inspector, status, findings, summary) | IndexedDB (`inspecciones-db`), UI |
| A2 | Coordenadas GPS opcionales | Formulario / IndexedDB |
| A3 | Metadatos de sync (`localId`, `serverId`, `syncStatus`, `retryCount`) | IndexedDB, cola de sync |
| A4 | Service Worker y caché de assets | `public/sw.js`, caché del navegador |
| A5 | Integridad de scripts y UI | Cliente; controlado por CSP |
| A6 | Permisos de dispositivo (cámara, geolocalización) | APIs del navegador + Permissions-Policy |

## 3. Amenazas y controles

| ID | Amenaza | Activos | Control implementado / documentado |
|----|---------|---------|-------------------------------------|
| T1 | XSS vía campos de texto (summary, location, inspector) | A1, A5 | Validación de entradas (`src/lib/inspections/validation.ts`); CSP con nonce por petición (`src/lib/security/headers.ts` + middleware): scripts solo con nonce, sin `'unsafe-inline'` en producción |
| T2 | Inyección de script o plugin de terceros | A5 | `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, orígenes de script/connect limitados a `'self'` |
| T3 | Clickjacking | A5 | `frame-ancestors 'none'` y `X-Frame-Options: DENY` |
| T4 | Abuso de permisos del dispositivo | A6 | `Permissions-Policy`: cámara y geolocalización solo `(self)`; micrófono, payment y usb denegados |
| T5 | Filtración de datos en logs o resúmenes públicos | A1, A2, A3 | `toPrivacySafeSummary` (`src/lib/security/privacy.ts`): solo `status` y `findings`; inventario en `docs/privacy-data-inventory.md` |
| T6 | Indexación o rastreo indebido del sitio | A1 | `public/robots.txt` (`Disallow: /`). No sustituye autenticación |
| T7 | Acceso físico o mismo perfil de navegador a IndexedDB | A1–A3 | Minimización; no usar PII real en el demo; datos quedan en el origen del navegador (límite residual) |
| T8 | Service Worker o caché comprometidos / MITM | A4 | Despliegue esperado bajo HTTPS; HSTS en producción; SW de scope propio |
| T9 | Secretos o tokens en el repositorio | — | Política de no secretos; pruebas en `tests/security.spec.ts` que buscan formatos de credenciales y prohíben subir `.env` |
| T10 | Envío del Referer con IDs de inspección a terceros | A3 | `Referrer-Policy: same-origin` |

## 4. Controles por capa

### Entradas
- Formulario de inspección con validación que rechaza datos inválidos antes de persistir.
- Coordenadas opcionales: la app no bloquea si el permiso se niega.

### Transporte y cabeceras
- CSP con nonce criptográfico por petición y `'strict-dynamic'`.
- `X-Content-Type-Options: nosniff`, `Cross-Origin-Opener-Policy: same-origin`.
- HSTS solo en producción (no en `next dev`).
- `poweredByHeader: false` en Next.js.

### Almacenamiento y privacidad
- IndexedDB local para operación offline.
- Inventario de datos y minimización documentados.
- Resumen seguro sin nombres, coords ni IDs de sync.

### Verificación
- `tests/security.spec.ts`: CSP, cabeceras, middleware, ausencia de credenciales en el árbol versionado.
- E2E de cabeceras (Playwright) en el trabajo de seguridad de la semana.
- `public-tests/check.sh` y workflow de feedback de semana 9.

## 5. Residuos y límites

1. Quien tenga acceso al perfil del navegador puede leer IndexedDB del origen; no hay cifrado a nivel aplicación.
2. La API demo de inspecciones no implementa autenticación ni autorización de servidor.
3. `robots.txt` es una petición a rastreadores, no un control de acceso.
4. `style-src` admite `'unsafe-inline'` por estilos del shell/`offline.html` (no ejecuta código como un script).
5. La sincronización es simulada; la idempotencia y los reintentos se probaron en semanas anteriores, no sustituyen un backend endurecido.
6. HSTS y HTTPS real dependen del despliegue; en local no se fuerza HSTS.

## 6. Decisiones y trade-offs

| Decisión | Motivo | Costo |
|----------|--------|-------|
| CSP con nonce + `strict-dynamic` en lugar de `'unsafe-inline'` en scripts | Reduce XSS reflejado/almacenado en campos de texto | Layout en `force-dynamic`; más acoplamiento al middleware |
| Permissions-Policy solo camera/geolocation en `self` | Mínimo privilegio respecto a lo que usa la PWA | Cualquier feature nueva de sensor exige actualizar la política |
| Minimización en proyección (`toPrivacySafeSummary`) y no borrando el registro | Conserva la inspección completa para la cola offline | Hay que usar la función en los puntos de salida (logs/reportes) |
| Datos sintéticos en el repo | Cumple la actividad sin PII real | No demuestra por sí solo el tratamiento de datos reales |

## 7. Relación con otros documentos

- Inventario y finalidades: `docs/privacy-data-inventory.md`
- Estrategia de pruebas (incl. regresión de seguridad): `docs/test-strategy.md` y `tests/security.spec.ts`
- Política de sync e idempotencia: `docs/sync-policy.md`