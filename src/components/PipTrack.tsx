interface PipTrackProps {
  title: string;
  value: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

/**
 * Contador generico de "clavos" (0..max) para trackear una reserva
 * numerica, como la meta currency de un playbook. Al hacer click en un
 * punto se rellena hasta ese punto; si se hace click en el ultimo relleno,
 * se vacia uno.
 */
export function PipTrack({ title, value, max, disabled, onChange }: PipTrackProps) {
  return (
    <div className="metatrack">
      <h4 className="track__title">{title}</h4>
      <div className="metatrack__rings">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < value;
          return (
            <button
              key={i}
              type="button"
              className={`ring ${filled ? "ring--on" : ""}`}
              disabled={disabled}
              aria-pressed={filled}
              aria-label={`${title} ${i + 1}`}
              onClick={() => onChange(value === i + 1 ? i : i + 1)}
            />
          );
        })}
      </div>
    </div>
  );
}
