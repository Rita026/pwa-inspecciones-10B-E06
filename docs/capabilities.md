# Capacidades del dispositivo — Semana 6

## Notificaciones — Enrique Julian Gracia López

Esta sección documenta el cliente de notificaciones y su UI mínima de prueba.
El panel usa exclusivamente un mensaje sintético y no requiere datos de una
inspección real.

### Implementación y permisos mínimos

- [`src/lib/notifications/client.ts`](../src/lib/notifications/client.ts)
  consulta soporte y permiso, solicita autorización y envía la prueba local.
- [`src/components/notifications-demo-panel.tsx`](../src/components/notifications-demo-panel.tsx)
  presenta las acciones y sus resultados en la portada.
- `getNotificationState()` consulta el estado sin solicitar permisos y puede
  ejecutarse durante SSR sin acceder a APIs inexistentes del navegador.
- `requestNotificationPermission()` se llama directamente desde el botón
  «Pedir permiso de notificaciones». No hay una espera antes de invocar la API
  del navegador. Solo abre la solicitud cuando el estado es `default`.
- `showTestNotification()` exige un permiso ya concedido. Consulta el registro
  existente mediante `navigator.serviceWorker.getRegistration()` y usa
  `registration.showNotification()` cuando el Service Worker está activo.

La carga de la página no solicita permisos ni muestra notificaciones. No se
piden permisos de cámara o ubicación desde este panel. Una denegación no
bloquea el uso de las inspecciones y no provoca solicitudes repetidas.

### Estados y fallback

| Estado | Comportamiento |
| --- | --- |
| `default` | Permite pedir permiso; el botón de prueba permanece deshabilitado. Si el navegador devuelve este estado al cerrar el diálogo, se puede reintentar. |
| `granted` | Habilita la notificación de prueba sin volver a pedir permiso. |
| `denied` | Deshabilita ambas acciones y explica cómo cambiar el permiso en la configuración del sitio. |
| `unsupported` | Informa que las APIs necesarias no están disponibles; se puede continuar usando la aplicación. |
| `insecure` | Indica que se debe abrir la aplicación en HTTPS o localhost. |
| `unavailable` | No hay un Service Worker activo; indica esperar y reintentar, o recargar con conexión si persiste. |
| `error` | Presenta el fallo de permiso o envío y recupera los controles para reintentar. |
| `sent` | La API aceptó la solicitud. El sistema operativo decide si presenta un aviso visible. |

Mientras una solicitud está pendiente, los dos botones quedan deshabilitados
y una referencia evita clics duplicados. Los resultados se anuncian mediante
`role="status"` y `aria-live="polite"`. Al recuperar el foco se consulta el
permiso actual para reflejar cambios hechos en la configuración del navegador.

### Decisiones, supuestos y límites

Se reutiliza el Service Worker que ya registra la aplicación. La prueba no
registra otro ni modifica su lógica. Se consulta `getRegistration()` en lugar
de esperar `serviceWorker.ready`, que puede quedar pendiente si no existe un
registro activo. Esto permite mostrar un estado recuperable.

Se eligió `showNotification()` para aprovechar ese registro. La prueba depende
de HTTPS o localhost, de soporte de Notifications y Service Workers y de la
autorización del navegador. Si falta una capacidad, el fallback es el mensaje
visible del panel; no se intenta forzar la autorización.

La notificación tiene un título y cuerpo fijos, sintéticos, y la etiqueta
`inspecciones-prueba` para sustituir avisos anteriores de la misma prueba.
No hay backend, suscripciones push, programación de avisos ni envío de datos.
El modo No molestar o los ajustes del sistema pueden impedir ver un aviso
aunque la API acepte la solicitud. Tampoco se implementa una acción al pulsar
la notificación.

El Service Worker actual no precachea los paquetes JavaScript de Next.js.
Por ello una recarga completamente sin red no garantiza que el panel sea
interactivo; esta contribución no modifica la estrategia de caché.

### Pruebas reproducibles

```bash
npm ci
npm run test:unit -- --runInBand tests/capabilities.spec.ts tests/notifications-ssr.test.ts tests/notifications-demo-panel.test.tsx
make verify
```

En PowerShell se puede usar `npm.cmd`; si Make no está instalado,
`npm.cmd run verify` es el equivalente exacto según el Makefile.

Las 34 pruebas de esta contribución se distribuyen así:

- `tests/capabilities.spec.ts`: 22 casos del cliente de notificaciones, incluidos
  permisos, falta de soporte, contexto inseguro, registro inactivo, errores y
  envío del mensaje sintético. Esta sección de capacidades cubre notificaciones.
- `tests/notifications-ssr.test.ts`: 1 caso sin `window`.
- `tests/notifications-demo-panel.test.tsx`: 11 casos de interacción, estado de
  los botones, ausencia de solicitudes automáticas, fallbacks y clics duplicados.

Las APIs del navegador se simulan en Jest. Estas pruebas no demuestran que el
sistema operativo muestre una notificación nativa ni prueban cámara o ubicación.

Para la comprobación manual, ejecutar `npm run dev` y abrir
`http://localhost:3000`:

1. Abrir la portada con el permiso del sitio restablecido. La carga por sí sola
   no debe solicitarlo y la prueba debe estar deshabilitada.
2. Pulsar «Pedir permiso de notificaciones» y aceptar. Pulsar después
   «Mostrar notificación de prueba»; comprobar el mensaje del panel y el aviso
   sintético del sistema.
3. Bloquear el permiso desde la configuración del sitio y volver al panel o
   recargar. Debe aparecer el fallback sin abrir otra solicitud.
4. Si el navegador permite cerrar el diálogo conservando `default`, comprobar
   que solo se vuelve a solicitar mediante otro clic explícito.

La revisión automatizada en un navegador aislado confirmó el estado inicial,
el Service Worker activo, el fallback con permiso denegado y el panel a 390 px
sin desbordamiento horizontal. Sigue pendiente la comprobación humana del aviso
nativo con permiso concedido. Ver la evidencia individual de Enrique en
[`evidence/individual.md`](../evidence/individual.md), Semana 6.

### Referencias

- [MDN: solicitar permiso](https://developer.mozilla.org/en-US/docs/Web/API/Notification/requestPermission_static).
- [MDN: mostrar una notificación con el registro](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification).
- [MDN: consultar el registro existente](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/getRegistration).
