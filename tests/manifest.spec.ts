import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

type ManifestIcon = {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
};

type WebManifest = {
  name: string;
  short_name: string;
  start_url: string;
  scope: string;
  display: string;
  background_color: string;
  theme_color: string;
  icons: ManifestIcon[];
};

const manifestPath = resolve(process.cwd(), "public", "manifest.webmanifest");

async function readManifest(): Promise<WebManifest> {
  const content = await readFile(manifestPath, "utf8");
  return JSON.parse(content) as WebManifest;
}

describe("manifest.webmanifest", () => {
  it("define la identidad y el modo instalable de la aplicación", async () => {
    const manifest = await readManifest();

    expect(manifest.name).toBe("Inspecciones de laboratorio");
    expect(manifest.short_name).toBe("Inspecciones");
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.background_color).toBe("#f4f7fb");
    expect(manifest.theme_color).toBe("#3156d3");
  });

  it("declara los iconos de 192 y 512 px disponibles en la aplicación", async () => {
    const manifest = await readManifest();

    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/icons/inspecciones-192.svg",
          sizes: "192x192",
          type: "image/svg+xml"
        }),
        expect.objectContaining({
          src: "/icons/inspecciones-512.svg",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "any maskable"
        })
      ])
    );
  });
});
