# PWA de inspecciones de laboratorio — proyecto del equipo

Comiencen por `START_HERE.md` y lean `ACTIVIDAD-01.md`. Este es un proyecto acumulativo: un repositorio privado por equipo durante el curso. La Semana 1 consiste en arrancar, documentar y explicar la verificación; no en implementar toda la PWA.

## Entorno

Node.js 20.19 o posterior compatible, npm 10 o posterior, Git y cuenta de GitHub. No se requiere Make. Registren aquí las versiones usadas (`node --version`, `npm --version`) y cualquier dificultad de entorno que encuentren.

**Versiones usadas por el equipo:**
- Node.js: v24.16.0
- npm: 10.8.1
- Sistema operativo: Windows

**Dificultades de entorno encontradas:** Ninguna. La instalación con `npm ci` mostró 2 advertencias de vulnerabilidades de severidad alta en dependencias del starter, pero no afectaron la instalación ni ejecución del proyecto.

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

Ejecuta comprobación de archivos, prueba proporcionada y build; genera `reports/verification.json`. El reporte contiene resultados técnicos y documentos para revisión, no una calificación automática. `make verify` es equivalente. `bash public-tests/check.sh` es un check opcional de estructura.

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
- Como indica la actividad, esta semana no se implementa manifest, service worker, modo offline, sincronización, notificaciones ni autenticación; esas funciones se agregarán en semanas posteriores.

El starter todavía no implementa instalación PWA, offline ni sincronización. No incluyan datos personales reales en el producto, archivos `.env` ni credenciales. La identificación de integrantes se conserva en el repositorio privado y Classroom.


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

o bien:

```bash
bash public-tests/check.sh
```

Ambos comandos revisan que existan los archivos obligatorios de esta semana (`public/manifest.webmanifest`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/app-shell.tsx`, `tests/manifest.spec.ts`) y que el proyecto compile correctamente.

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

o bien:

```bash
bash public-tests/check.sh
```

Ambos comandos revisan que existan los archivos obligatorios de esta semana (`public/sw.js`, `src/lib/pwa/register-service-worker.ts`, `docs/cache-strategy.md`, `tests/service-worker.spec.ts`, `tests/offline.spec.ts`) y que el proyecto compile correctamente.

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
