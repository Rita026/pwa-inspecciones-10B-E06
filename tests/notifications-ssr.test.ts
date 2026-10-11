/** @jest-environment node */

import {
  getNotificationState,
  requestNotificationPermission,
  showTestNotification,
} from "../src/lib/notifications/client";

it("permite importar y consultar el cliente durante SSR sin APIs del navegador", async () => {
  expect(typeof window).toBe("undefined");
  expect(getNotificationState()).toBe("unsupported");
  await expect(requestNotificationPermission()).resolves.toEqual({ status: "unsupported" });
  await expect(showTestNotification()).resolves.toEqual({ status: "unsupported" });
});
