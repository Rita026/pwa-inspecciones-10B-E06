type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Cargando…" }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className="loading-state">
      <span className="loading-spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}