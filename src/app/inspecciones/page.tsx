import Link from "next/link";
import { getInspections } from "../../lib/data/inspections";

// Los datos se obtienen en cada solicitud para conservar este listado como SSR
// aun cuando la fuente sintética no usa APIs dinámicas de Next.js.
export const dynamic = "force-dynamic";

export default async function InspectionsPage() {
  const inspections = await getInspections();

  return (
    <main className="page-shell">
      <header className="content-section">
        <p className="eyebrow">Listado completo · Renderizado en servidor (SSR)</p>
        <h1>Inspecciones</h1>
        <p className="lead">
          Consulta todas las inspecciones sintéticas y abre cada registro para
          ver su detalle.
        </p>
        <span className="count">{inspections.length} registros</span>
      </header>

      <section aria-labelledby="inspection-list-heading" className="content-section">
        <h2 id="inspection-list-heading">Registros disponibles</h2>

        {inspections.length === 0 ? (
          <p className="empty-state" role="status">
            No hay inspecciones registradas por el momento.
          </p>
        ) : (
          <ul className="inspection-grid inspection-list">
            {inspections.map((inspection) => (
              <li key={inspection.id}>
                <Link
                  href={`/inspecciones/${encodeURIComponent(inspection.id)}`}
                  className="inspection-link"
                  aria-label={`Ver detalle de ${inspection.location}`}
                >
                  <article className="inspection-card">
                    <div className="card-topline">
                      <span className={`badge badge-${inspection.status}`}>
                        {inspection.statusLabel}
                      </span>
                      <time className="muted" dateTime={inspection.date}>
                        {inspection.date}
                      </time>
                    </div>
                    <h3>{inspection.location}</h3>
                    <p>{inspection.summary}</p>
                    <dl>
                      <div>
                        <dt>Responsable</dt>
                        <dd>{inspection.inspector}</dd>
                      </div>
                      <div>
                        <dt>Hallazgos</dt>
                        <dd>{inspection.findings}</dd>
                      </div>
                    </dl>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
