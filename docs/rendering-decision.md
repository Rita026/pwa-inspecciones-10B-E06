# Decisión de renderizado — Semana 4

## 1. Objetivo

En esta semana se comparan dos formas de renderizar las pantallas de inspecciones:

* **SSR (Server-Side Rendering):** el contenido se obtiene y renderiza en el servidor.
* **CSR (Client-Side Rendering):** la interfaz se renderiza en el navegador y obtiene los datos desde el cliente.

La comparación se realiza sobre dos rutas del proyecto:

* `/inspecciones`: listado de inspecciones.
* `/inspecciones/[id]`: detalle de una inspección.

Los datos utilizados son sintéticos y están definidos en `src/lib/data/inspections.ts`.

## 2. Implementación realizada

### Listado `/inspecciones` — SSR

El listado se implementa como un Server Component de Next.js.

La página:

* no utiliza `"use client"`;
* es una función `async`;
* obtiene los datos mediante `getInspections()`;
* utiliza `export const dynamic = "force-dynamic"` para conservar el comportamiento dinámico del listado;
* genera los registros y enlaces desde el servidor.

Esta decisión permite que los datos del listado se obtengan durante el procesamiento de la página en el servidor.

Next.js utiliza Server Components por defecto en el App Router y permite obtener datos desde el servidor antes de enviar el resultado al cliente. La documentación oficial también describe el renderizado dinámico como aquel que genera contenido en el servidor al momento de la solicitud. [1][2]

### Detalle `/inspecciones/[id]` — CSR

El detalle se implementa como un Client Component.

La página:

* utiliza `"use client"`;
* utiliza `useState` para controlar los estados;
* utiliza `useEffect` para iniciar la solicitud;
* utiliza `useParams()` para obtener el identificador de la inspección;
* obtiene los datos mediante `fetch()` hacia `/api/inspecciones/[id]`;
* muestra estados de carga, error y registro no encontrado;
* muestra el detalle después de recibir la respuesta.

Este enfoque permite controlar desde el navegador el estado de la solicitud y actualizar la interfaz cuando los datos llegan.

Next.js indica que los Client Components son apropiados cuando se necesita interactividad o estado en el navegador. [1]

## 3. Comparación

| Aspecto                                 | SSR                                              | CSR                                   |
| --------------------------------------- | ------------------------------------------------ | ------------------------------------- |
| Lugar principal del renderizado inicial | Servidor                                         | Navegador                             |
| Obtención de datos en este proyecto     | `getInspections()` en el servidor                | `fetch()` desde el navegador          |
| JavaScript específico del cliente       | Menor                                            | Mayor                                 |
| Interactividad local                    | Más limitada directamente                        | Sencilla mediante estado y efectos    |
| Primera representación del contenido    | Puede incluir datos desde el servidor            | Puede comenzar con un estado de carga |
| Estado de carga                         | Puede apoyarse en mecanismos de carga de Next.js | Se controla explícitamente con estado |
| Adecuado para este proyecto             | Listado general                                  | Detalle con estados de solicitud      |

## 4. Ventajas y desventajas

### SSR

**Ventajas**

* Permite obtener y preparar los datos en el servidor.
* Puede entregar al cliente contenido ya generado.
* Reduce la necesidad de ejecutar la lógica de obtención inicial de datos en el navegador.
* Es útil cuando el contenido inicial debe estar disponible desde el servidor.

**Desventajas**

* Cada solicitud dinámica puede requerir procesamiento en el servidor.
* Si la obtención de datos es lenta, puede aumentar el tiempo necesario para generar la respuesta.
* La interactividad que depende del navegador normalmente requiere componentes de cliente adicionales.

La documentación de Next.js señala que el renderizado dinámico genera el contenido en el servidor durante la solicitud y que una obtención de datos lenta puede retrasar la generación de la página. [2]

### CSR

**Ventajas**

* Permite controlar directamente desde el navegador estados como carga, error y éxito.
* Facilita interfaces interactivas que dependen de estado del cliente.
* Permite solicitar los datos después de que la interfaz inicial está disponible.

**Desventajas**

* Requiere JavaScript del lado del cliente para ejecutar la lógica.
* El usuario puede observar inicialmente un estado de carga mientras llega la información.
* La disponibilidad del detalle depende de que la solicitud al API pueda completarse.

Next.js recomienda Client Components cuando se necesitan características propias del cliente, como estado e interacción. [1]

## 5. Decisión del equipo

Para esta semana se utiliza una combinación de ambas estrategias:

* **SSR para `/inspecciones`**, porque el listado representa el conjunto de inspecciones y puede obtenerse mediante una función de datos del servidor.
* **CSR para `/inspecciones/[id]`**, porque el detalle necesita controlar explícitamente los estados de carga, error y no encontrado mientras consulta el API desde el navegador.

La decisión no establece que SSR sea siempre mejor que CSR ni que CSR sea siempre mejor que SSR. La estrategia depende de las necesidades de cada pantalla.

## 6. Estados y manejo de errores

El detalle CSR contempla cuatro estados principales:

1. **Loading:** se muestra mientras se solicita el registro.
2. **Success:** se muestran los datos de la inspección.
3. **Not found:** se informa cuando el API responde con `404`.
4. **Error:** se informa cuando la solicitud falla o el API devuelve un error.

Next.js proporciona mecanismos específicos para manejar estados de carga y errores. Por ejemplo, `loading.tsx` puede proporcionar una interfaz de carga mediante Suspense, mientras que `error.tsx` permite establecer una interfaz de recuperación para errores no controlados. [3][4]

En este proyecto, el detalle controla sus estados mediante React porque la solicitud del detalle se realiza desde el Client Component.

## 7. Supuestos

* Las inspecciones utilizadas en esta semana son sintéticas.
* La fuente de datos actual está almacenada en `src/lib/data/inspections.ts`.
* No se utiliza todavía una base de datos real.
* La API de detalle pertenece al mismo proyecto.
* El objetivo de esta comparación es evaluar el comportamiento de las dos estrategias dentro del proyecto actual.

## 8. Limitaciones

* La comparación no representa una medición de rendimiento en producción.
* No se realizaron pruebas con una base de datos remota.
* No se compararon métricas de usuarios reales.
* El proyecto se encuentra en una etapa académica y utiliza datos sintéticos.
* La elección podría revisarse si en el futuro cambian la fuente de datos, los requisitos de interactividad o las necesidades de actualización.

## 9. Verificación

La prueba de esta semana se encuentra en:

`tests/rendering.spec.ts`

La prueba verifica características observables de las dos implementaciones y se ejecuta mediante Jest con:

```bash
npm run test:unit
```

Además, la verificación general del proyecto puede ejecutarse mediante:

```bash
npm run verify
```

## 10. Fuentes

[1] Next.js — Server and Client Components.
https://nextjs.org/learn/react-foundations/server-and-client-components

[2] Next.js — Static and Dynamic Rendering.
https://nextjs.org/learn/dashboard-app/static-and-dynamic-rendering

[3] Next.js — Streaming y `loading.tsx`.
https://nextjs.org/learn/dashboard-app/streaming

[4] Next.js — Handling Errors.
https://nextjs.org/learn/dashboard-app/error-handling
