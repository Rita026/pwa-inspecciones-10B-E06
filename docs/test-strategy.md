# Estrategia de pruebas

## Objetivo

Verificar que el formulario de registro de inspecciones valide los datos antes de guardarlos, que las inspecciones se almacenen localmente y que la ubicación del dispositivo sea opcional.

## Pirámide de pruebas y CI (semana 8)

El flujo crítico es: capturar una inspección válida, guardarla sin conexión en IndexedDB, conservarla tras recargar y sincronizarla una sola vez. Cada nivel prueba una parte distinta de ese flujo; los niveles bajos son muchos y rápidos y el nivel alto es poco y caro.

| Nivel | Dónde | Qué cubre | Herramienta | Resultado observado |
|---|---|---|---|---|
| Unitario | `tests/unit/queue.spec.ts`, `tests/inspection-validation.test.ts` y suites de componentes en `tests/` | Reglas puras: validación del formulario, paso a `synced`, agotamiento de reintentos (`MAX_RETRIES` → `skipped`), componentes y SSR | Jest + jsdom | Dentro de 16 suites y 78 pruebas aprobadas |
| Integración | `tests/integration/sync-flow.test.ts`, `tests/integration/sync-idempotency.test.ts` | Cola real sobre IndexedDB (`fake-indexeddb`): persistencia tras simular recarga (`jest.resetModules`) y que una segunda sincronización no reenvía | Jest (entorno node) | 2 de 2 aprobadas |
| E2E | `tests/e2e/inspection-flow.spec.ts` | Flujo completo desde la interfaz en Chromium real contra el build de producción, con red cortada y permiso de ubicación concedido o negado | Playwright | 4 de 4 aprobadas; 12 de 12 con `--repeat-each=3` |

Comando local de las pruebas unitarias y de integración relacionadas con la semana: `npx jest --runInBand tests/unit tests/integration tests/inspection-validation.test.ts` → 4 suites y 12 pruebas aprobadas. Toda la suite Jest (`npm run test:unit -- --runInBand`) → 16 suites y 78 pruebas aprobadas.

**Por qué E2E corre contra el build de producción:** el Service Worker, IndexedDB y el permiso de geolocalización son los del navegador real; con `next dev` el comportamiento de caché y del Service Worker es distinto. El costo es que hay que compilar antes (`npm run test:e2e:build`) y que las E2E tardan más, por eso sólo cubren el flujo crítico y su variante con permiso negado.

### Integración continua

`.github/workflows/academic-evaluation.yml` corre en cada `push`, `pull_request` y de forma manual, con `set -euo pipefail` y sin `continue-on-error`, para que ningún fallo quede oculto:

1. Instalación limpia: `npm ci`.
2. AC-01: comprueba que existan los artefactos de la semana.
3. AC-02: `npm run lint` y `npm run typecheck`.
4. AC-03: `npm test` (starter) y `npm run test:unit -- --runInBand` (unitarias e integración).
5. AC-04: `npm run build`.
6. AC-05: instala Chromium y ejecuta `npx playwright test`.
7. Sube `playwright-report/` y `test-results/` como artefacto aunque algo falle.

Ejecución en verde sobre `main` (commit `38810e9`): [Academic Evaluation](https://github.com/Rita026/pwa-inspecciones-10B-E06/actions/runs/40263154007). En el mismo commit también pasan los workflows de las semanas 1 a 6.

## Pruebas unitarias de validación

La función `validateInspectionForm` se prueba con los siguientes casos:

- Formulario válido.
- Campos obligatorios vacíos o con espacios.
- Fecha inexistente.
- Número de hallazgos negativo, decimal, vacío o no numérico.
- Cero hallazgos, que es un valor válido.

**Resultado observado:** las pruebas unitarias se ejecutaron correctamente. La suite `tests/inspection-validation.test.ts` pasó.

## Pruebas de integración y almacenamiento

El formulario utiliza `queueInspection` para guardar registros en IndexedDB. Una inspección válida debe guardarse localmente y quedar pendiente de sincronización.

La sincronización existente utiliza un receptor simulado. Por lo tanto, las pruebas no demuestran que exista un servidor real ni que los datos se hayan transmitido a un servidor remoto.

**Resultado observado:** las pruebas de Jest terminaron con 16 suites aprobadas y 78 pruebas exitosas.

## Ubicación opcional

La ubicación se solicita únicamente cuando la persona pulsa el botón correspondiente.

Se consideran los siguientes escenarios:

- El dispositivo concede el permiso.
- La persona deniega el permiso.
- El navegador no admite geolocalización.
- Se produce un error al consultar la ubicación.
- Se guarda una inspección sin coordenadas.

La inspección debe poder guardarse con los demás datos válidos aunque no se obtengan coordenadas.

**Resultado observado en la prueba manual:** se guardó una inspección sin solicitar la ubicación del dispositivo. Esto confirma que obtener la ubicación no es un requisito para guardar el registro. No se considera comprobado mediante esta prueba que se haya denegado explícitamente el permiso.

## Herramientas y comandos

| Comando | Resultado |
|---|---|
| `npm.cmd run test:unit -- --runInBand` | Correcto: 16 suites y 78 pruebas aprobadas. |
| `npm.cmd run typecheck` | Correcto: finalizó sin errores de TypeScript. |
| `npm.cmd run build` | Correcto: la compilación de producción finalizó exitosamente. |

## Limitaciones

- La ubicación depende de los permisos del usuario, del navegador y del dispositivo.
- El guardado local no demuestra que una inspección se haya sincronizado con un servidor real.
- Los resultados corresponden a la ejecución realizada durante el desarrollo y pueden cambiar si se modifica el código o la configuración.

## Pruebas E2E con Playwright (semana 8)

Archivo: `tests/e2e/inspection-flow.spec.ts`. Se ejecutan en Chromium contra el build de producción (`npm run test:e2e:build`) y en el workflow `.github/workflows/academic-evaluation.yml`.

| Caso | Qué hace la prueba | Qué comprueba |
|---|---|---|
| Datos inválidos | Envía el formulario vacío con hallazgos `-1`. | Se muestran los errores de cada campo, `aria-invalid` y no se guarda ningún registro en IndexedDB. |
| Flujo completo sin conexión | Corta la red, llena y guarda; recarga con red; pulsa «Simular sincronización». | El registro queda `pending` con todos sus campos, conserva el mismo `localId` tras recargar y pasa a `synced` una sola vez; el botón de sincronizar queda deshabilitado. |
| Permiso concedido | Concede geolocalización con coordenadas ficticias. | El formulario muestra las coordenadas y se guardan en el registro. |
| Permiso negado | No concede el permiso; Chromium responde `PERMISSION_DENIED`. | Se muestra «Permiso denegado…», no aparecen coordenadas, el botón sigue disponible y la inspección se guarda y sincroniza sin `coordinates`. |

**Resultado observado:** 4 pruebas aprobadas; 12 de 12 al repetir cada una 3 veces. Al hacer temporalmente que el formulario exigiera coordenadas, fallaron el flujo completo y la variante con permiso negado; al restaurar el código volvieron a pasar.

**Límites:** la sincronización usa el receptor simulado de la app, no un servidor real. Sólo se prueba Chromium; la denegación del permiso es la del navegador automatizado, no la de un dispositivo físico. El contador de pendientes no se actualiza solo al guardar desde el formulario: la prueba pulsa «Actualizar contador».

## Supuestos

- Sólo se usan datos sintéticos; no hay cuentas, tokens ni datos personales.
- El receptor de sincronización es simulado y trata `localId` como clave de idempotencia. Sin esa garantía en un servidor real no habría deduplicación remota.
- Un registro en `syncing` al cerrarse la pestaña se vuelve a intentar con el mismo `localId`.
- La geolocalización es opcional: una inspección válida se guarda aunque se niegue el permiso.

## Fallos encontrados

| Fallo | Cómo se detectó | Resultado | Estado |
|---|---|---|---|
| Marcar `pending` en lugar de `synced` tras un envío correcto (defecto controlado, Rita) | `npx jest tests/integration/sync-idempotency.test.ts` con el código modificado en una rama temporal | La prueba falló con `Expected: 0, Received: 1` en la segunda sincronización; al restaurar volvió a pasar | Restaurado; demuestra que la prueba detecta la regresión |
| Exigir coordenadas para guardar (defecto controlado, Enrique) | `npx playwright test` tras reconstruir con el cambio | Fallaron el flujo completo y la variante con permiso negado; la de permiso concedido siguió pasando | Restaurado; demuestra que las E2E detectan la regresión |
| La validación de fecha compara contra `toISOString()` (UTC) | Revisión del código de `src/lib/inspections/validation.ts` | En zonas adelantadas a UTC (por ejemplo Tokio o Madrid) se rechazan fechas válidas; la fecha por defecto del formulario propone el día siguiente después de las 18:00 en México | Pendiente; límite conocido |
| Playwright fijado en 1.64.1 y un Chromium de otra versión instalado | `npx playwright test` en un entorno sin el navegador correcto | `browserType.launch: Executable doesn't exist`; no es un fallo de la app | Se resuelve con `npx playwright install chromium`; el workflow ya lo hace |
