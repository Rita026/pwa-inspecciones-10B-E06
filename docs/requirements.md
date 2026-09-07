# Requisitos del producto — documento del equipo


## 1. Problema y contexto

El producto busca facilitar el seguimiento de inspecciones y hallazgos de mantenimiento en laboratorios mediante un registro digital. La dificultad que se busca atender es la posible pérdida o interrupción de información cuando una persona realiza una inspección y no cuenta con una conexión estable a internet.

La conectividad es importante porque una futura versión del producto deberá permitir conservar temporalmente la información registrada cuando no exista conexión y continuar el proceso de inspección. Cuando la conexión se restablezca, la información pendiente deberá poder sincronizarse con el sistema.

El problema se plantea como una necesidad del producto y no como un diagnóstico real de la Universidad Tecnológica de Tehuacán, ya que durante esta semana se trabaja únicamente con datos sintéticos proporcionados por el starter.

El producto contempla como objetivo futuro facilitar la consulta, registro y seguimiento de inspecciones y hallazgos de mantenimiento, considerando escenarios en los que la conectividad puede ser intermitente.

Fuera del alcance de la Semana 1

Durante esta semana no se implementarán:

Registro real de inspecciones.
Funcionamiento offline.
Sincronización de información.
Notificaciones.
Autenticación.
Manifest de PWA.
Service Worker.
Nuevas pruebas automatizadas.

Estos elementos corresponden a etapas posteriores del proyecto. Durante la Semana 1 se documentan los requisitos futuros y se verifica que el starter pueda ejecutarse de manera reproducible.

## 2. Usuarios y escenarios

Usuarios
Persona encargada de realizar inspecciones: consulta la información disponible y, en una versión futura, podrá registrar inspecciones y documentar hallazgos encontrados durante el mantenimiento.
Persona encargada del seguimiento de mantenimiento: consulta los resultados de las inspecciones para identificar aquellas que requieren atención y dar seguimiento a los hallazgos registrados.
Escenario 1: Consulta con conexión estable

Situación inicial:
La persona encargada de una inspección cuenta con conexión a internet y necesita consultar los registros disponibles.

Acción:
Abre la aplicación y revisa el listado de inspecciones.

Resultado esperado:
Puede visualizar los registros disponibles y distinguir la información de cada inspección, incluyendo los casos que presentan alguna incidencia o requieren atención.

Relación con el producto:
Este escenario representa la consulta normal de información cuando existe conectividad.

Escenario 2: Registro durante una conexión intermitente

Situación inicial:
La persona encargada realiza una inspección y la conexión a internet es intermitente o se pierde temporalmente.

Acción:
En una versión futura del producto, registra los datos de la inspección y documenta un hallazgo mientras realiza el recorrido.

Resultado esperado:
El producto deberá conservar temporalmente la información capturada para evitar su pérdida y deberá permitir que los datos pendientes sean enviados o sincronizados cuando la conexión vuelva a estar disponible.

Relación con el producto:
Este escenario justifica la necesidad de considerar una estrategia PWA y una operación offline futura.

## 3. Requisitos funcionales

Los siguientes requisitos describen el comportamiento esperado del producto. Se distingue entre los requisitos que pueden comprobarse durante la Semana 1 y los requisitos del producto que serán implementados en etapas posteriores.

| ID | Acción del producto | Condición observable de aceptación | Alcance |
|---|---|---|---|
| RF-01 | Mostrar el listado de inspecciones disponibles. | Al abrir la aplicación se muestran las tres inspecciones sintéticas proporcionadas por el starter. | Semana 1 |
| RF-02 | Mostrar la información disponible de cada inspección. | El usuario puede consultar los datos sintéticos asociados a cada inspección y sus incidencias. | Semana 1 |
| RF-03 | Registrar una nueva inspección. | Al proporcionar los datos requeridos y válidos, el sistema crea un nuevo registro de inspección que puede consultarse posteriormente. | Futuro |
| RF-04 | Registrar un hallazgo asociado a una inspección. | Al guardar un hallazgo válido, este queda asociado a la inspección correspondiente y puede consultarse posteriormente. | Futuro |
| RF-05 | Conservar información durante una pérdida de conexión. | Si se pierde la conexión durante el registro, la información capturada permanece disponible para evitar su pérdida. | Futuro |
| RF-06 | Sincronizar registros pendientes. | Cuando se restablece la conexión, los registros pendientes pueden enviarse al sistema y conservar su información. | Futuro |
| RF-07 | Identificar inspecciones que requieren atención. | El usuario puede identificar los registros que presentan hallazgos o requieren seguimiento a partir de la información de la inspección. | Futuro |

Los requisitos RF-03 a RF-07 corresponden al producto futuro. Su documentación durante la Semana 1 no implica que estas funcionalidades deban estar implementadas en esta entrega.

## 4. Requisitos no funcionales

Los siguientes requisitos establecen condiciones de calidad y restricciones del producto. Las metas futuras se presentan como objetivos que serán comprobados cuando se implementen las funcionalidades correspondientes; no representan mediciones realizadas durante la Semana 1.

| ID | Aspecto | Condición / Meta | Método de comprobación | Momento de validación |
|---|---|---|---|---|
| RNF-01 | Reproducibilidad | En una copia limpia del repositorio, con Node.js 20.19+ y npm 10+, `npm ci` y `npm run verify` deben finalizar correctamente. | Ejecutar los comandos desde la raíz del repositorio y comprobar el código de salida. | Semana 1 |
| RNF-02 | Rendimiento | El listado deberá mostrarse en menos de 2 segundos con hasta 100 registros sintéticos. | Realizar cinco mediciones bajo una conexión estable y registrar los resultados. | Futuro |
| RNF-03 | Accesibilidad | Los controles y formularios deberán poder utilizarse mediante teclado y contar con etiquetas identificables. | Realizar una revisión manual de navegación mediante teclado y de las etiquetas de los controles. | Futuro |
| RNF-04 | Seguridad | Las futuras funcionalidades de acceso no deberán almacenar contraseñas ni credenciales directamente en el código fuente. | Revisar el código fuente y la configuración del proyecto cuando se implemente el acceso. | Futuro |
| RNF-05 | Privacidad | Las pruebas y demostraciones de esta etapa deberán utilizar únicamente datos sintéticos y no deberán incluir información personal real. | Revisar los datos utilizados en el repositorio y durante las demostraciones. | Semana 1 |
| RNF-06 | Operación offline | La información capturada durante una pérdida de conexión deberá conservarse localmente hasta que pueda sincronizarse. | Simular una pérdida de conexión, registrar información y comprobar que permanezca disponible. | Futuro |
| RNF-07 | Sincronización | Los registros pendientes deberán sincronizarse al recuperar la conexión sin generar registros duplicados. | Simular desconexión y reconexión y comprobar que cada registro se sincronice una sola vez. | Futuro |

## 5. Datos sintéticos y límites



### Información excluida

Durante la Semana 1 se utilizan únicamente datos sintéticos proporcionados por el starter para representar inspecciones de mantenimiento. Estos datos permiten comprobar la estructura y visualización del producto sin utilizar información real de la Universidad Tecnológica de Tehuacán.

Los registros sintéticos utilizados por el starter contienen los siguientes campos:

Identificador de inspección: identifica de forma ficticia cada registro, por ejemplo inspection-001.
Ubicación: representa el laboratorio donde se realizó la inspección, como Laboratorio de Redes, Laboratorio de Electrónica o Laboratorio de Software.
Fecha: indica la fecha ficticia en la que se realizó la inspección.
Inspector: identifica mediante un nombre ficticio a la persona que realizó la inspección, como Técnica A, Técnico B o Técnica C.
Estado: indica si la inspección se encuentra sin incidencias (ok) o requiere atención (attention).
Etiqueta del estado: muestra de forma legible el resultado de la inspección, como "Sin incidencias" o "Requiere atención".
Cantidad de hallazgos: indica el número de hallazgos registrados en la inspección.
Resumen: contiene una descripción sintética de las actividades u observaciones de mantenimiento.
Información excluida

No se utilizarán:

Nombres reales de estudiantes o personal.
Datos personales reales.
Números telefónicos reales.
Correos electrónicos personales reales.
Contraseñas o credenciales.
Información confidencial de la universidad.
Datos reales de mantenimiento.

Los datos proporcionados por el starter son únicamente representativos y no corresponden a inspecciones reales. Por lo tanto, los resultados obtenidos durante las pruebas no deberán interpretarse como un diagnóstico real de las condiciones de mantenimiento de los laboratorios de la Universidad Tecnológica de Tehuacán.

La identificación académica de los integrantes del equipo se registrará únicamente en la evidencia correspondiente del repositorio privado y en Classroom.

## 6. Criterios de aceptación de la Semana 1

La aceptación de esta semana se basa en comprobar que el entorno pueda reproducirse, que el starter funcione correctamente y que los requisitos y decisiones del producto estén documentados de forma verificable.

| Entrega | Comprobación | Resultado esperado |
|---|---|---|
| Starter funcional | Ejecutar `npm ci` y `npm run dev`. | La aplicación inicia correctamente y permite visualizar las inspecciones sintéticas disponibles. |
| Verificación técnica | Ejecutar `npm run verify`. | El proceso termina correctamente y genera el reporte de verificación correspondiente. |
| Build | Ejecutar `npm run build` o comprobar el build realizado durante `npm run verify`. | El proyecto genera el build sin errores. |
| Requisitos del producto | Revisar `docs/requirements.md`. | El documento contiene el problema, usuarios, escenarios, requisitos funcionales, requisitos no funcionales, datos sintéticos y límites. |
| Decisión tecnológica | Revisar `docs/decision-record.md`. | El documento compara las alternativas tecnológicas y justifica la estrategia seleccionada. |
| Evidencia individual | Revisar `evidence/individual.md`. | Cada integrante explica su contribución, una decisión, una comprobación realizada, su resultado y sus limitaciones. |

La ejecución correcta de los comandos comprueba aspectos técnicos del proyecto, pero no demuestra por sí misma la calidad del análisis del producto. La revisión de los documentos es necesaria para valorar la coherencia y justificación de los requisitos y decisiones.

Las funcionalidades futuras de registro de inspecciones, operación offline, sincronización, notificaciones y autenticación no forman parte de los criterios de aceptación de la Semana 1.