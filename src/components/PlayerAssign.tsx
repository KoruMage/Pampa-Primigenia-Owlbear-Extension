import type { Player } from "@owlbear-rodeo/sdk";

interface PlayerAssignProps {
  ownerId: string | null;
  players: Player[];
  onAssign: (ownerId: string | null) => void;
}

/**
 * Dropdown para asignar un personaje a un jugador conectado (solo GM).
 * Si el jugador asignado ya no esta conectado, se muestra igual para no
 * perder la asignacion guardada.
 */
export function PlayerAssign({ ownerId, players, onAssign }: PlayerAssignProps) {
  const knownIds = new Set(players.map((p) => p.id));
  const assignedButOffline = ownerId && !knownIds.has(ownerId);

  return (
    <label className="assign">
      <span className="assign__label">Jugador</span>
      <select
        className="assign__select"
        value={ownerId ?? ""}
        onChange={(e) => onAssign(e.target.value || null)}
      >
        <option value="">Sin asignar</option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
            {p.role === "GM" ? " (GM)" : ""}
          </option>
        ))}
        {assignedButOffline && (
          <option value={ownerId}>Asignado (desconectado)</option>
        )}
      </select>
    </label>
  );
}
