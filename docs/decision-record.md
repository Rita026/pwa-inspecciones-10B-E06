# ADR-001 — Estrategia de aplicación para inspecciones de laboratorio

## Estado

**Propuesta para ratificación por el equipo — 6 de septiembre de 2026.**

La propuesta es conservar el starter con Next.js y evolucionarlo como una
Aplicación Web Progresiva (PWA). Esta decisión no implica que las capacidades
PWA ya estén implementadas en la Semana 1.

## Contexto y restricciones

El producto apoyará a las personas responsables de inspeccionar laboratorios de
la UTT. Durante una inspección deben poder consultar los registros recientes y,
en semanas posteriores, registrar hallazgos, ubicación, fecha y estado. El uso
principal será desde un teléfono o computadora disponible en el laboratorio.

La conectividad puede ser intermitente: una persona puede detectar un hallazgo
en un área sin Wi-Fi estable y necesitar conservar el registro hasta recuperar
la conexión. Por ello, el producto futuro debe priorizar la continuidad del
registro sin asumir que siempre habrá red.

En esta etapa el starter muestra tres inspecciones precargadas y exclusivamente
sintéticas. No usa base de datos ni datos personales, y el alcance de la Semana
1 no incluye manifest, service worker, almacenamiento local, sincronización,
notificaciones ni autenticación. La decisión debe ser viable con el curso y el
starter Next.js; no se cambiará el stack ni se construirán las cuatro opciones.

## Alternativas consideradas

| Criterio | PWA con Next.js | Web tradicional | App nativa | App multiplataforma |
|---|---|---|---|---|
| Instalación | Se abre por URL y se puede instalar desde el navegador cuando se agregue el manifest. | Se abre por URL; no requiere instalación, pero tampoco queda integrada como aplicación. | Requiere instalar una aplicación distinta para Android o iOS. | Requiere instalar la aplicación generada para cada plataforma, aunque parte del código pueda compartirse. |
| Conexión intermitente | Puede conservar interfaz y datos locales con caché, IndexedDB y una cola de sincronización; requiere diseñarlo e implementarlo. | Depende normalmente del servidor y de la red; una interrupción puede impedir consultar o guardar. | Puede almacenar datos y sincronizar después con control más amplio del sistema. | También puede operar con datos locales y sincronizar después, con plugins o código adicional. |
| Distribución | Un enlace permite publicar actualizaciones sin tienda; la instalación es opcional. | Un enlace permite actualizar de inmediato. | Se distribuye mediante tiendas o instalación administrada; las revisiones y versiones pueden retrasar cambios. | Se distribuye mediante tiendas o archivos de instalación, con sus procesos de publicación. |
| Desarrollo | Reutiliza el starter y conocimientos web; una sola aplicación reduce el costo inicial. | Es la opción de menor costo inicial, pero no cubre bien el escenario offline futuro. | Exige desarrollo y pruebas específicas por plataforma, por lo que aumenta tiempo y costo. | Comparte gran parte del código, pero exige aprender el framework, integrar módulos y resolver diferencias por plataforma. |
| Mantenimiento | Una base web y despliegue centralizado; se deben vigilar compatibilidad de navegadores y actualización de cachés. | Una sola base web, simple de mantener mientras no se necesite operación sin red. | Puede requerir dos bases de código, versiones mínimas y liberaciones separadas. | Reduce duplicación respecto a nativo, aunque mantiene dependencias y fallas particulares de Android e iOS. |
| Capacidades del dispositivo | Accede a capacidades web disponibles, como cámara, ubicación o almacenamiento, con permisos y soporte variable. | Tiene acceso a las mismas API web, pero sin una estrategia de instalación u offline. | Ofrece el acceso más amplio y predecible a hardware, procesos en segundo plano y almacenamiento. | Permite acceder a muchas capacidades nativas mediante APIs y plugins; algunas requieren configuración específica. |
| Riesgo principal en este caso | Soporte desigual, límites de almacenamiento y complejidad al sincronizar conflictos. | Pérdida de continuidad cuando falle la red. | Costo, tiempo y fricción de distribución desproporcionados para el alcance actual. | Complejidad adicional sin una necesidad actual que compense el cambio de stack. |

Una PWA no obtiene funcionamiento offline solo por usar React o Next.js. Será
necesario agregar una estrategia explícita de caché, persistencia local y
sincronización. Del mismo modo, una app nativa o multiplataforma sería más
conveniente si se necesitara acceso continuo a hardware especializado,
ejecución confiable en segundo plano o una operación completamente administrada
sin depender del soporte del navegador.

## Decisión

Se propone usar una **PWA basada en el starter Next.js**. Esta alternativa
equilibra el caso de uso y las restricciones: el personal puede abrir el sistema
desde una URL sin instalarlo, y en fases posteriores tendrá la opción de
instalarlo y conservar trabajo durante cortes de conexión. El equipo mantiene
una sola base de código web, puede publicar correcciones de forma centralizada y
no asume el costo de crear y distribuir aplicaciones nativas para dos sistemas
operativos.

La web tradicional sería suficiente si todas las inspecciones se hicieran con
conexión confiable y solo se consultaran datos. No es la opción elegida porque
el escenario de captura con conectividad intermitente es parte del problema. La
alternativa nativa o multiplataforma se reconsiderará si las pruebas futuras
demuestran que la PWA no cubre las capacidades del dispositivo, estabilidad o
seguridad requeridas.

## Consecuencias y riesgos

| Consecuencia o riesgo | Impacto y mitigación prevista |
|---|---|
| Continuidad sin red | El registro local permitiría no perder un hallazgo durante un corte. Se definirá qué datos se guardan en el dispositivo y una cola de cambios antes de implementar la función. |
| Conflictos al reconectar | Un mismo registro podría cambiarse desde dos dispositivos. Se establecerán identificadores, fecha de modificación y una regla explícita de resolución de conflictos; no se sobrescribirán cambios de forma silenciosa. |
| Cachés desactualizadas | Una PWA puede mostrar una versión anterior después de publicar cambios. Se documentará una política de actualización y se avisará al usuario cuando exista una versión nueva. |
| Compatibilidad y almacenamiento | Algunos navegadores limitan instalación, almacenamiento o ejecución en segundo plano. Se probarán los navegadores y dispositivos definidos por el equipo y se informarán las capacidades no disponibles. |
| Privacidad y seguridad futuras | Hoy solo hay datos sintéticos. Si después se manejan datos reales, se requerirán autenticación, autorización, transmisión cifrada, mínimo de datos almacenados y una política de retención antes de desplegar esa versión. |
| Mayor trabajo que una página web simple | Service worker, caché, IndexedDB y sincronización agregan complejidad. Se implementarán gradualmente y cada fase se validará antes de depender de ella en una inspección real. |

## Validación futura

La decisión se revisará cuando existan las funciones PWA; las siguientes son
validaciones futuras, no resultados obtenidos en la Semana 1:

1. En un dispositivo y navegador declarados por el equipo, abrir la aplicación,
   cortar la red, crear diez registros sintéticos y cerrar/abrir de nuevo la
   aplicación. Se espera que los diez registros permanezcan localmente.
2. Recuperar la conexión y comprobar que cada cambio pendiente se sincroniza
   una sola vez, sin duplicados ni pérdida de información. También se probará
   un conflicto controlado entre dos dispositivos para verificar la regla
   definida.
3. Probar instalación, actualización y consulta offline en los navegadores
   objetivo. Se registrará qué capacidades sí y no soporta cada combinación.
4. Con 100 registros sintéticos y el dispositivo de prueba declarado, medir en
   cinco ejecuciones el tiempo de carga del listado. La meta propuesta es que
   aparezca en menos de dos segundos; el resultado se documentará sin presentar
   la meta como una medición actual.

En la Semana 1 solo se puede verificar que el starter conserva su estructura,
ejecuta la prueba proporcionada y compila. Esa verificación técnica no demuestra
que el modo offline, la sincronización ni la instalación PWA funcionen.
