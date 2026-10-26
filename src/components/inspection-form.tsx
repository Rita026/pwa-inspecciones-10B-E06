
"use client";

import { useState, type FormEvent } from "react";
import { queueInspection } from "../lib/sync/queue";
import { requestCurrentPosition } from "../lib/device/geolocation";
import {
  validateInspectionForm,
  type InspectionFormData,
  type InspectionFormErrors,
} from "../lib/inspections/validation";
import type { InspectionCoordinates } from "../lib/storage/schema";

const initialForm: InspectionFormData = {
  location: "",
  date: new Date().toISOString().slice(0, 10),
  inspector: "",
  status: "ok",
  findings: "0",
  summary: "",
};

export default function InspectionForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<InspectionFormErrors>({});
  const [coordinates, setCoordinates] =
    useState<InspectionCoordinates | null>(null);
  const [locationMessage, setLocationMessage] = useState(
    "La ubicación del dispositivo es opcional."
  );
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  function updateField<K extends keyof InspectionFormData>(
    field: K,
    value: InspectionFormData[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFeedback("");
  }

  async function handleLocation() {
    setLocating(true);
    setLocationMessage("Consultando ubicación del dispositivo...");
    setCoordinates(null);

    try {
      const result = await requestCurrentPosition();

      if (result.status === "granted") {
        setCoordinates(result.coords);
        setLocationMessage("Ubicación obtenida correctamente.");
      } else if (result.status === "denied") {
        setLocationMessage(
          "Permiso denegado. Puedes guardar la inspección sin ubicación."
        );
      } else if (result.status === "unsupported") {
        setLocationMessage(
          "Este dispositivo no admite geolocalización. Puedes continuar sin ella."
        );
      } else {
        setLocationMessage(
          "No se pudo obtener la ubicación. Puedes continuar sin ella."
        );
      }
    } catch {
      setLocationMessage(
        "No se pudo consultar la ubicación. Puedes continuar sin ella."
      );
    } finally {
      setLocating(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    const validationErrors = validateInspectionForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setFeedback("Revisa los campos señalados antes de guardar.");
      return;
    }

    setSaving(true);

    try {
      await queueInspection({
        location: form.location.trim(),
        date: form.date,
        inspector: form.inspector.trim(),
        status: form.status,
        statusLabel:
          form.status === "ok" ? "Sin incidencias" : "Requiere atención",
        findings: Number(form.findings),
        summary: form.summary.trim(),
        ...(coordinates ? { coordinates } : {}),
      });

      setForm({
        ...initialForm,
        date: new Date().toISOString().slice(0, 10),
      });
      setErrors({});
      setCoordinates(null);
      setLocationMessage("La ubicación del dispositivo es opcional.");
      setFeedback(
        "Inspección guardada localmente y pendiente de sincronización."
      );
    } catch {
      setFeedback(
        "No se pudo guardar la inspección. Revisa el almacenamiento del navegador e inténtalo de nuevo."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="inspection-form-panel" aria-labelledby="create-inspection-heading">
      <p className="eyebrow">Nuevo registro</p>
      <h2 id="create-inspection-heading">Registrar inspección</h2>
      <p className="form-description">
        Completa los datos de la inspección. La ubicación del dispositivo
        es opcional y no impide guardar el registro.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="inspection-location">Lugar de inspección</label>
            <input
              id="inspection-location"
              name="location"
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              aria-invalid={Boolean(errors.location)}
              aria-describedby={errors.location ? "location-error" : undefined}
              required
            />
            {errors.location && (
              <p id="location-error" className="field-error">{errors.location}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="inspection-inspector">Responsable</label>
            <input
              id="inspection-inspector"
              name="inspector"
              value={form.inspector}
              onChange={(event) => updateField("inspector", event.target.value)}
              aria-invalid={Boolean(errors.inspector)}
              aria-describedby={errors.inspector ? "inspector-error" : undefined}
              required
            />
            {errors.inspector && (
              <p id="inspector-error" className="field-error">{errors.inspector}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="inspection-date">Fecha</label>
            <input
              id="inspection-date"
              name="date"
              type="date"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? "date-error" : undefined}
              required
            />
            {errors.date && (
              <p id="date-error" className="field-error">{errors.date}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="inspection-status">Estado</label>
            <select
              id="inspection-status"
              name="status"
              value={form.status}
              onChange={(event) =>
                updateField("status", event.target.value as "ok" | "attention")
              }
            >
              <option value="ok">Sin incidencias</option>
              <option value="attention">Requiere atención</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="inspection-findings">Número de hallazgos</label>
            <input
              id="inspection-findings"
              name="findings"
              type="number"
              min="0"
              step="1"
              value={form.findings}
              onChange={(event) => updateField("findings", event.target.value)}
              aria-invalid={Boolean(errors.findings)}
              aria-describedby={errors.findings ? "findings-error" : undefined}
              required
            />
            {errors.findings && (
              <p id="findings-error" className="field-error">{errors.findings}</p>
            )}
          </div>

          <div className="form-field form-field-wide">
            <label htmlFor="inspection-summary">Resumen</label>
            <textarea
              id="inspection-summary"
              name="summary"
              rows={4}
              value={form.summary}
              onChange={(event) => updateField("summary", event.target.value)}
              aria-invalid={Boolean(errors.summary)}
              aria-describedby={errors.summary ? "summary-error" : undefined}
              required
            />
            {errors.summary && (
              <p id="summary-error" className="field-error">{errors.summary}</p>
            )}
          </div>
        </div>

        <div className="location-controls">
          <button
            type="button"
            className="form-secondary-button"
            onClick={handleLocation}
            disabled={locating || saving}
          >
            {locating ? "Consultando..." : "Obtener ubicación del dispositivo"}
          </button>
          <p className="location-message" role="status" aria-live="polite">
            {locationMessage}
          </p>
          {coordinates && (
            <p className="location-message">
              Coordenadas obtenidas: {coordinates.latitude.toFixed(5)},{" "}
              {coordinates.longitude.toFixed(5)}
            </p>
          )}
        </div>

        {feedback && (
          <p className="form-feedback" role="status" aria-live="polite">
            {feedback}
          </p>
        )}

        <button className="form-submit-button" type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar inspección"}
        </button>
      </form>
    </section>
  );
}
