"use client";

import { useEffect } from "react";

export const SERVICE_WORKER_URL = "/sw.js";

export async function registerServiceWorker(): Promise<
  ServiceWorkerRegistration | undefined
> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return undefined;
  }

  try {
    return await navigator.serviceWorker.register(SERVICE_WORKER_URL, {
      scope: "/"
    });
  } catch (error) {
    console.error("No se pudo registrar el service worker.", error);
    return undefined;
  }
}

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    void registerServiceWorker();
  }, []);

  return null;
}
