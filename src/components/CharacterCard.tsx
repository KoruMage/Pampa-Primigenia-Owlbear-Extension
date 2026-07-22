import type { Player } from "@owlbear-rodeo/sdk";
import { Character, ESTABILIDAD_LABELS, SALUD_LABELS } from "../types";

interface CharacterCardProps {
  character: Character;
  players: Player[];
  selected: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}

function ownerName(ownerId: string | null, players: Player[]): string {
  if (!ownerId) return "Sin asignar";
  const p = players.find((pl) => pl.id === ownerId);
  return p ? p.name : "Asignado (offline)";
}

function countActive(values: Record<string, boolean>): number {
  return Object.values(values).filter(Boolean).length;
}

/** Tarjeta resumen de un personaje para el listado del GM. */
export function CharacterCard({
  character,
  players,
  selected,
  onSelect,
  onRemove,
}: CharacterCardProps) {
  const salud = countActive(character.salud);
  const estab = countActive(character.estabilidad);

  return (
    <div className={`card ${selected ? "card--selected" : ""}`}>
      <button type="button" className="card__main" onClick={onSelect}>
        <span className="card__name">{character.name || "Sin nombre"}</span>
        <span className="card__owner">{ownerName(character.ownerId, players)}</span>
        <span className="card__badges">
          <span className={`badge ${salud ? "badge--warn" : ""}`}>
            Salud {salud}/{SALUD_LABELS.length}
          </span>
          <span className={`badge ${estab ? "badge--warn" : ""}`}>
            Estab. {estab}/{ESTABILIDAD_LABELS.length}
          </span>
          <span className="badge">Guapura {character.guapura}</span>
        </span>
      </button>
      {onRemove && (
        <button
          type="button"
          className="card__remove"
          title="Eliminar personaje"
          onClick={onRemove}
        >
          x
        </button>
      )}
    </div>
  );
}
