# Semana 5: persistencia local y política de sincronización

## Alcance y supuestos

La aplicación usa únicamente inspecciones sintéticas. Esta entrega permite guardar
una inspección en el navegador y recorrer la cola mediante un `SyncSender` inyectado.
El panel de demostración usa un remitente simulado; el proyecto todavía no tiene
un endpoint que reciba inspecciones, autenticación ni una base de datos remota.
Por ello, el estado `synced` del demo indica que el remitente simulado confirmó
el envío, no que exista una copia en un servidor real.

La sincronización se inicia explícitamente desde la interfaz o al llamar
`syncPendingInspections(send)`. No se presupone Background Sync, envío automático
al recuperar la conexión ni ejecución mientras la página está cerrada.

## Almacenamiento local

`src/lib/storage/schema.ts` abre una base IndexedDB llamada `inspecciones-db`,
versión 1, con el almacén `inspections`. La clave primaria es `localId` y el
índice `by-sync-status` permite consultar registros por estado. IndexedDB
conserva las inspecciones entre recargas dentro del mismo origen y perfil del
navegador. La persistencia depende de que el navegador no borre los datos del
sitio y de que haya espacio disponible; una escritura puede fallar, por ejemplo,
por cuota o por bloqueo de almacenamiento.

Cada registro contiene los datos de la inspección (`location`, `date`,
`inspector`, `status`, `statusLabel`, `findings`, `summary`) y metadatos locales:

| Campo | Función |
| --- | --- |
| `localId` | UUID generado al guardar; permanece estable durante los reintentos y sirve como clave de idempotencia. |
| `serverId` | Identificador opcional que devuelve el remitente al confirmar el envío. |
| `updatedAt` | Marca de tiempo local, en milisegundos, usada por la política de conflictos. |
| `syncStatus` | `pending`, `syncing`, `error` o `synced`. |
| `retryCount` | Número de intentos iniciados, incluidos los confirmados o interrumpidos. |

`queueInspection(data)` genera `localId`, fija `updatedAt`, inicia
`retryCount` en 0 y guarda el registro con estado `pending` antes de intentar
enviarlo. Los datos del listado SSR de `/inspecciones` vienen de un arreglo
sintético separado; guardar una inspección local no modifica ese arreglo.

## Cola, reintentos y recuperación

`src/lib/sync/queue.ts` consulta IndexedDB y considera los estados `pending`,
`error` y `syncing`. La cuenta del panel incluye también registros que ya
agotaron sus intentos; siguen sin confirmación aunque se omitan del envío.
Antes de llamar a `send(record)`, la cola incrementa `retryCount` y guarda el
registro en `syncing`.
Si el remitente responde `{ ok: true }`, queda `synced` y se almacena el
`serverId` que haya devuelto. Si responde `{ ok: false }` o lanza un error,
queda `error` con el intento ya registrado.

`error` es recuperable mientras `retryCount < 3`: otra ejecución manual de la
sincronización puede reintentar el mismo `localId`. El límite es **tres
intentos iniciados por registro**; al agotarlo, el registro sigue almacenado
para diagnóstico, pero la cola ya no lo envía. El retorno de
`syncPendingInspections` informa cuántos registros se sincronizaron, fallaron
o se omitieron en esa ejecución.

Si la página se cierra después de marcar `syncing` y antes de guardar el
resultado, el siguiente intento vuelve a considerar ese registro. El remitente
puede haberlo recibido antes del cierre, por lo que debe reconocer el mismo
`localId` cuando se repita el envío. El intento interrumpido ya cuenta para
el límite de tres. Dos llamadas simultáneas en la misma pestaña comparten una
ejecución; la protección no coordina pestañas o dispositivos distintos. No hay
calendario de reintentos ni espera
exponencial: cada intento requiere una nueva invocación. Un fallo al abrir o
escribir IndexedDB se propaga al llamador y debe mostrarse como error, sin
afirmar que el registro quedó guardado.

## Idempotencia y duplicados

Un reintento envía el `localId` original: no genera otra inspección local.
En una integración real, el servidor debe imponer unicidad por ese valor,
guardar la relación `localId` → `serverId` y devolver el mismo resultado si
recibe una petición repetida. De ese modo, un corte ocurrido después de que el
servidor aceptó el registro pero antes de recibir la respuesta no crea un
duplicado. Una comprobación solo en el navegador no garantiza idempotencia
entre dispositivos, sesiones o solicitudes concurrentes. El remitente simulado
del panel demuestra el contrato local, no sustituye esa garantía del servidor.

## Conflictos

`resolveConflict(local, server)` en `src/lib/sync/conflict-policy.ts` es una
función pura que compara `updatedAt` y elige la versión más reciente
(Last Write Wins). Si ambas marcas son iguales, conserva la versión local.
La regla es determinista, pero aún **no está integrada** en la cola: no existe
un backend que proporcione una versión remota ni un flujo de edición de la
misma inspección en dos dispositivos. Las pruebas de la función verifican la
decisión aislada; no prueban resolución extremo a extremo.

Las marcas provienen del reloj del cliente. Dos dispositivos con relojes
desajustados pueden elegir una versión anterior y perder cambios válidos.
Antes de usar datos reales harían falta versiones controladas por el servidor,
un protocolo de concurrencia y una política de revisión o combinación para
ediciones incompatibles.

## Límites observables

- IndexedDB pertenece al origen y perfil del navegador; cambiar de dispositivo
  no traslada la cola. No hay exportación, cifrado propio ni control de cuota.
- El Service Worker actual precarga HTML de inicio, manifest y página de
  respaldo, pero no los paquetes JavaScript de Next.js. Una pestaña ya cargada
  puede guardar inspecciones sin red; una recarga completamente offline puede
  mostrar HTML sin hidratar el panel interactivo.
- La demostración usa un remitente local simulado. No mide disponibilidad de
  red, entrega remota, conflictos reales ni sincronización en segundo plano.
- La política Last Write Wins puede descartar información aunque ambas
  versiones se hayan editado legítimamente.

## Verificación reproducible

Desde la raíz del proyecto, ejecutar `npm ci` y `make verify` (o
`npm.cmd run verify` en PowerShell sin Make). La suite `tests/sync.spec.ts`
cubre la cola y la política de conflictos con datos sintéticos. El script
`verify` ejecuta la prueba inicial, toda la suite Jest y el build. Para el flujo visual, iniciar
`npm run dev`, abrir la página principal, crear una inspección de prueba,
consultar la cuenta de pendientes y pulsar sincronizar. Revisar el estado
mostrado después del intento. Los casos de error y reintento se comprueban con
la suite automatizada, ya que el panel usa una confirmación simulada exitosa.
