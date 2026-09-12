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

- `src/components/app-shell.tsx` y cambios en `src/app/layout.tsx`: estructura de navegación general del shell instalable (a cargo de otro integrante del equipo).
- `public/manifest.webmanifest` y `tests/manifest.spec.ts`: manifest de la PWA con nombre, íconos, display y su prueba correspondiente (a cargo de otro integrante del equipo).
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

