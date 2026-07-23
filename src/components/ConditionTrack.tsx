interface ConditionTrackProps<T extends Record<string, boolean>> {
  title: string;
  values: T;
  labels: { key: keyof T; label: string }[];
  disabled?: boolean;
  onChange: (values: T) => void;
}

/**
 * Pista de condiciones (Salud o Estabilidad), mostrada como puntos que se
 * van rellenando en orden de gravedad creciente, igual que Guapura. Debajo
 * se muestra el estado mas grave marcado.
 */
export function ConditionTrack<T extends Record<string, boolean>>({
  title,
  values,
  labels,
  disabled,
  onChange,
}: ConditionTrackProps<T>) {
  const filled = labels.filter((l) => values[l.key]).length;
  const activeLabel = filled > 0 ? labels[filled - 1].label : undefined;

  const setFilled = (n: number) => {
    const next = { ...values } as Record<string, boolean>;
    labels.forEach((l, i) => {
      next[l.key as string] = i < n;
    });
    onChange(next as T);
  };

  return (
    <div className="condition-track">
      <h4 className="track__title">{title}</h4>
      <div className="condition-track__pips">
        {labels.map((l, i) => {
          const active = i < filled;
          return (
            <button
              key={String(l.key)}
              type="button"
              className={`ring ${active ? "ring--on" : ""}`}
              disabled={disabled}
              aria-pressed={active}
              aria-label={l.label}
              title={l.label}
              onClick={() => setFilled(filled === i + 1 ? i : i + 1)}
            />
          );
        })}
      </div>
      <p className={`track__status ${activeLabel ? "track__status--warn" : ""}`}>
        {activeLabel ?? "Sin novedad"}
      </p>
    </div>
  );
}
