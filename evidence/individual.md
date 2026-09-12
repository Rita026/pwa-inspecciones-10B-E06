# Evidencia individual del equipo

> Un solo archivo compartido. Repitan la sección siguiente por cada integrante; cada persona escribe y explica su propia evidencia. Se aceptan evidencias previas equivalentes. El SHA final se entrega en Classroom después del último commit, para evitar modificar el commit que se está identificando.

- Grupo y equipo: 10B-E06
- Repositorio del equipo: https://github.com/Rita026/pwa-inspecciones-10B-E06

## Integrante: Rita González Sánchez

- Mi contribución concreta y enlace a archivo, commit anterior o revisión:
  Creé el repositorio del equipo, instalé las dependencias con `npm ci`,
  levanté el entorno de desarrollo con `npm run dev` y verifiqué que las tres
  inspecciones sintéticas (Laboratorio de Redes, Laboratorio de Electrónica y
  Laboratorio de Software) se mostraran correctamente en http://localhost:3000.
  También completé la sección de entorno y limitaciones en el README.
  Commit: https://github.com/Rita026/pwa-inspecciones-10B-E06/commit/d3fef91f102741ab322193b81c4258a2f4822ddd

- Decisión que puedo explicar y por qué:
  Configuré el repositorio como público, siguiendo la indicación directa del
  docente, dado que el equipo no contaba todavía con su usuario de GitHub para
  invitarlo como colaborador en un repositorio privado. Esto permite que el
  proyecto sea accesible para su revisión mientras se resuelve el acceso formal.

- Comando o prueba proporcionada que ejecuté:
  npm ci, npm run dev y npm test

- Resultado real que observé:
  `npm ci` instaló 28 paquetes desde el lockfile y mostró 2 advertencias de
  vulnerabilidades de severidad alta en dependencias transitivas del starter.
  `npm run dev` inició el servidor correctamente y en http://localhost:3000 se
  mostraron las tres inspecciones sintéticas esperadas, cada una con su estado
  (sin incidencias / requiere atención), responsable y número de hallazgos.
  `npm test` ejecutó `tests/starter.spec.mjs` y el resultado fue
  "starter.spec.mjs: PASS".

- Qué verifica esa prueba y qué no verifica:
  La instalación y el servidor de desarrollo confirman que el proyecto corre
  correctamente y renderiza los datos sintéticos en pantalla. La prueba
  `starter.spec.mjs` verifica que el script "build" en package.json sea
  "next build" y que la página principal (src/app/page.tsx) contenga los
  textos "Inspecciones de laboratorio" y "sintéticos". No verifica que el
  proyecto compile sin errores para producción (no ejecuta next build), no
  revisa el comportamiento en otros sistemas operativos (solo se probó en
  Windows), y no cubre funcionalidades futuras como offline, sincronización
  o autenticación, que están fuera del alcance de esta semana.

- Limitación, dificultad o riesgo que identifiqué:
  Al revisar tsconfig.json, VS Code marca dos advertencias de deprecación en
  las opciones `target: es5` y `baseUrl`, que TypeScript dejará de soportar en
  una versión futura (no en la actual). No las modifiqué porque el proyecto
  funciona correctamente con esta configuración y cambiar la configuración
  base del starter no es parte del alcance de esta semana; además podría
  afectar la compatibilidad con el resto del equipo. Adicionalmente, `npm ci`
  reportó 2 advertencias de vulnerabilidades de severidad alta en dependencias
  del starter, que tampoco se modificaron por la misma razón de alcance.

- Uso de IA: herramienta, propósito, partes influenciadas y validación propia:
  Usé Claude (Anthropic) principalmente para entender la estructura y el alcance
  de la actividad (ACTIVIDAD-01.md, ACLARACION.md y START_HERE.md), y como guía
  paso a paso para: (1) resolver dudas sobre comandos de terminal y Git durante
  la creación e instalación del proyecto, (2) redactar un borrador de las
  secciones de entorno y limitaciones del README. Ejecuté personalmente cada comando en mi propia
  terminal y validé los resultados (instalación exitosa, carga correcta de la
  app en localhost:3000, y el PASS de la prueba) antes de documentarlos aquí.


## Integrante: Enrique Julian Gracia López

- Mi contribución concreta y enlace a archivo, commit anterior o revisión:
  Elaboré el análisis y la propuesta de decisión arquitectónica en
  [`docs/decision-record.md`](../docs/decision-record.md). Comparé PWA, web
  tradicional, app nativa y app multiplataforma según instalación, conectividad
  intermitente, distribución, desarrollo, mantenimiento y acceso al dispositivo.
  También documenté riesgos y validaciones que deberán realizarse en semanas
  posteriores. Este cambio debe incluirse en el siguiente commit final del equipo.

- Decisión que puedo explicar y por qué:
  Propuse conservar Next.js y evolucionar el producto como PWA. Para inspecciones
  de laboratorio, abrir la aplicación por URL reduce la fricción de distribución
  y una futura persistencia local puede evitar perder hallazgos cuando falle el
  Wi-Fi. No propuse afirmar que el modo offline ya funciona: el starter actual
  no tiene manifest, service worker, almacenamiento local ni sincronización.
  Una aplicación nativa o multiplataforma se reconsideraría si se necesita
  hardware especializado, ejecución confiable en segundo plano o si las pruebas
  muestran límites de compatibilidad que una PWA no puede cubrir.

- Comando o prueba proporcionada que ejecuté:
  `npm.cmd run verify` en PowerShell. Es el mismo script definido por
  `npm run verify`; se usó `npm.cmd` porque la política local bloquea el wrapper
  `npm.ps1`.

- Resultado real que observé:
  La primera ejecución no pudo iniciar con `npm` porque PowerShell bloqueó
  `npm.ps1`; además, antes de instalar dependencias el build no encontró
  `next`. Después de ejecutar `npm.cmd ci` desde el lockfile, `npm.cmd run
  verify` terminó con código 0: la prueba proporcionada mostró
  `starter.spec.mjs: PASS`, el build de Next.js compiló correctamente y el
  reporte indicó `Verificación técnica: pass. Revisión académica: pendiente.`
  Se generó `reports/verification.json` para adjuntarlo en Classroom.

- Qué verifica esa prueba y qué no verifica:
  `npm run verify` comprueba que existan los archivos requeridos, ejecuta la
  prueba proporcionada del starter y compila la aplicación con `next build`.
  Genera `reports/verification.json`. No evalúa la calidad del análisis del ADR,
  no certifica ausencia de secretos y no prueba instalación PWA, uso sin red,
  persistencia local ni sincronización.

- Limitación, dificultad o riesgo que identifiqué:
  La decisión PWA depende de capacidades que aún no existen en el proyecto. Al
  implementar almacenamiento local y sincronización podrían aparecer conflictos
  entre cambios de distintos dispositivos, límites de almacenamiento y diferencias
  de compatibilidad entre navegadores. Por ello el ADR propone validarlos con
  datos sintéticos antes de usar datos reales.

- Uso de IA: herramienta, propósito, partes influenciadas y validación propia:
  Usé Codex (OpenAI) para revisar las instrucciones de la actividad, estructurar
  un borrador de la comparación y redactar el ADR. Codex ejecutó la verificación
  local y el resultado se registró arriba. Antes de la entrega final debo revisar
  personalmente el ADR con el equipo, confirmar que refleja sus escenarios y
  aprobar el contenido antes de incluirlo en el commit final.

## Integrante: Katherine Daniela Gómez Merino

- Mi contribución concreta y enlace a archivo, commit anterior o revisión:
  Elaboré y documenté los requisitos del producto para la Semana 1 en docs/requirements.md. Mi contribución incluye la definición del problema y contexto, usuarios y escenarios, requisitos funcionales, requisitos no funcionales, datos sintéticos, límites y criterios de aceptación de la semana.
  Commit: https://github.com/Rita026/pwa-inspecciones-10B-E06/commit/072179354e985b55adb20c5d732ab66c3e0bcc18

- Decisión que puedo explicar y por qué:
  Decidí diferenciar en los requisitos las funcionalidades que corresponden a la Semana 1 de las funcionalidades futuras. Esto permite documentar desde ahora características como el funcionamiento offline y la sincronización, sin implementarlas antes de la etapa indicada en la actividad.

- Comando o prueba proporcionada que ejecuté:
  Ejecuté npm ci para instalar las dependencias del proyecto y npm run verify para realizar la verificación indicada por el starter.

- Resultado real que observé:
  El entorno pudo instalar sus dependencias y se realizó la verificación del proyecto. La aplicación del starter permite visualizar las inspecciones sintéticas proporcionadas.

- Qué verifica esa prueba y qué no verifica:
  La prueba permite comprobar aspectos técnicos del proyecto, como la instalación de dependencias, la estructura esperada y la ejecución de las verificaciones proporcionadas por el starter. No demuestra que las funcionalidades futuras de operación offline, sincronización, notificaciones o autenticación estén implementadas ni comprueba por sí sola la calidad del análisis de los requisitos.

- Limitación, dificultad o riesgo que identifiqué:
  Una dificultad fue diferenciar claramente entre lo que debía documentarse como requisito futuro y lo que realmente debía implementarse durante la Semana 1. También identifiqué como riesgo que una conectividad intermitente pueda provocar pérdida de información durante una inspección, por lo que se documentó la operación offline y la sincronización como necesidades futuras.

- Uso de IA: herramienta, propósito, partes influenciadas y validación propia:
  Utilicé ChatGPT como apoyo para revisar y mejorar la redacción de los requisitos, organizar las secciones y comprobar que los requisitos fueran claros y verificables. La IA influyó principalmente en la redacción y organización del documento. La información fue revisada y validada con las instrucciones de la actividad, el código del starter y los requisitos solicitados por el profesor. La decisión final sobre el contenido y alcance del documento fue realizada por mí.


## Semana 2

## Integrante: Katherine Daniela Gómez Merino

- Commit SHA evaluado: Se entregará en Classroom después del último commit, de acuerdo con las indicaciones de la actividad.

- Decisión técnica que puedo explicar: crear un AppShell reutilizable que centralice el encabezado, la navegación principal y el contenido mediante children, usando next/link y un nombre accesible para la navegación.

- Prueba que ejecuté y resultado: Ejecuté npm run test:unit, npm test, npm run build y npm run verify.

Resultados:
- npm run test:unit: PASS. La suite de App Shell pasó correctamente con 1 prueba aprobada.
- npm test: PASS. La prueba proporcionada por el starter terminó correctamente.
- npm run build: PASS. Next.js compiló correctamente el proyecto.
- npm run verify: PASS. La verificación técnica terminó correctamente.

- Limitación o fallo diagnosticado: La prueba verifica la estructura y navegación del App Shell, pero no demuestra por sí sola la instalación completa de la PWA ni el manifest, porque esa parte corresponde a otra sección del trabajo.

- Cambio que podría defender o modificar en vivo: Puedo explicar y modificar la estructura del App Shell, sus enlaces, aria-label, estilos o el contenido recibido mediante children.

- Uso declarado de IA (herramienta, propósito, validación): Utilice ChatGPT como apoyo para estructurar/revisar la implementación y las pruebas, pero revise el código, corregí la codificación, ejecute las pruebas y valide el resultado.


> No necesitan inventar un error ni escribir pruebas nuevas. «Ejecuté npm test» es insuficiente como explicación: indiquen qué observa la prueba y qué comportamiento queda fuera.
