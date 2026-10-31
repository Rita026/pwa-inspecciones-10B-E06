# Inventario de datos y privacidad

## 1. Propósito

Este documento identifica los datos que maneja la PWA de inspecciones, su finalidad, el almacenamiento conocido y los riesgos de privacidad. El proyecto utiliza datos sintéticos para demostraciones y pruebas.

## 2. Inventario de datos

| Dato | Finalidad | Riesgo de privacidad | Medida recomendada |
|---|---|---|---|
| `localId` | Identificar una inspección guardada en el dispositivo. | Puede vincular registros relacionados. | Utilizarlo solo para las operaciones necesarias. |
| `serverId` | Asociar una inspección con su registro remoto, cuando corresponda. | Puede permitir relacionar registros entre sistemas. | No exponerlo en información pública o registros innecesarios. |
| `location` | Identificar el laboratorio inspeccionado. | Puede revelar información sobre instalaciones. | Compartirlo solo con quienes lo necesiten. |
| `coordinates` | Registrar coordenadas GPS opcionales. | Puede revelar una ubicación precisa. | No recopilar ni compartir coordenadas si no son necesarias. |
| `date` | Registrar la fecha de la inspección. | Puede revelar patrones de actividad. | Conservar la precisión necesaria para la operación. |
| `inspector` | Identificar al inspector registrado. | Puede identificar a una persona. | Evitar su exposición en reportes públicos y registros técnicos. |
| `status` y `statusLabel` | Representar el estado de la inspección. | Bajo por sí solos; depende del contexto. | Limitar su uso a la finalidad de inspección. |
| `findings` | Registrar la cantidad de observaciones. | Puede revelar condiciones de las instalaciones. | Compartir únicamente con usuarios autorizados. |
| `summary` | Describir los resultados de la inspección. | El texto podría incluir datos personales o detalles sensibles. | Validar y limitar el contenido; evitar datos personales innecesarios. |
| `updatedAt` | Registrar cuándo se modificó una inspección. | Puede revelar actividad del usuario. | Usarlo únicamente para control y sincronización. |
| `syncStatus` y `retryCount` | Gestionar el estado y los intentos de sincronización. | Pueden revelar detalles operativos. | No exponerlos en interfaces o registros públicos. |

## 3. Almacenamiento identificado

El archivo `src/lib/storage/schema.ts` define una base de datos IndexedDB llamada `inspecciones-db`, con un almacén `inspections`.

Los registros pueden incluir datos de identificación, ubicación, contenido de la inspección y metadatos de sincronización. El esquema permite coordenadas GPS opcionales.

El esquema por sí solo no demuestra qué información se transmite a un servidor ni durante cuánto tiempo se conserva. Estos aspectos deben verificarse en la implementación de sincronización y eliminación de registros.

## 4. Clasificación

- **Datos sintéticos:** registros de demostración definidos en `src/lib/data/inspections.ts`.
- **Datos potencialmente personales:** nombre del inspector y coordenadas GPS.
- **Datos operativos:** identificadores, estado de inspección, observaciones y metadatos de sincronización.
- **Datos de instalaciones:** nombre del laboratorio, fecha y descripción de los hallazgos.

Que los datos de demostración sean sintéticos no significa que los mismos campos estén libres de riesgos si se utilizan datos reales.

## 5. Medidas de minimización

1. Recopilar únicamente los datos necesarios para la inspección.
2. No solicitar ni almacenar coordenadas GPS cuando no sean necesarias.
3. Evitar incluir nombres, coordenadas, descripciones completas o identificadores en registros técnicos y reportes públicos.
4. Utilizar una proyección de datos mínimos cuando solo se necesiten estadísticas o resúmenes.
5. Definir y documentar un periodo de conservación y un procedimiento de eliminación.
6. Restringir el acceso a los datos de inspección y verificar las medidas de protección durante la sincronización.
7. No utilizar datos personales reales en pruebas académicas cuando basten datos sintéticos.

## 6. Límites de seguridad

El archivo `robots.txt` sirve para comunicar instrucciones a los rastreadores web; no impide que una persona acceda a una URL ni sustituye la autenticación, la autorización o los controles del servidor.

La minimización de datos debe aplicarse en el código que genera o transmite la información. Ocultar campos únicamente en la interfaz no garantiza que estén protegidos.
