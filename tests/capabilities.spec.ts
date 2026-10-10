// Semana 6: contribución de Enrique, capacidad de notificaciones.
import {
  getNotificationState,
  requestNotificationPermission,
  showTestNotification,
} from "../src/lib/notifications/client";

const originalNotification = Object.getOwnPropertyDescriptor(window, "Notification");
const originalSecureContext = Object.getOwnPropertyDescriptor(window, "isSecureContext");
const originalServiceWorker = Object.getOwnPropertyDescriptor(navigator, "serviceWorker");

let requestPermission: jest.Mock;
let getRegistration: jest.Mock;
let showNotification: jest.Mock;
let register: jest.Mock;
let update: jest.Mock;
let subscribe: jest.Mock;

function setPermission(permission: NotificationPermission) {
  Object.defineProperty(window, "Notification", {
    configurable: true,
    value: { permission, requestPermission },
  });
}

function restoreProperty(target: object, key: string, descriptor?: PropertyDescriptor) {
  if (descriptor) Object.defineProperty(target, key, descriptor);
  else Reflect.deleteProperty(target, key);
}

beforeEach(() => {
  requestPermission = jest.fn().mockResolvedValue("granted");
  showNotification = jest.fn().mockResolvedValue(undefined);
  register = jest.fn();
  update = jest.fn();
  subscribe = jest.fn();
  getRegistration = jest.fn().mockResolvedValue({
    active: {},
    showNotification,
    update,
    pushManager: { subscribe },
  });
  Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: { getRegistration, register },
  });
  setPermission("default");
});

afterEach(() => {
  restoreProperty(window, "Notification", originalNotification);
  restoreProperty(window, "isSecureContext", originalSecureContext);
  restoreProperty(navigator, "serviceWorker", originalServiceWorker);
});

describe("consulta y permiso de notificaciones", () => {
  it.each(["default", "granted", "denied"] as const)(
    "consulta el estado %s sin abrir un diálogo ni acceder al service worker",
    (permission) => {
      setPermission(permission);
      expect(getNotificationState()).toBe(permission);
      expect(requestPermission).not.toHaveBeenCalled();
      expect(getRegistration).not.toHaveBeenCalled();
    },
  );

  it("ofrece fallback si Notification no existe", async () => {
    Reflect.deleteProperty(window, "Notification");
    expect(getNotificationState()).toBe("unsupported");
    await expect(requestNotificationPermission()).resolves.toEqual({ status: "unsupported" });
    await expect(showTestNotification()).resolves.toEqual({ status: "unsupported" });
    expect(requestPermission).not.toHaveBeenCalled();
    expect(getRegistration).not.toHaveBeenCalled();
  });

  it("no solicita ni envía notificaciones fuera de un contexto seguro", async () => {
    setPermission("granted");
    Object.defineProperty(window, "isSecureContext", { configurable: true, value: false });
    expect(getNotificationState()).toBe("insecure");
    await expect(requestNotificationPermission()).resolves.toEqual({ status: "insecure" });
    await expect(showTestNotification()).resolves.toEqual({ status: "insecure" });
    expect(requestPermission).not.toHaveBeenCalled();
    expect(getRegistration).not.toHaveBeenCalled();
  });

  it.each(["granted", "denied"] as const)(
    "respeta el permiso %s sin volver a pedirlo",
    async (permission) => {
      setPermission(permission);
      await expect(requestNotificationPermission()).resolves.toEqual({ status: permission });
      expect(requestPermission).not.toHaveBeenCalled();
    },
  );

  it.each(["default", "denied", "granted"] as const)(
    "solicita desde default y conserva la respuesta %s, incluso al cerrar el diálogo",
    async (permission) => {
      requestPermission.mockResolvedValue(permission);
      const result = requestNotificationPermission();
      // La llamada ocurre antes del primer await para conservar el gesto del clic.
      expect(requestPermission).toHaveBeenCalledTimes(1);
      await expect(result).resolves.toEqual({ status: permission });
      expect(showNotification).not.toHaveBeenCalled();
    },
  );

  it("ofrece fallback si falta el método para pedir permiso", async () => {
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: { permission: "default" },
    });
    await expect(requestNotificationPermission()).resolves.toEqual({ status: "unsupported" });
  });

  it("devuelve un error recuperable si falla la solicitud de permiso", async () => {
    requestPermission.mockRejectedValue(new Error("Permiso no disponible"));
    await expect(requestNotificationPermission()).resolves.toEqual({
      status: "error",
      message: expect.any(String),
    });
    expect(getRegistration).not.toHaveBeenCalled();
  });
});

describe("notificación local de prueba", () => {
  it.each(["default", "denied"] as const)(
    "no pide permiso ni busca un registro cuando el permiso es %s",
    async (permission) => {
      setPermission(permission);
      await expect(showTestNotification()).resolves.toEqual({ status: permission });
      expect(requestPermission).not.toHaveBeenCalled();
      expect(getRegistration).not.toHaveBeenCalled();
      expect(showNotification).not.toHaveBeenCalled();
    },
  );

  it("ofrece fallback si no hay soporte de service worker", async () => {
    setPermission("granted");
    Reflect.deleteProperty(navigator, "serviceWorker");
    await expect(showTestNotification()).resolves.toEqual({ status: "unsupported" });
    expect(showNotification).not.toHaveBeenCalled();
  });

  it("ofrece fallback si falta getRegistration", async () => {
    setPermission("granted");
    Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: {} });
    await expect(showTestNotification()).resolves.toEqual({ status: "unsupported" });
  });

  it.each([undefined, { active: null }])(
    "permite reintentar si no hay un registro activo: %p",
    async (registration) => {
      setPermission("granted");
      getRegistration.mockResolvedValue(registration);
      await expect(showTestNotification()).resolves.toEqual({ status: "unavailable" });
      expect(showNotification).not.toHaveBeenCalled();
      expect(register).not.toHaveBeenCalled();
    },
  );

  it("devuelve un error recuperable si falla la consulta del registro", async () => {
    setPermission("granted");
    getRegistration.mockRejectedValue(new Error("Registro inaccesible"));
    await expect(showTestNotification()).resolves.toEqual({
      status: "error",
      message: expect.any(String),
    });
    expect(showNotification).not.toHaveBeenCalled();
  });

  it("ofrece fallback si el registro no puede mostrar notificaciones", async () => {
    setPermission("granted");
    getRegistration.mockResolvedValue({ active: {} });
    await expect(showTestNotification()).resolves.toEqual({ status: "unsupported" });
  });

  it("devuelve un error recuperable si el navegador rechaza el envío", async () => {
    setPermission("granted");
    showNotification.mockRejectedValue(new Error("Envío rechazado"));
    await expect(showTestNotification()).resolves.toEqual({
      status: "error",
      message: expect.any(String),
    });
  });

  it("envía datos sintéticos con etiqueta fija usando el registro existente y sin push", async () => {
    setPermission("granted");
    await expect(showTestNotification()).resolves.toEqual({ status: "sent" });
    expect(getRegistration).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledWith("Inspecciones · Prueba de notificación", {
      body: "Notificación local con datos sintéticos. No hay una incidencia real.",
      tag: "inspecciones-prueba",
      lang: "es",
    });
    expect(requestPermission).not.toHaveBeenCalled();
    expect(register).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(subscribe).not.toHaveBeenCalled();
  });
});
