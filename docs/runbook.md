# Runbook — recuperación ante versión defectuosa

## 1. Propósito y alcance

Procedimiento operativo para detectar una release mala de la PWA de inspecciones
(laboratorios, datos sintéticos), mitigar impacto y volver a una versión conocida
buena. Cubre imagen/contenedor, tag de release y Service Worker. No sustituye
monitoreo de producción empresarial ni recuperación de datos del dispositivo del usuario.

## 2. Síntomas de versión defectuosa

| Síntoma | Posible causa |
|---------|----------------|
| Smoke test o health check falla tras el deploy | Build roto, proceso caído, ruta crítica 5xx |
| Pantalla en blanco o error de JS en consola | Bundle defectuoso, CSP demasiado estricta, asset 404 |
| La UI no refleja el código nuevo | Service Worker sirve caché antigua |
| Offline “roto” o datos locales raros | SW/caché inconsistente; no implica corrupción de servidor |
| Dockerfile/healthcheck en rojo en CI | Imagen no arranca o puerto mal expuesto |

## 3. Versión identificable

Antes de cualquier rollback, anotar:

- Commit SHA de la release actual y de la anterior buena
- Tag git si existe (`vX.Y.Z`)
- Tag/digest de la imagen Docker si se desplegó con contenedor
- Hora aproximada del cambio y quién publicó

La versión debe poder leerse en el proceso de release (`docs/release-process.md`)
y, si el equipo la expone, en UI o variable de build.

## 4. Rollback de artefacto (contenedor / tag)

Si la app se sirve con la imagen del `Dockerfile`:

1. Identificar la **última imagen o tag conocido bueno**.
2. Redesplegar esa imagen (mismo comando de `docker run` / orquestador, tag anterior).
3. Comprobar health check (endpoint configurado en el Dockerfile) y el smoke test.
4. No reutilizar una imagen “mala” etiquetándola como latest sin documentarlo.

Si solo se publica por git/hosting estático o Node en servidor:

1. `git checkout` del tag/SHA bueno **en el entorno de despliegue** (o redesplegar ese commit).
2. `npm ci && npm run build && npm start` (o el flujo del release-process).
3. Verificar smoke.

## 5. Service Worker — actualización y recuperación

La PWA puede seguir sirviendo assets viejos aunque el servidor ya tenga código nuevo.

### 5.1 Forzar toma de control de un SW nuevo (cuando el deploy es bueno)

1. Asegurar que el servidor entrega el `sw.js` y los assets nuevos.
2. En el cliente: recarga (a veces hace falta una segunda visita para activar el SW en espera).
3. Si el proyecto registra el SW en el cliente, comprobar en DevTools → Application → Service Workers el estado *activated*.

### 5.2 Mitigar SW defectuoso o caché tóxica (versión mala en el cliente)

En Chrome/Edge DevTools (o equivalente):

1. Application → Service Workers → **Unregister** del SW del origen.
2. Application → Cache Storage → borrar cachés del origen relacionadas con la PWA.
3. Recarga dura (Ctrl+Shift+R) o ventana de incógnito para validar el HTML/JS del servidor.

Documentar al equipo: esto es **por origen y por perfil de navegador**; no limpia IndexedDB
de inspecciones a menos que el usuario borre datos del sitio a propósito.

### 5.3 Qué no hacer sin acuerdo

- No pedir a todos los usuarios “borrar todo el sitio” como primer paso (se pierden
  inspecciones pendientes en IndexedDB).
- No asumir que `robots.txt` o CSP “arreglan” un rollback.

## 6. Datos locales (IndexedDB)

Las inspecciones pendientes viven en el origen del navegador (`inspecciones-db`).

- Un rollback de **servidor/imagen** no borra ni repara IndexedDB del usuario.
- Tras volver a una versión buena de la app, la cola de sync debería volver a
  comportarse según `docs/sync-policy.md` (idempotencia, reintentos).
- Si una versión mala corrompió lógica de escritura, puede hacer falta guía manual
  al usuario (export/captura) — fuera del alcance automático de este runbook.

## 7. Checklist post-recuperación

- [ ] Health check / proceso en pie
- [ ] `tests/smoke.spec.ts` (o comando smoke del README) en verde
- [ ] Versión mostrada o tag coincide con la release buena
- [ ] SW: o bien actualizado, o unregistered y re-registrado de forma controlada
- [ ] Anotar en el canal del equipo: SHA malo, SHA restaurado, hora, síntoma

## 8. Límites y supuestos

1. No hay orquestador cloud obligatorio en el curso; el rollback se describe a nivel
   imagen Docker, tag git y navegador.
2. No hay autenticación de servidor en la API demo; el runbook no cubre rotación de
   credenciales de producción.
3. La recuperación del SW es **por cliente**; no hay push forzado a todos los dispositivos
   más allá de una buena política de actualización del propio SW.
4. Datos sintéticos en el repo; en un entorno real haría falta backup y comunicación a usuarios.

## 9. Relación con otros documentos

- Cómo se construye y etiqueta una release: `docs/release-process.md`
- Modelo de amenazas / límites de seguridad: `docs/threat-model.md`
- Sync offline: `docs/sync-policy.md`