import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import NotificationsDemoPanel from "../src/components/notifications-demo-panel";
import {
  getNotificationState,
  requestNotificationPermission,
  showTestNotification,
  type NotificationPermissionResult,
  type NotificationState
} from "../src/lib/notifications/client";

jest.mock("../src/lib/notifications/client", () => ({
  getNotificationState: jest.fn(),
  requestNotificationPermission: jest.fn(),
  showTestNotification: jest.fn()
}));

const permissionButton = () => screen.getByRole("button", { name: "Pedir permiso de notificaciones" });
const testButton = () => screen.getByRole("button", { name: "Mostrar notificación de prueba" });

describe("panel de notificaciones", () => {
  let permission: NotificationState;

  beforeEach(() => {
    jest.resetAllMocks();
    permission = "default";
    jest.mocked(getNotificationState).mockImplementation(() => permission);
  });

  it("no pide permiso ni envía notificaciones al montar; habilita la prueba solo tras conceder permiso", async () => {
    jest.mocked(requestNotificationPermission).mockImplementation(async () => {
      permission = "granted";
      return { status: "granted" };
    });
    jest.mocked(showTestNotification).mockResolvedValue({ status: "sent" });
    render(<NotificationsDemoPanel />);

    expect(requestNotificationPermission).not.toHaveBeenCalled();
    expect(showTestNotification).not.toHaveBeenCalled();
    expect(permissionButton()).toBeEnabled();
    expect(testButton()).toBeDisabled();

    fireEvent.click(permissionButton());
    await waitFor(() => expect(testButton()).toBeEnabled());
    expect(permissionButton()).toBeDisabled();
    expect(requestNotificationPermission).toHaveBeenCalledTimes(1);
    expect(showTestNotification).not.toHaveBeenCalled();

    fireEvent.click(testButton());
    expect(await screen.findByText(/Notificación de prueba enviada al navegador/)).toBeInTheDocument();
    expect(showTestNotification).toHaveBeenCalledTimes(1);
    expect(requestNotificationPermission).toHaveBeenCalledTimes(1);
  });

  it("permite reintentar después de cerrar el diálogo sin conceder permiso", async () => {
    jest.mocked(requestNotificationPermission).mockResolvedValue({ status: "default" });
    render(<NotificationsDemoPanel />);
    fireEvent.click(permissionButton());
    await waitFor(() => expect(permissionButton()).toBeEnabled());
    expect(screen.getByRole("status")).toHaveTextContent(/Permiso sin conceder/);
    expect(testButton()).toBeDisabled();
    expect(showTestNotification).not.toHaveBeenCalled();
  });

  it.each([
    ["denied", /Notificaciones bloqueadas/],
    ["unsupported", /Este navegador no admite/],
    ["insecure", /HTTPS o localhost/]
  ] as const)("muestra un fallback para %s sin invocar APIs de permiso o envío", (state, message) => {
    permission = state;
    render(<NotificationsDemoPanel />);
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(permissionButton()).toBeDisabled();
    expect(testButton()).toBeDisabled();
    expect(requestNotificationPermission).not.toHaveBeenCalled();
    expect(showTestNotification).not.toHaveBeenCalled();
  });

  it("refleja la denegación después del clic y no insiste", async () => {
    jest.mocked(requestNotificationPermission).mockImplementation(async () => {
      permission = "denied";
      return { status: "denied" };
    });
    render(<NotificationsDemoPanel />);
    fireEvent.click(permissionButton());
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/Notificaciones bloqueadas/));
    expect(permissionButton()).toBeDisabled();
    expect(testButton()).toBeDisabled();
    expect(showTestNotification).not.toHaveBeenCalled();
  });

  it("impide solicitudes duplicadas mientras el diálogo sigue abierto", async () => {
    let resolvePermission!: (result: NotificationPermissionResult) => void;
    jest.mocked(requestNotificationPermission).mockReturnValue(new Promise((resolve) => {
      resolvePermission = resolve;
    }));
    render(<NotificationsDemoPanel />);
    fireEvent.click(permissionButton());
    fireEvent.click(permissionButton());
    expect(permissionButton()).toBeDisabled();
    expect(testButton()).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Procesando solicitud…");
    expect(requestNotificationPermission).toHaveBeenCalledTimes(1);
    await act(async () => resolvePermission({ status: "default" }));
    expect(permissionButton()).toBeEnabled();
  });

  it("informa que el servicio aún no está listo y permite reintentar", async () => {
    permission = "granted";
    jest.mocked(showTestNotification).mockResolvedValue({ status: "unavailable" });
    render(<NotificationsDemoPanel />);
    fireEvent.click(testButton());
    expect(await screen.findByText(/El servicio de notificaciones aún no está listo/)).toBeInTheDocument();
    expect(testButton()).toBeEnabled();
    expect(screen.getByRole("status")).not.toHaveTextContent(/enviada al navegador/);
  });

  it("anuncia el fallo de envío y recupera los controles", async () => {
    permission = "granted";
    jest.mocked(showTestNotification).mockResolvedValue({ status: "error", message: "No se pudo enviar la notificación." });
    render(<NotificationsDemoPanel />);
    fireEvent.click(testButton());
    expect(await screen.findByText("No se pudo enviar la notificación.")).toBeInTheDocument();
    expect(testButton()).toBeEnabled();
  });

  it("recupera el botón incluso ante un rechazo inesperado", async () => {
    jest.mocked(requestNotificationPermission).mockRejectedValue(new Error("Fallo simulado"));
    render(<NotificationsDemoPanel />);
    fireEvent.click(permissionButton());
    expect(await screen.findByText(/No se pudo completar la prueba/)).toBeInTheDocument();
    expect(permissionButton()).toBeEnabled();
  });

  it("vuelve a consultar el permiso al recuperar el foco, sin abrir otro diálogo", () => {
    permission = "denied";
    render(<NotificationsDemoPanel />);
    permission = "granted";
    fireEvent(window, new Event("focus"));
    expect(testButton()).toBeEnabled();
    expect(requestNotificationPermission).not.toHaveBeenCalled();
    permission = "denied";
    fireEvent(window, new Event("focus"));
    expect(testButton()).toBeDisabled();
  });
});
