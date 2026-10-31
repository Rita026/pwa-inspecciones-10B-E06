# PWA de inspecciones de laboratorio — proyecto del equipo

Este es un proyecto acumulativo de la PWA de inspecciones de laboratorio.
`START_HERE.md` y `ACTIVIDAD-01.md` conservan las instrucciones de arranque de
la Semana 1. Las secciones de cada semana registran lo implementado después;
la entrega vigente es la Semana 8; su resumen de setup, ejecución, verificación
y evidencia está en «Semana 8 — Entrega» al final de este archivo.

## Entorno

Node.js 20.19 o posterior compatible, npm 10 o posterior, Git y cuenta de GitHub. No se requiere Make. Registren aquí las versiones usadas (`node --version`, `npm --version`) y cualquier dificultad de entorno que encuentren.

**Versiones usadas por el equipo:**
- Node.js: v24.16.0
- npm: 10.8.1
- Sistema operativo: Windows

**Dificultades de entorno en la Semana 1:** La instalación de entonces mostró
advertencias de dependencias; los resultados vigentes de Semana 5 se anotan
en su sección.

## Ejecución

```bash
npm ci
npm run dev
```

Abran `http://localhost:3000` y comprueben las tres inspecciones sintéticas. Detengan el servidor con Ctrl+C.

## Verificación

```bash
npm run verify
```

Ejecuta comprobación de archivos, prueba proporcionada, suite Jest y build; genera `reports/verification.json`. El reporte contiene resultados técnicos y documentos para revisión, no una calificación automática. `make verify` es equivalente.

GitHub Actions ejecuta la misma verificación y permite descargar el artefacto `starter-week-01-evidence`. El reporte local se excluye de Git: adjúntenlo en Classroom o descarguen el del SHA entregado desde Actions.

## Trabajo y entrega en equipo

Inviten a los integrantes y al docente al mismo repositorio privado. Cada persona registra su evidencia en una sección de `evidence/individual.md`. Todos entregan en Classroom el mismo SHA final y enlaces, identificando su sección. El formato exacto está en `ACTIVIDAD-01.md`; no se requiere un pull request adicional ni una copia por alumno.

## Estructura y límites

- `src/app/`: pantalla Next.js.
- `src/lib/data/`: inspecciones sintéticas.
- `docs/`: requisitos y decisión del equipo.
- `evidence/`: evidencia propia de cada integrante.
- `tests/`: prueba inicial proporcionada; no es una suite completa de comportamiento.

Registren aquí sus supuestos y limitaciones de ejecución.

**Supuestos y limitaciones:**
- Se asume que todos los integrantes del equipo cuentan con Node.js 20.19 o superior y npm 10 o superior instalados en su computadora.
- El proyecto fue probado únicamente en Windows; no se ha confirmado su funcionamiento en macOS o Linux.
- Los datos mostrados (las tres inspecciones) son sintéticos y están precargados en el código; no provienen de una base de datos ni de un servidor externo todavía.
- Durante la Semana 1 todavía no se implementaban manifest, service worker, modo offline, sincronización, notificaciones ni autenticación; las secciones siguientes registran los incrementos posteriores.

La observación anterior describe el starter de la Semana 1. No incluyan datos
personales reales en el producto, archivos `.env` ni credenciales. La
identificación académica de los integrantes se registra en
`evidence/individual.md`.


---------------------------------------------------------------------------------------------------

# Semana 2 — Shell instalable, manifest y estados

## Qué se agregó esta semana

- `src/components/app-shell.tsx` y cambios en `src/app/layout.tsx`: estructura de navegación general del shell instalable.
- `public/manifest.webmanifest` y `tests/manifest.spec.ts`: manifest de la PWA con nombre, íconos, display y su prueba correspondiente.
- `src/app/page.tsx`, `src/app/loading.tsx` y `src/app/error.tsx`: estados de carga, error y vacío para la página principal.

## Ejecución

```bash
npm ci
npm run dev
```

Abran `http://localhost:3000` para ver el estado normal con datos. Para probar los demás estados manualmente:

- Estado vacío: `http://localhost:3000/?estado=vacio`
- Estado de error: `http://localhost:3000/?estado=error`

También se agregó una navegación de demostración en la propia página ("Probar estados") con enlaces directos a estos tres casos, pensada para facilitar la verificación sin necesidad de escribir la URL manualmente.

## Supuestos

- Se simula una demora de red de 600 ms al obtener las inspecciones, ya que el proyecto todavía no se conecta a un servidor real; esto permite observar el estado de carga (`loading.tsx`) de forma consistente.
- Los estados de vacío y error se activan mediante un parámetro de URL (`?estado=vacio` o `?estado=error`) en lugar de depender de una condición de red real, dado que esta semana no se implementa aún la conexión a un backend ni el manejo de conectividad intermitente real.
- El estado de error se muestra mediante el archivo especial `error.tsx` de Next.js, que captura errores lanzados durante la carga de datos en la página.

## Verificación

```bash
npm run verify
```

El comando anterior comprueba la estructura, ejecuta las pruebas y compila la aplicación.
`npm run test:unit` permite correr Jest por separado e incluye la prueba del manifest (`tests/manifest.spec.ts`).

## Evidencia

Ver `evidence/individual.md`, sección "Semana 2 — Evidencia individual", con la contribución de cada integrante para esta semana.


-------------------------------------------------------------------------------------------------

# Semana 3 — Service Worker, caché y funcionamiento offline

## Qué se agregó esta semana

- `public/sw.js`: Service Worker que guarda en caché la página principal, el manifest y la página offline; borra cachés viejas al actualizar; y responde con contenido guardado cuando falla la red.
- `src/lib/pwa/register-service-worker.ts`: registro del Service Worker desde la aplicación.
- `docs/cache-strategy.md`: documento con la estrategia de caché elegida y sus trade-offs.
- `public/offline.html`: página de respaldo que se muestra cuando no hay conexión ni contenido guardado.
- `tests/offline.spec.ts` y `tests/service-worker.spec.ts`: pruebas del comportamiento del Service Worker y del fallback offline.

## Ejecución

```bash
npm ci
npm run dev
```

Abran `http://localhost:3000`. Para probar el comportamiento offline manualmente:

1. Abran las herramientas de desarrollador del navegador (F12)
2. Vayan a la pestaña "Application" (o "Aplicación")
3. En "Service Workers", confirmen que esté registrado y activo
4. Marquen la casilla "Offline" (o usen la pestaña "Network"/"Red" para simular sin conexión)
5. Recarguen la página: debería mostrarse el contenido guardado o, si no existe, la página `/offline.html`

## Supuestos

- Se usa una estrategia de caché con nombre versionado (`inspecciones-cache-v1`), de forma que al actualizar el Service Worker a una versión nueva, se eliminan automáticamente las cachés de versiones anteriores del proyecto.
- Solo se guarda en caché la página principal (`/`), el manifest (`/manifest.webmanifest`) y la página de respaldo (`/offline.html`); no se cachean otros recursos dinámicos en esta etapa.
- El Service Worker solo intercepta peticiones de **navegación** (cargar una página completa); otras peticiones (imágenes, scripts, etc.) se dejan pasar sin intervención por ahora.
- El comportamiento offline se probó únicamente en un entorno de desarrollo local; no se ha validado en un despliegue de producción.

## Verificación

```bash
npm run verify
```

El comando anterior comprueba la estructura, ejecuta las pruebas y compila la aplicación.
Las pruebas del Service Worker y del modo offline también pueden ejecutarse con Jest:

```bash
npm run test:unit
```

Ejecuta todas las pruebas unitarias del proyecto, incluyendo las de esta semana.

## Evidencia

Ver `evidence/individual.md`, sección "Semana 3 — Evidencia individual", con la contribución de cada integrante para esta semana.

# Semana 4 — Renderizado CSR y SSR

## Qué se agregó esta semana

Se compararon dos estrategias de renderizado para las pantallas de inspecciones:

* `/inspecciones`: listado implementado con SSR.
* `/inspecciones/[id]`: detalle implementado con CSR.

También se documentó la decisión técnica en `docs/rendering-decision.md` y se agregó `tests/rendering.spec.ts` para verificar las características principales de ambas implementaciones.

## Decisión de renderizado

El listado utiliza SSR porque obtiene las inspecciones mediante `getInspections()` en el servidor y está configurado con `dynamic = "force-dynamic"`.

El detalle utiliza CSR porque es un Client Component y obtiene la inspección mediante `fetch()` desde el navegador. También controla los estados de carga, éxito, error y registro no encontrado.

La comparación completa, incluyendo ventajas, desventajas, supuestos y limitaciones, está documentada en:

`docs/rendering-decision.md`

## Verificación

Para ejecutar las pruebas unitarias:

```bash
npm run test:unit
```

Para ejecutar la verificación general del proyecto:

```bash
npm run verify
```

La prueba específica de esta semana se encuentra en:

`tests/rendering.spec.ts`

## Limitaciones

La comparación utiliza las tres inspecciones sintéticas existentes en el proyecto. No representa una medición de rendimiento en producción ni utiliza una base de datos real.

La estrategia puede revisarse posteriormente si cambian los requisitos de actualización de datos, interactividad o fuente de información.

---

# Semana 5 — Persistencia local y sincronización idempotente

## Preparación y ejecución

Se requiere Node.js 20.19 o posterior y npm 10 o posterior. Desde la raíz del
repositorio:

```bash
npm ci
npm run dev
```

Abrir `http://localhost:3000`. En PowerShell, si la política de ejecución
bloquea `npm.ps1`, usar `npm.cmd ci` y `npm.cmd run dev`. La instalación limpia
usa las versiones fijadas en `package-lock.json`. La demostración y las pruebas
utilizan únicamente datos sintéticos.

En la ejecución de esta semana, `npm.cmd ci` terminó correctamente en Windows
con Node.js v24.11.1 y npm 10.9.2. Mostró dos avisos de auditoría de
dependencias (uno alto y uno crítico), sin bloquear la instalación. No se
actualizaron versiones mayores durante este incremento.

## Demostración visual

En la página principal, el panel de Semana 5 permite:

1. Crear una inspección sintética de prueba. Se guarda en IndexedDB con estado
   `pending`, incluso si la pestaña ya abierta pierde la conexión.
2. Consultar cuántas inspecciones locales siguen sin confirmación, incluidas
   las que hayan agotado los intentos de envío.
3. Iniciar la sincronización mediante un remitente simulado y observar el
   resultado y la nueva cuenta de pendientes.

El remitente simulado confirma el flujo sin enviar datos a un servidor. El
listado SSR de `/inspecciones` sigue mostrando los tres registros sintéticos
del arreglo original; no es una vista de la base local. La estructura de datos,
los estados, los reintentos, la regla de idempotencia requerida del servidor y
los límites se explican en [`docs/sync-policy.md`](docs/sync-policy.md).

## Pruebas y verificación

```bash
npm run test:unit
make verify
```

`npm run test:unit` ejecuta Jest, incluida `tests/sync.spec.ts` para la cola y
la política de conflictos. `make verify` ejecuta `npm run verify`, que verifica
los archivos obligatorios, la prueba del starter, toda la suite Jest y el build de producción; genera
`reports/verification.json`. En Windows sin Make, el equivalente exacto es
`npm.cmd run verify` (o `npm run verify` si PowerShell lo permite). El build
también puede ejecutarse por separado con `npm run build`.

El flujo de GitHub Actions de esta semana está en
`.github/workflows/week-05-w05-sync-data.yml`. Tras subir el commit, abrir la
pestaña **Actions** del repositorio y ejecutar ese flujo para el SHA de la
entrega mediante `workflow_dispatch`, o comprobar la ejecución que dispara el
`push`. Revisar que sus pasos de instalación, build, artefactos y prueba
terminen correctamente. Los checks públicos dan feedback; la evaluación final
se realiza sobre el SHA fijado.

## Evidencia y límites

Cada integrante anota su contribución, decisión técnica, prueba realmente
ejecutada, resultado, limitación y uso de IA en
[`evidence/individual.md`](evidence/individual.md), sección Semana 5. El SHA
final se obtiene con `git rev-parse HEAD` después del último commit y se
entrega junto con el enlace al flujo de Actions.

No existe aún un backend de escritura: el demo no prueba persistencia remota,
deduplicación en servidor ni conflictos entre dispositivos. El Service Worker
actual no precachea los paquetes JavaScript de Next.js, por lo que una recarga
completamente sin red puede perder la interacción del panel aunque el HTML de
inicio esté en caché. IndexedDB también está sujeto a la cuota y limpieza de
datos del navegador.

---

# Semana 6 — Notificaciones y UI de prueba (Enrique)

## Preparación y ejecución

Se mantienen los requisitos de Node.js y npm indicados arriba:

```bash
npm ci
npm run dev
```

En PowerShell, si se bloquea `npm.ps1`, usar `npm.cmd ci` y `npm.cmd run dev`.
Abrir `http://localhost:3000`. Para notificaciones se necesita HTTPS o localhost,
un navegador compatible y el Service Worker de la aplicación activo.

## Probar las notificaciones

En la portada, el panel **Notificaciones de prueba** permite:

1. Pulsar **Pedir permiso de notificaciones** y responder al diálogo. No se
   solicita autorización al cargar la página.
2. Si se concede el permiso, pulsar **Mostrar notificación de prueba**. Se envía
   un mensaje local sintético mediante el Service Worker existente.
3. Si se bloquea el permiso, consultar el aviso del panel y cambiarlo desde la
   configuración del sitio para volver a probar. Al recuperar el foco se
   actualiza el estado; también se puede recargar la página.

La aplicación presenta mensajes de fallback si falta soporte, el contexto no
es seguro, el Service Worker aún no está activo o falla una solicitud.
El permiso es opcional: las inspecciones pueden seguir usándose sin él.

El cliente está en [`src/lib/notifications/client.ts`](src/lib/notifications/client.ts)
y la UI en [`src/components/notifications-demo-panel.tsx`](src/components/notifications-demo-panel.tsx).
Las decisiones, estados, supuestos, límites y pasos de prueba están en la sección
de notificaciones de [`docs/capabilities.md`](docs/capabilities.md).

## Pruebas, verificación y evidencia

```bash
npm run test:unit -- --runInBand tests/capabilities.spec.ts tests/notifications-ssr.test.ts tests/notifications-demo-panel.test.tsx
make verify
```

En Windows sin Make, el equivalente exacto es `npm.cmd run verify`.
La primera orden ejecuta las 34 pruebas de notificaciones. `make verify`
comprueba los archivos obligatorios hasta Semana 6, ejecuta el starter y toda
la suite Jest y compila producción; genera `reports/verification.json`, que
también incluye el documento de capacidades para revisión.

`tests/capabilities.spec.ts` contiene la contribución de pruebas del cliente de
notificaciones; las suites separadas cubren SSR y UI. Estas pruebas simulan
las APIs y no comprueban cámara, geolocalización ni la presentación nativa del
aviso por el sistema operativo.

El workflow [Semana 6](.github/workflows/week-06-w06-device-push.yml) ejecuta
instalación limpia, build, revisión de artefactos, starter y las pruebas de
notificaciones en cada `push`, `pull_request` o ejecución manual. El workflow
general de Semana 1 también ejecuta `npm run verify` con todas las suites.
Consultar [GitHub Actions](https://github.com/Rita026/pwa-inspecciones-10B-E06/actions)
para el SHA final de la entrega. La evidencia de Enrique está en
[`evidence/individual.md`](evidence/individual.md), apartado Semana 6, e incluye
su decisión técnica, resultados reales, limitaciones y uso de IA.

Esta prueba no implementa avisos remotos ni programados. La aceptación de la
solicitud no garantiza un aviso visible si el sistema tiene las notificaciones
bloqueadas o está en modo No molestar. Sigue pendiente la comprobación humana
del aviso nativo con permiso concedido.

---

# Semana 8 — Pruebas de la cola (integración y unitarias)

## Qué se agregó en esta parte

- `tests/integration/sync-flow.test.ts`: una inspección guardada sin conexión sigue pendiente tras simular recarga (`jest.resetModules` + IndexedDB).
- `tests/integration/sync-idempotency.test.ts`: sincronizar dos veces la misma operación no reenvía ni deja pendientes.
- `tests/unit/queue.spec.ts`: reglas de la cola (paso a `synced` y agotamiento de reintentos / `skipped`).

## Cómo ejecutarlas

```bash
npm ci
npx jest tests/unit tests/integration
```

---

# Semana 8 — Pruebas E2E con Playwright y workflow de evaluación

## Qué se agregó en esta parte

- `tests/e2e/inspection-flow.spec.ts`: pruebas en Chromium real contra el build de producción.
  - **Flujo completo:** se llena el formulario sin conexión (`context.setOffline`), se guarda en IndexedDB, se recarga la app y la captura sigue pendiente con el mismo `localId`; después «Simular sincronización» la confirma (`synced`, `serverId = demo-<localId>`) y ya no queda nada por reenviar.
  - **Validación:** datos inválidos muestran los errores de cada campo y no se guarda nada.
  - **Permiso concedido:** las coordenadas del navegador se guardan con la inspección.
  - **Variante con permiso negado:** el navegador rechaza la geolocalización, el formulario muestra «Permiso denegado…» y la inspección se guarda y sincroniza sin coordenadas.
- `playwright.config.ts`: levanta `next start` en `127.0.0.1:3100` y guarda trazas y capturas sólo cuando una prueba falla.
- `.github/workflows/academic-evaluation.yml`: en cada push/PR ejecuta instalación limpia, artefactos de la semana, lint, typecheck, starter + Jest, build y E2E, y sube `playwright-report/` y `test-results/` como artefacto.

## Cómo ejecutarlas

```bash
npm ci
npx playwright install chromium
npm run test:e2e:build   # build de producción + E2E
# o, si ya existe el build:
npm run test:e2e
```

---

# Semana 8 — Entrega: setup, ejecución, verificación y evidencia

Pirámide de pruebas del flujo crítico (capturar sin conexión, conservar tras
recargar y sincronizar una sola vez) automatizada en GitHub Actions. Sólo se
usan datos sintéticos. El detalle de cada nivel, las decisiones, los supuestos,
los límites y los fallos encontrados está en
[`docs/test-strategy.md`](docs/test-strategy.md).

## Entregables

| Entregable | Ruta |
|---|---|
| Pruebas unitarias | [`tests/unit/`](tests/unit/) y suites de componentes y validación en `tests/` |
| Pruebas de integración | [`tests/integration/`](tests/integration/) |
| Pruebas E2E | [`tests/e2e/`](tests/e2e/) y [`playwright.config.ts`](playwright.config.ts) |
| Estrategia de pruebas | [`docs/test-strategy.md`](docs/test-strategy.md) |
| Workflow de CI | [`.github/workflows/academic-evaluation.yml`](.github/workflows/academic-evaluation.yml) |
| Evidencia individual | [`evidence/individual.md`](evidence/individual.md), apartado «Semana 8» |

## Setup

Requisitos: Node.js 20 o posterior (el CI usa Node 20; en local se probó con
Node v22.22.0 y v24.21.0), npm, Git y, para E2E, Chromium de Playwright.

```bash
npm ci
npx playwright install chromium   # sólo una vez, para las E2E
```

## Ejecución

```bash
npm run dev        # desarrollo en http://localhost:3000
npm run build && npm run start   # producción
```

## Verificación

```bash
make verify                        # equivale a: npm run verify
npm run lint
npm run typecheck
npm test                           # prueba del starter
npm run test:unit -- --runInBand   # unitarias + integración (Jest)
npm run test:e2e:build             # build de producción + E2E (Playwright)
```

En Windows sin Make, el equivalente exacto de `make verify` es
`npm.cmd run verify`. `make verify` comprueba la estructura, ejecuta el starter,
toda la suite Jest, lint, typecheck y build, y genera
`reports/verification.json`. Las E2E se ejecutan aparte con
`npm run test:e2e:build` y en el workflow.

Resultados observados en `main` (commit `38810e9`):

| Comprobación | Resultado |
|---|---|
| `npm run lint` | Sin advertencias ni errores |
| `npm run typecheck` | Sin errores |
| `npm test` | `starter.spec.mjs: PASS` |
| `npm run test:unit -- --runInBand` | 16 suites y 78 pruebas aprobadas |
| `npm run build` | Compilación de producción correcta |
| `npx playwright test` | 4 de 4 aprobadas |
| GitHub Actions | [Academic Evaluation en verde](https://github.com/Rita026/pwa-inspecciones-10B-E06/actions/runs/40263154007) y workflows de semanas 1 a 6 en verde |

## Evidencia

Cada integrante registra en [`evidence/individual.md`](evidence/individual.md),
apartado «Semana 8», su commit SHA, decisión técnica, prueba ejecutada,
resultado observado, limitación y uso declarado de IA. El equipo entrega en
Classroom el mismo SHA final y el enlace a su ejecución de Actions.

## Límites

- La sincronización usa un receptor simulado; no hay servidor real.
- Las E2E sólo cubren Chromium de escritorio.
- La validación de fecha usa UTC y puede rechazar fechas válidas en zonas
  horarias adelantadas; queda documentado como fallo pendiente en
  `docs/test-strategy.md`.


# Semana 9 — Privacidad y minimización de datos

La PWA utiliza datos sintéticos para las demostraciones académicas. Los registros de inspección pueden incluir ubicación del laboratorio, fecha, nombre del inspector, observaciones y coordenadas GPS opcionales.

Para reducir la exposición de información, la utilidad `toPrivacySafeSummary` de `src/lib/security/privacy.ts` genera resúmenes que contienen únicamente el estado de la inspección y el número de hallazgos. La función no modifica los registros originales.

Se recomienda recopilar únicamente los datos necesarios, evitar la exposición de coordenadas y nombres en registros técnicos, y definir reglas de conservación y eliminación de datos.

El archivo `public/robots.txt` solicita a los rastreadores web que no rastreen el sitio. Esta instrucción no sustituye los controles de acceso ni garantiza la privacidad de la información.

La utilidad debe utilizarse en los puntos donde se necesiten resúmenes; su existencia por sí sola no significa que toda la aplicación ya aplique minimización de datos.

---

## Cabeceras de seguridad (CSP) y verificación (Enrique)

## Qué se agregó en esta parte

| Archivo | Qué hace |
|---|---|
| [`src/lib/security/headers.ts`](src/lib/security/headers.ts) | Construye la CSP con nonce y las demás cabeceras de seguridad. |
| [`src/middleware.ts`](src/middleware.ts) | Genera un nonce por petición y aplica las cabeceras a páginas, API, `sw.js`, manifest y `offline.html`. |
| `src/app/layout.tsx` | `dynamic = "force-dynamic"`: cada página se renderiza por petición para llevar su nonce. |
| `next.config.mjs` | `poweredByHeader: false`: deja de enviar `X-Powered-By: Next.js`. |
| [`tests/security.spec.ts`](tests/security.spec.ts) | Jest: reglas de la CSP y de las cabeceras, el middleware y las credenciales fuera del repositorio. |
| [`tests/e2e/security-headers.spec.ts`](tests/e2e/security-headers.spec.ts) | Playwright: cabeceras reales del build de producción y la app funcionando bajo la CSP. |
| [`.github/workflows/academic-evaluation.yml`](.github/workflows/academic-evaluation.yml) | Paso AC-04 de seguridad y E2E de cabeceras en cada push y pull request. |

## Cabeceras que envía la aplicación

| Cabecera | Valor | Para qué |
|---|---|---|
| `Content-Security-Policy` | `script-src 'self' 'nonce-…' 'strict-dynamic'`; `object-src 'none'`; `frame-ancestors 'none'`; `base-uri`, `form-action`, `connect-src`, `worker-src` y `manifest-src` en `'self'` | Un script inyectado sin el nonce de la respuesta no se ejecuta; no se admite ningún origen externo. |
| `X-Content-Type-Options` | `nosniff` | El navegador no adivina el tipo de un archivo. |
| `X-Frame-Options` | `DENY` | Respaldo de `frame-ancestors` contra clickjacking en navegadores antiguos. |
| `Referrer-Policy` | `same-origin` | Las URL de detalle, que llevan el id de la inspección, no se envían a otros sitios. |
| `Permissions-Policy` | `camera=(self), geolocation=(self), microphone=(), payment=(), usb=()` | Cámara y ubicación solo para la propia app (`src/lib/device/`); lo demás queda apagado. |
| `Cross-Origin-Opener-Policy` | `same-origin` | Aísla la ventana de páginas de otro origen que la abran. |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | Solo en producción; el navegador lo aplica únicamente bajo HTTPS. |

## Decisión: nonce por petición en el middleware

Next.js 14 inserta `<script>` en línea en cada página. Había dos caminos: una
CSP fija en `next.config.mjs` con `'unsafe-inline'` en `script-src`, o un nonce
distinto en cada respuesta. Con `'unsafe-inline'` la CSP casi no frena un XSS,
porque cualquier `<script>` inyectado también se ejecutaría. Se eligió el
nonce: el middleware lo genera con `crypto.getRandomValues` (128 bits), lo pone
en la CSP de la respuesta y en la de la petición, y Next.js lo toma de ahí y lo
agrega a sus propios scripts. `'strict-dynamic'` permite los chunks que esos
scripts cargan después; `'self'` queda solo como respaldo para navegadores sin
CSP nivel 3.

Costo: ninguna página puede prerenderarse en el build, porque un HTML estático
no tendría el nonce. Por eso el layout fuerza el render dinámico. Antes solo
`/_not-found` era estática; las demás rutas ya eran dinámicas.

Otras decisiones:

- `style-src` conserva `'unsafe-inline'` porque `public/offline.html` usa un
  `<style>` en línea; un estilo no ejecuta código.
- En `next dev` se agrega `'unsafe-eval'` (lo necesita React Refresh) y no se
  envía HSTS, para no fijar HTTPS en `localhost`.
- El Service Worker guarda `/` con sus cabeceras. Sin red entrega el mismo HTML
  y la misma CSP, con el mismo nonce, así que la página guardada sigue
  funcionando.

## Credenciales fuera del repositorio

`tests/security.spec.ts` revisa los archivos versionados y los nuevos que Git
no ignora, es decir, lo que subiría un `git add .`:

- ningún `.env` puede subirse, y Git ignora `.env`, `.env.local` y
  `.env.production.local`, pero no `.env.example`;
- ningún archivo contiene credenciales con formato conocido: claves privadas
  PEM y claves o credenciales de AWS, GitHub, Google Cloud, Stripe (modo live),
  Slack, JWT firmados y URL con usuario y contraseña. Un caso de control con
  muestras sintéticas, armadas al ejecutar, comprueba que el detector sí las
  reconoce;
- el código no usa variables `NEXT_PUBLIC_`, que Next.js copia al JavaScript
  que descarga el navegador.

## Cómo verificar

```bash
npm ci
npm run test:security              # 32 pruebas: CSP, cabeceras, middleware y credenciales
npm run build
npx playwright install chromium    # solo la primera vez
npx playwright test                # 14 E2E: flujo de inspección + cabeceras de seguridad
npm run verify                     # estructura, starter, Jest, lint, tipos y build
```

En Windows sin Make, `npm.cmd run verify` es el equivalente de `make verify`.
Para revisar las cabeceras a mano con el build de producción:

```bash
npm run build
npm run start
curl -I http://localhost:3000/     # en PowerShell: curl.exe -I http://localhost:3000/
```

En el navegador: DevTools → Network → documento `/` → Response Headers. En la
consola no debe aparecer ningún mensaje de «Content Security Policy».

### Qué observa cada prueba

| Prueba | Observa | Queda fuera |
|---|---|---|
| `tests/security.spec.ts` (Jest) | La CSP generada: sin `'unsafe-inline'` ni `'unsafe-eval'` en los scripts de producción, sin orígenes externos, con nonce aleatorio y validado. Las demás cabeceras, que el middleware las aplica y entrega a Next.js el mismo nonce, y las credenciales. | Lo que recibe realmente un navegador. |
| `tests/e2e/security-headers.spec.ts` (Playwright) | Con `next start`: cabeceras en `/`, `/inspecciones`, el detalle, la API, `sw.js`, el manifest y `offline.html`; cada `<script>` del HTML con el nonce de su respuesta; la app se hidrata, registra el Service Worker y consulta la API sin violaciones de CSP; un `<script>` inyectado en el HTML sin nonce no se ejecuta y uno con el nonce sí (control). | Firefox, Safari y móviles; HSTS con HTTPS real. |
| `tests/e2e/inspection-flow.spec.ts` | El flujo de la semana 8 (sin conexión, IndexedDB, sincronización y ubicación concedida o negada) sigue pasando bajo la CSP. | Lo indicado en la semana 8. |

### Workflow

`.github/workflows/academic-evaluation.yml` corre en cada push y pull request:
instalación limpia, artefactos (incluye los de esta parte), lint y tipos,
starter y Jest, **AC-04 Seguridad** (`npm run test:security`), build y
**AC-06 E2E** (incluye las cabeceras). Ningún paso usa `continue-on-error` ni
credenciales, y sube `playwright-report/` y `test-results/` en el artefacto
`academic-evidence-e2e-seguridad`. La existencia de los cinco artefactos del
equipo para esta semana la revisa el workflow del docente
`week-09-w09-security-privacy.yml` (AC-02).

### Resultados observados

Rama `feat/enrique-seguridad-semana-09`, Windows, Node.js v24.21.0:

| Comprobación | Resultado |
|---|---|
| `npm run verify` | `pass`: estructura, starter, Jest (17 suites y 110 pruebas), lint, tipos y build |
| `npm run test:security` | 32 de 32 aprobadas |
| `CI=true npx playwright test` | 14 de 14 aprobadas |
| `npx playwright test --repeat-each=3` | 42 de 42 aprobadas |
| Defecto: `'unsafe-inline'` en `script-src` | Fallan 2 pruebas de Jest |
| Defecto: archivo nuevo con una clave de AWS falsa | Falla el escaneo e indica `archivo:línea` |
| Defecto: el middleware no envía la CSP | Fallan 9 de las 10 E2E de cabeceras |
| Defecto: `geolocation=()` en `Permissions-Policy` | Fallan 1 prueba de Jest y la E2E de ubicación concedida |

Cada defecto se introdujo de forma temporal y se restauró antes de continuar.

## Límites

- La CSP se comprobó en Chromium de escritorio; no en Firefox, Safari ni en
  dispositivos móviles.
- HSTS solo tiene efecto con HTTPS y las pruebas corren en `http://127.0.0.1`.
  No se agregó `upgrade-insecure-requests`: la app no carga recursos de otros
  orígenes y se prueba en http local.
- `style-src` admite estilos en línea.
- Los archivos de `/_next/static` no pasan por el middleware (llevan hash en el
  nombre y no son HTML), así que no llevan estas cabeceras.
- La API `/api/inspecciones/[id]` no tiene autenticación; las cabeceras no la
  sustituyen.
- El escaneo reconoce credenciales con un formato conocido; un valor sin
  prefijo reconocible no lo detecta.
- La búsqueda por palabras de `public-tests/check.sh` (línea 5) ya fallaba en
  `develop` antes de esta parte, porque coincide con nombres de dependencias en
  `package-lock.json` y con palabras en español de la documentación. Por eso
  `tests/security.spec.ts` busca formatos de credenciales y no palabras. Los
  archivos de esta parte no agregan coincidencias a esa búsqueda.

  ## Modelo de amenazas

El análisis de activos, amenazas y controles está en [`docs/threat-model.md`](docs/threat-model.md).
Se alinea con el inventario de privacidad, las cabeceras CSP y las pruebas en `tests/security.spec.ts`.
