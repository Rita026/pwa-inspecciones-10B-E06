# Estrategia de pruebas

## Objetivo

Verificar que el formulario de registro de inspecciones valide los datos antes de guardarlos, que las inspecciones se almacenen localmente y que la ubicacion del dispositivo sea opcional.

## Pruebas unitarias de validacion

La funcion `validateInspectionForm` se prueba con los siguientes casos:

- Formulario valido.
- Campos obligatorios vaci­os o con espacios.
- Fecha inexistente.
- Número de hallazgos negativo, decimal, vaci­o o no numerico.
- Cero hallazgos, que es un valor valido.

**Resultado observado:** las pruebas unitarias se ejecutaron correctamente. La suite `tests/unit/inspection-validation.test.ts` pasa.

## Pruebas de integraciÃ³n y almacenamiento

El formulario utiliza `queueInspection` para guardar registros en IndexedDB. Una inspección valida debe guardarse localmente y quedar pendiente de sincronizacion.

La sincronizacion existente utiliza un receptor simulado. Por lo tanto, las pruebas no demuestran que exista un servidor real ni que los datos se hayan transmitido a un servidor remoto.

**Resultado observado:** las pruebas de Jest terminaron con 16 suites aprobadas y 78 pruebas exitosas.

## UbicaciÃ³n opcional

La ubicacion se solicita unicamente cuando la persona pulsa el boton correspondiente.

Se consideran los siguientes escenarios:

- El dispositivo concede el permiso.
- La persona deniega el permiso.
- El navegador no admite geolocalizacion.
- Se produce un error al consultar la ubicacion.
- Se guarda una inspeccion sin coordenadas.

La inspeccion debe poder guardarse con los demas datos validos aunque no se obtengan coordenadas.

**Resultado observado en la prueba manual:** se guarda una inspeccion sin solicitar la ubicacion del dispositivo. Esto confirma que obtener la ubicacion no es un requisito para guardar el registro. No se considera comprobado mediante esta prueba que se haya denegado expli­citamente el permiso.

## Herramientas y comandos

| Comando | Resultado |
|---|---|
| `npm.cmd run test:unit -- --runInBand` | Correcto: 16 suites y 78 pruebas aprobadas. |
| `npm.cmd run typecheck` | Correcto: finaliza sin errores de TypeScript. |
| `npm.cmd run build` | Correcto: la compilacion de produccion finaliza exitosamente. |

## Limitaciones

- La ubicaciÃ³n depende de los permisos del usuario, del navegador y del dispositivo.
- El guardado local no demuestra que una inspecciÃ³n se haya sincronizado con un servidor real.
- Los resultados corresponden a la ejecucion realizada durante el desarrollo y pueden cambiar si se modifica el codigo o la configuracion.
