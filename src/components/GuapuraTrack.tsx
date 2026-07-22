import { GUAPURA_MAX } from "../types";

interface GuapuraTrackProps {
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

/**
 * Los tres anillos de Guapura. Al hacer click en un anillo se rellena hasta
 * ese punto; si se hace click en el ultimo relleno, se vacia uno.
 */
export function GuapuraTrack({ value, disabled, onChange }: GuapuraTrackProps) {
  return (
    <div className="guapura">
      <h4 className="track__title">Guapura</h4>
      <div className="guapura__rings">
        {Array.from({ length: GUAPURA_MAX }).map((_, i) => {
          const filled = i < value;
          return (
            <button
              key={i}
              type="button"
              className={`ring ${filled ? "ring--on" : ""}`}
              disabled={disabled}
              aria-pressed={filled}
              aria-label={`Guapura ${i + 1}`}
              onClick={() => onChange(value === i + 1 ? i : i + 1)}
            />
          );
        })}
      </div>
    </div>
  );
}
