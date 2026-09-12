import { getInspections, type InspectionScenario } from "../lib/data/inspections";

type HomePageProps = {
  searchParams?: { estado?: string };
};

function parseScenario(value: string | undefined): InspectionScenario {
  if (value === "vacio") return "empty";
  if (value === "error") return "error";
  return "ok";
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const scenario = parseScenario(searchParams?.estado);
  const inspections = await getInspections(scenario);

  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">Proyecto base · Semana 2</p>
        <h1>Inspecciones de laboratorio</h1>
        <p className="lead">
          Registro de mantenimiento para trabajar con conectividad intermitente.
          Los datos mostrados son sintéticos.
        </p>
        <span className="status">Estado del starter: shell instalable · PWA en construcción</span>
      </header>

      <section aria-labelledby="inspections-heading" className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Datos de demostración</p>
            <h2 id="inspections-heading">Inspecciones recientes</h2>
          </div>
          <span className="count">{inspections.length} registros</span>
        </div>

        {inspections.length === 0 ? (
          <p className="empty-state" role="status">
            No hay inspecciones registradas por el momento. Vuelve a intentarlo
            más tarde o revisa la conexión.
          </p>
        ) : (
          <div className="inspection-grid">
            {inspections.map((inspection) => (
              <article className="inspection-card" key={inspection.id}>
                <div className="card-topline">
                  <span className={`badge badge-${inspection.status}`}>{inspection.statusLabel}</span>
                  <span className="muted">{inspection.date}</span>
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
            ))}
          </div>
        )}
      </section>

      <nav aria-label="Escenarios de demostración" className="demo-nav">
        <p className="muted">Probar estados (demostración para evaluación):</p>
        <a href="/">Con datos</a>{" "}
        <a href="/?estado=vacio">Vacío</a>{" "}
        <a href="/?estado=error">Error</a>
      </nav>

      <footer className="footer">
        <p>Aplicaciones Web Progresivas · Universidad Tecnológica de Tehuacán</p>
      </footer>
    </main>
  );
}