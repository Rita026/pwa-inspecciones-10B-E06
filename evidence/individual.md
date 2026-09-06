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


## Integrante: escribir nombre

- Mi contribución concreta y enlace a archivo, commit anterior o revisión:
- Decisión que puedo explicar y por qué:
- Comando o prueba proporcionada que ejecuté:
- Resultado real que observé:
- Qué verifica esa prueba y qué no verifica:
- Limitación, dificultad o riesgo que identifiqué:
- Uso de IA: herramienta, propósito, partes influenciadas y validación propia (o «no utilicé IA»):

## Integrante: escribir nombre

- Mi contribución concreta y enlace a archivo, commit anterior o revisión:
- Decisión que puedo explicar y por qué:
- Comando o prueba proporcionada que ejecuté:
- Resultado real que observé:
- Qué verifica esa prueba y qué no verifica:
- Limitación, dificultad o riesgo que identifiqué:
- Uso de IA: herramienta, propósito, partes influenciadas y validación propia (o «no utilicé IA»):



> No necesitan inventar un error ni escribir pruebas nuevas. «Ejecuté npm test» es insuficiente como explicación: indiquen qué observa la prueba y qué comportamiento queda fuera.
