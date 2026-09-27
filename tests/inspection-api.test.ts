/**
 * @jest-environment node
 */
import { GET } from "../src/app/api/inspecciones/[id]/route";

function makeRequest(url: string) {
  return new Request(url);
}

describe("API /api/inspecciones/[id]", () => {
  it("regresa la inspección cuando el id existe", async () => {
    const response = await GET(makeRequest("http://localhost/api/inspecciones/inspection-001"), {
      params: { id: "inspection-001" },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.location).toBe("Laboratorio de Redes");
  });

  it("regresa 404 cuando el id no existe", async () => {
    const response = await GET(makeRequest("http://localhost/api/inspecciones/no-existe"), {
      params: { id: "no-existe" },
    });

    expect(response.status).toBe(404);
  });

  it("regresa 500 cuando se fuerza el escenario de error", async () => {
    const response = await GET(
      makeRequest("http://localhost/api/inspecciones/inspection-001?estado=error"),
      { params: { id: "inspection-001" } }
    );

    expect(response.status).toBe(500);
  });
});