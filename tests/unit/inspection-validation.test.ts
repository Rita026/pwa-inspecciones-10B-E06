
import {
  validateInspectionForm,
  type InspectionFormData,
} from "../../src/lib/inspections/validation";

const validForm: InspectionFormData = {
  location: "Laboratorio de pruebas",
  date: "2026-10-24",
  inspector: "Técnica de prueba",
  status: "ok",
  findings: "0",
  summary: "Inspección de mantenimiento preventivo.",
};

describe("validateInspectionForm", () => {
  it("acepta un formulario válido", () => {
    expect(validateInspectionForm(validForm)).toEqual({});
  });

  it("rechaza campos obligatorios vacíos", () => {
    const errors = validateInspectionForm({
      ...validForm,
      location: "  ",
      inspector: "",
      summary: " ",
    });

    expect(errors.location).toBeDefined();
    expect(errors.inspector).toBeDefined();
    expect(errors.summary).toBeDefined();
  });

  it("rechaza una fecha inexistente", () => {
    const errors = validateInspectionForm({
      ...validForm,
      date: "2026-02-30",
    });

    expect(errors.date).toBeDefined();
  });

  it.each(["-1", "1.5", "abc", ""])(
    "rechaza el número de hallazgos %s",
    (findings) => {
      const errors = validateInspectionForm({
        ...validForm,
        findings,
      });

      expect(errors.findings).toBeDefined();
    }
  );

  it("acepta cero hallazgos", () => {
    expect(
      validateInspectionForm({ ...validForm, findings: "0" })
    ).toEqual({});
  });
});
