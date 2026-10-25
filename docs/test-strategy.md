# Estrategia de pruebas

## Objetivo

Verificar que el formulario de registro de inspecciones valide los datos antes de guardarlos, que las inspecciones se almacenen localmente y que la ubicaciÃ³n del dispositivo sea opcional.

## Pruebas unitarias de validaciÃ³n

La funciÃ³n `validateInspectionForm` se prueba con los siguientes casos:

- Formulario vÃ¡lido.
- Campos obligatorios vacÃ­os o con espacios.
- Fecha inexistente.
- NÃºmero de hallazgos negativo, decimal, vacÃ­o o no numÃ©rico.
- Cero hallazgos, que es un valor vÃ¡lido.

**Resultado observado:** las pruebas unitarias se ejecutaron correctamente. La suite `tests/inspection-validation.test.ts` pasÃ³.

## Pruebas de integraciÃ³n y almacenamiento

El formulario utiliza `queueInspection` para guardar registros en IndexedDB. Una inspecciÃ³n vÃ¡lida debe guardarse localmente y quedar pendiente de sincronizaciÃ³n.

La sincronizaciÃ³n existente utiliza un receptor simulado. Por lo tanto, las pruebas no demuestran que exista un servidor real ni que los datos se hayan transmitido a un servidor remoto.

**Resultado observado:** las pruebas de Jest terminaron con 16 suites aprobadas y 78 pruebas exitosas.

## UbicaciÃ³n opcional

La ubicaciÃ³n se solicita Ãºnicamente cuando la persona pulsa el botÃ³n correspondiente.

Se consideran los siguientes escenarios:

- El dispositivo concede el permiso.
- La persona deniega el permiso.
- El navegador no admite geolocalizaciÃ³n.
- Se produce un error al consultar la ubicaciÃ³n.
- Se guarda una inspecciÃ³n sin coordenadas.

La inspecciÃ³n debe poder guardarse con los demÃ¡s datos vÃ¡lidos aunque no se obtengan coordenadas.

**Resultado observado en la prueba manual:** se guardÃ³ una inspecciÃ³n sin solicitar la ubicaciÃ³n del dispositivo. Esto confirma que obtener la ubicaciÃ³n no es un requisito para guardar el registro. No se considera comprobado mediante esta prueba que se haya denegado explÃ­citamente el permiso.

## Herramientas y comandos

| Comando | Resultado |
|---|---|
| `npm.cmd run test:unit -- --runInBand` | Correcto: 16 suites y 78 pruebas aprobadas. |
| `npm.cmd run typecheck` | Correcto: finalizÃ³ sin errores de TypeScript. |
| `npm.cmd run build` | Correcto: la compilaciÃ³n de producciÃ³n finalizÃ³ exitosamente. |

## Limitaciones

- La ubicaciÃ³n depende de los permisos del usuario, del navegador y del dispositivo.
- El guardado local no demuestra que una inspecciÃ³n se haya sincronizado con un servidor real.
- Los resultados corresponden a la ejecuciÃ³n realizada durante el desarrollo y pueden cambiar si se modifica el cÃ³digo o la configuraciÃ³n.
