# Estrategia de caché y fallback offline

## 1. Propósito

La aplicación utiliza un Service Worker para conservar un conjunto mínimo de recursos necesarios para cargar la aplicación y proporcionar un comportamiento básico cuando el usuario pierde la conexión.

La estrategia implementada está enfocada en las navegaciones de la aplicación. No pretende almacenar todos los recursos ni implementar sincronización de datos.

## 2. Recursos que se guardan

El Service Worker utiliza la caché:

`inspecciones-cache-v1`

Durante la instalación se almacenan los siguientes recursos:

* `/` — página principal de la aplicación.
* `/manifest.webmanifest` — manifiesto de la PWA.
* `/offline.html` — página de fallback para cuando no existe conexión y no está disponible la página solicitada.

Estos recursos forman el App Shell mínimo utilizado por la aplicación.

## 3. Decisión de estrategia

Para las solicitudes de navegación se utiliza una estrategia **Network First**.

Primero se intenta obtener la página desde la red. Esto permite que, cuando existe conexión, el usuario reciba la versión actual de la aplicación.

Si la solicitud de navegación falla por falta de conexión, el Service Worker consulta la caché. Primero intenta devolver `/`. Si ese recurso tampoco está disponible, utiliza `/offline.html` como último fallback.

Esta decisión prioriza el contenido actualizado cuando existe conexión y conserva una alternativa local para situaciones offline.

## 4. Instalación de la caché

Durante el evento `install`, el Service Worker abre `inspecciones-cache-v1` y agrega los recursos definidos en el App Shell.

El objetivo es que los recursos mínimos estén disponibles antes de necesitarlos durante una navegación sin conexión.

## 5. Actualización de la caché

La caché utiliza una versión explícita en su nombre:

`inspecciones-cache-v1`

Cuando se publique una nueva versión del Service Worker que requiera actualizar los recursos almacenados, se deberá cambiar el nombre de la caché, por ejemplo:

`inspecciones-cache-v2`

Durante el evento `activate`, el Service Worker identifica las cachés cuyo nombre comienza con `inspecciones-cache-` y elimina las versiones anteriores que sean diferentes de la versión actual.

Esto evita conservar indefinidamente versiones antiguas del App Shell y reduce el riesgo de utilizar recursos obsoletos después de una actualización.

## 6. Comportamiento cuando existe conexión

Para una navegación mediante una solicitud `GET`, el Service Worker intenta primero:

1. Obtener la respuesta desde la red.
2. Si la red funciona, devolver la respuesta obtenida.

De esta manera, la aplicación no depende exclusivamente de una copia antigua almacenada en caché cuando existe conexión.

## 7. Comportamiento sin conexión

Si una navegación `GET` no puede obtener respuesta desde la red:

1. Se abre la caché `inspecciones-cache-v1`.
2. Se busca la página principal `/`.
3. Si `/` está disponible, se devuelve esa respuesta.
4. Si `/` no está disponible, se devuelve `/offline.html`.

La página `offline.html` informa al usuario que no existe conexión a Internet y que la página solicitada no pudo cargarse.

## 8. Alcance de la estrategia

Actualmente el Service Worker solo intercepta solicitudes de navegación `GET`, identificadas mediante `request.mode === "navigate"` o `request.destination === "document"`.

Las demás solicitudes no son interceptadas por esta estrategia.

Esto significa que esta implementación no proporciona todavía una estrategia específica de caché para APIs, imágenes, archivos estáticos individuales o sincronización de datos.

## 9. Actualización segura

La actualización se controla mediante versiones de la caché.

El procedimiento previsto es:

1. Crear una nueva versión del Service Worker.
2. Cambiar el nombre de la caché, por ejemplo de `inspecciones-cache-v1` a `inspecciones-cache-v2`.
3. Definir los recursos que deben formar parte de la nueva versión.
4. Durante `install`, crear y llenar la nueva caché.
5. Durante `activate`, eliminar las cachés anteriores de `inspecciones-cache-*`.
6. Ejecutar `clients.claim()` para que la nueva versión pueda tomar el control de los clientes activos.

De esta forma, la nueva versión se prepara antes de eliminar las versiones anteriores y se evita conservar cachés obsoletas.

## 10. Limitaciones y supuestos

* El comportamiento offline está limitado principalmente a las navegaciones.
* No se implementa sincronización de datos cuando vuelve la conexión.
* No se almacenan datos personales ni datos reales de inspecciones en la caché.
* Los datos del proyecto son sintéticos.
* Las solicitudes que no sean navegaciones no reciben actualmente una estrategia de caché específica.
* La estrategia depende de que los recursos definidos en el App Shell puedan almacenarse correctamente durante la instalación del Service Worker.
* La aplicación debe seguir verificando los cambios del Service Worker mediante las pruebas automatizadas existentes.

## 11. Integración con la aplicación

El registro del Service Worker se realiza mediante `src/lib/pwa/register-service-worker.ts`.

El componente `ServiceWorkerRegistration` se integra actualmente desde `src/app/layout.tsx`, por lo que el registro se realiza a nivel global de la aplicación.

Se conserva esta integración para evitar registrar el mismo Service Worker dos veces desde `AppShell`.

El registro utiliza `/sw.js` y un alcance `/`, permitiendo que el Service Worker controle las rutas de la aplicación.
