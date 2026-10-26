
export type InspectionFormData = {
  location: string;
  date: string;
  inspector: string;
  status: "ok" | "attention";
  findings: string;
  summary: string;
};

export type InspectionFormErrors = Partial<
  Record<keyof InspectionFormData, string>
>;

export function validateInspectionForm(
  data: InspectionFormData
): InspectionFormErrors {
  const errors: InspectionFormErrors = {};

  if (!data.location.trim()) {
    errors.location = "Escribe el lugar de la inspección.";
  }

  if (!data.inspector.trim()) {
    errors.inspector = "Escribe el nombre del responsable.";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.date = "Selecciona una fecha válida.";
  } else {
    const parsedDate = new Date(`${data.date}T00:00:00`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== data.date
    ) {
      errors.date = "Selecciona una fecha válida.";
    }
  }

  if (data.findings.trim() === "") {
    errors.findings = "Indica el número de hallazgos.";
  } else {
    const findings = Number(data.findings);

    if (!Number.isInteger(findings) || findings < 0) {
      errors.findings = "Los hallazgos deben ser un entero mayor o igual a cero.";
    }
  }

  if (!data.summary.trim()) {
    errors.summary = "Escribe un resumen de la inspección.";
  }

  if (data.status !== "ok" && data.status !== "attention") {
    errors.status = "Selecciona un estado válido.";
  }

  return errors;
}
