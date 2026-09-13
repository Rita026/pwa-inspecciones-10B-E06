import { getInspections } from "../src/lib/data/inspections";

describe("getInspections", () => {
  it("regresa las 3 inspecciones sintéticas en el escenario 'ok'", async () => {
    const result = await getInspections("ok");
    expect(result).toHaveLength(3);
    expect(result[0]).toHaveProperty("location");
  });

  it("regresa un arreglo vacío en el escenario 'empty'", async () => {
    const result = await getInspections("empty");
    expect(result).toEqual([]);
  });

  it("lanza un error en el escenario 'error'", async () => {
    await expect(getInspections("error")).rejects.toThrow(
      "No se pudo obtener el listado de inspecciones."
    );
  });
});