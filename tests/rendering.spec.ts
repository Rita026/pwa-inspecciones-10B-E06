import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("renderizado CSR y SSR de inspecciones", () => {
  const listPage = readFileSync(
    resolve(process.cwd(), "src/app/inspecciones/page.tsx"),
    "utf8"
  );

  const detailPage = readFileSync(
    resolve(process.cwd(), "src/app/inspecciones/[id]/page.tsx"),
    "utf8"
  );

  it("mantiene el listado configurado como SSR", () => {
    expect(listPage).not.toContain('"use client"');
    expect(listPage).toContain("async function InspectionsPage");
    expect(listPage).toContain("getInspections()");
    expect(listPage).toContain('export const dynamic = "force-dynamic"');
    expect(listPage).toContain("Inspecciones");
  });

  it("mantiene el detalle configurado como CSR", () => {
    expect(detailPage).toContain('"use client"');
    expect(detailPage).toContain("useEffect");
    expect(detailPage).toContain("useState");
    expect(detailPage).toContain("useParams");
    expect(detailPage).toContain("fetch(");
    expect(detailPage).toContain("/api/inspecciones/");
  });

  it("conserva los estados principales del detalle CSR", () => {
    expect(detailPage).toContain('"loading"');
    expect(detailPage).toContain('"success"');
    expect(detailPage).toContain('"error"');
    expect(detailPage).toContain('"not-found"');
    expect(detailPage).toContain("Inspección no encontrada");
    expect(detailPage).toContain("Error al cargar la inspección");
  });
});