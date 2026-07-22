// Posiciones de los 5 clavos, en porcentaje sobre el area total de la
// herradura (incluyendo el grosor del borde). Mismos valores que el diseno
// de referencia: Izq Sup, Izq Inf, Centro Top, Der Sup, Der Inf.
const NAIL_POSITIONS = [
  { left: 15, top: 30 },
  { left: 20, top: 54 },
  { left: 50, top: 12 },
  { left: 85, top: 30 },
  { left: 80, top: 54 },
];

interface HorseshoeTrackProps<T extends Record<string, boolean>> {
  title: string;
  values: T;
  labels: { key: keyof T; label: string }[];
  disabled?: boolean;
  onToggle: (key: keyof T, value: boolean) => void;
}

/**
 * Pista de condiciones con forma de herradura, como en la ficha original de
 * Pampa Primigenia. Requiere exactamente 5 labels (Salud o Estabilidad), en
 * orden de gravedad creciente. En vez de mostrar el nombre junto a cada
 * clavo, se muestra un solo texto debajo con el estado mas grave marcado.
 */
export function HorseshoeTrack<T extends Record<string, boolean>>({
  title,
  values,
  labels,
  disabled,
  onToggle,
}: HorseshoeTrackProps<T>) {
  const activeLabel = [...labels].reverse().find((l) => values[l.key])?.label;

  return (
    <div className="horseshoe">
      <h4 className="track__title">{title}</h4>
      <div className="horseshoe__frame">
        <div className="horseshoe__holes">
          {labels.map(({ key, label }, i) => {
            const pos = NAIL_POSITIONS[i];
            const active = values[key];
            return (
              <button
                key={String(key)}
                type="button"
                className={`nail ${active ? "rellena" : ""}`}
                style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
                disabled={disabled}
                aria-pressed={active}
                aria-label={label}
                title={label}
                onClick={() => onToggle(key, !active)}
              />
            );
          })}
        </div>
      </div>
      <p
        className={`horseshoe__status ${
          activeLabel ? "horseshoe__status--warn" : ""
        }`}
      >
        {activeLabel ?? "Sin novedad"}
      </p>
    </div>
  );
}
