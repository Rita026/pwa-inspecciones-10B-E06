export default function Loading() {
  return (
    <main className="page-shell" aria-busy="true" aria-live="polite">
      <section className="content-section">
        <p className="eyebrow">Cargando</p>
        <h2>Obteniendo inspecciones…</h2>
        <p className="lead">
          Estamos consultando el listado de inspecciones. Esto puede tardar unos
          segundos si la conexión es intermitente.
        </p>
      </section>
    </main>
  );
}