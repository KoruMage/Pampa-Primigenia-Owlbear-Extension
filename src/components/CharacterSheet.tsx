import type { Player } from "@owlbear-rodeo/sdk";
import {
  ATRIBUTOS_INFO,
  Character,
  DEGRADADO_PENALTY,
  ESTABILIDAD_LABELS,
  SALUD_LABELS,
} from "../types";
import { HorseshoeTrack } from "./HorseshoeTrack";
import { GuapuraTrack } from "./GuapuraTrack";
import { PlayerAssign } from "./PlayerAssign";

interface CharacterSheetProps {
  character: Character;
  editable: boolean;
  canAssign: boolean;
  players: Player[];
  onUpdate: (patch: Partial<Character>) => void;
  onAssign: (ownerId: string | null) => void;
}

/** Ficha completa editable de un personaje de Pampa Primigenia. */
export function CharacterSheet({
  character,
  editable,
  canAssign,
  players,
  onUpdate,
  onAssign,
}: CharacterSheetProps) {
  const ro = !editable;

  return (
    <div className="sheet">
      <div className="sheet__headline">
        <input
          className="sheet__name"
          value={character.name}
          readOnly={ro}
          placeholder="Nombre"
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
        {canAssign && (
          <PlayerAssign
            ownerId={character.ownerId}
            players={players}
            onAssign={onAssign}
          />
        )}
      </div>

      <div className="field">
        <label>Pertenencia particular</label>
        <input
          value={character.pertenencia}
          readOnly={ro}
          onChange={(e) => onUpdate({ pertenencia: e.target.value })}
        />
      </div>

      <div className="field">
        <label>Rasgo caracteristico</label>
        <input
          value={character.rasgo}
          readOnly={ro}
          onChange={(e) => onUpdate({ rasgo: e.target.value })}
        />
      </div>

      <div className="sheet__attrs">
        {ATRIBUTOS_INFO.map((info) => {
          const base = character.atributos[info.key];
          const degradado = character.degradado[info.degradadoKey];
          const effective = degradado ? base - DEGRADADO_PENALTY : base;
          return (
            <div key={info.key} className="attr">
              <div className="attr__row">
                <span className="attr__name">{info.label}</span>
                <input
                  className="attr__value"
                  type="number"
                  value={base}
                  readOnly={ro}
                  onChange={(e) =>
                    onUpdate({
                      atributos: {
                        ...character.atributos,
                        [info.key]: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
              <button
                type="button"
                className={`attr__degradado ${
                  degradado ? "attr__degradado--on" : ""
                }`}
                disabled={ro}
                aria-pressed={degradado}
                onClick={() =>
                  onUpdate({
                    degradado: {
                      ...character.degradado,
                      [info.degradadoKey]: !degradado,
                    },
                  })
                }
              >
                {info.degradadoLabel} (-{DEGRADADO_PENALTY})
              </button>
              <span className="attr__eff">
                = <strong>{effective}</strong>
              </span>
            </div>
          );
        })}
      </div>

      <GuapuraTrack
        value={character.guapura}
        disabled={ro}
        onChange={(guapura) => onUpdate({ guapura })}
      />

      <div className="sheet__tracks">
        <HorseshoeTrack
          title="Salud"
          values={character.salud}
          labels={SALUD_LABELS}
          disabled={ro}
          onToggle={(key, value) =>
            onUpdate({ salud: { ...character.salud, [key]: value } })
          }
        />
        <HorseshoeTrack
          title="Estabilidad"
          values={character.estabilidad}
          labels={ESTABILIDAD_LABELS}
          disabled={ro}
          onToggle={(key, value) =>
            onUpdate({
              estabilidad: { ...character.estabilidad, [key]: value },
            })
          }
        />
      </div>

      <div className="field">
        <label>Arreos y Aperos</label>
        <textarea
          value={character.arreos}
          readOnly={ro}
          rows={2}
          placeholder="Pertenencias, equipo, otros..."
          onChange={(e) => onUpdate({ arreos: e.target.value })}
        />
      </div>

      <div className="field">
        <label>Notas sobre su historia previa</label>
        <textarea
          value={character.notas}
          readOnly={ro}
          rows={3}
          placeholder="Edad, motivaciones, mayor pena o deseo..."
          onChange={(e) => onUpdate({ notas: e.target.value })}
        />
      </div>
    </div>
  );
}
