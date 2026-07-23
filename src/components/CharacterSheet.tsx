import { useEffect, useRef, useState } from "react";
import type { Player } from "@owlbear-rodeo/sdk";
import {
  ATRIBUTOS_INFO,
  Character,
  DEGRADADO_PENALTY,
  ESTABILIDAD_LABELS,
  GUAPURA_MAX,
  PLAYBOOK_META_MAX,
  PLAYBOOKS,
  SALUD_LABELS,
} from "../types";
import { downloadJSON, slugifyFilename } from "../utils/download";
import { ConditionTrack } from "./ConditionTrack";
import { DiceRoller, DiceRollerHandle, DiceRollSummary } from "./DiceRoller";
import { Experiences } from "./Experiences";
import { GuapuraTrack } from "./GuapuraTrack";
import { PipTrack } from "./PipTrack";
import { PlayerAssign } from "./PlayerAssign";

interface CharacterSheetProps {
  character: Character;
  editable: boolean;
  canAssign: boolean;
  players: Player[];
  playbooksEnabled?: boolean;
  experienciasEnabled?: boolean;
  guapuraDieExcluded?: boolean;
  onUpdate: (patch: Partial<Character>) => void;
  onAssign: (ownerId: string | null) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onDiceRoll?: (payload: DiceRollSummary & { characterName: string }) => void;
}

/**
 * Ficha completa editable de un personaje de Pampa Primigenia.
 *
 * Los cambios se editan en un borrador local y solo se sincronizan con el
 * resto de la mesa cuando se toca "Guardar cambios" (guardado manual, no
 * automatico por cada tecla o click).
 */
export function CharacterSheet({
  character,
  editable,
  canAssign,
  players,
  playbooksEnabled = false,
  experienciasEnabled = false,
  guapuraDieExcluded = false,
  onUpdate,
  onAssign,
  onDirtyChange,
  onDiceRoll,
}: CharacterSheetProps) {
  const ro = !editable;
  const [draft, setDraft] = useState<Character>(character);
  const [dirty, setDirty] = useState(false);
  const diceRollerRef = useRef<DiceRollerHandle>(null);
  const selectedPlaybook =
    PLAYBOOKS.find((p) => p.id === draft.playbookId) ?? null;
  const attributeOptions = ATRIBUTOS_INFO.map((info) => {
    const base = draft.atributos[info.key];
    const degradado = draft.degradado[info.degradadoKey];
    return {
      key: info.key,
      label: info.label,
      effective: degradado ? base - DEGRADADO_PENALTY : base,
    };
  });

  // Si llegan cambios externos (de otro cliente) y no hay ediciones locales
  // sin guardar, se refleja el nuevo estado. Si hay ediciones sin guardar,
  // se preservan para no perder lo que se esta escribiendo.
  useEffect(() => {
    if (!dirty) setDraft(character);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character]);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const update = (patch: Partial<Character>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const handleSave = () => {
    onUpdate(draft);
    setDirty(false);
  };

  const handleExport = () => {
    downloadJSON(`${slugifyFilename(draft.name)}.json`, draft);
  };

  return (
    <div className="sheet">
      {editable && (
        <div className="sheet__toolbar">
          <button
            type="button"
            className={`btn ${dirty ? "btn--warn" : ""}`}
            disabled={!dirty}
            onClick={handleSave}
          >
            {dirty ? "Guardar cambios" : "Guardado"}
          </button>
          <button type="button" className="btn btn--ghost" onClick={handleExport}>
            Exportar personaje
          </button>
        </div>
      )}

      <div className="sheet__headline">
        <input
          className="sheet__name"
          value={draft.name}
          readOnly={ro}
          placeholder="Nombre"
          onChange={(e) => update({ name: e.target.value })}
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
          value={draft.pertenencia}
          readOnly={ro}
          onChange={(e) => update({ pertenencia: e.target.value })}
        />
      </div>

      <div className="field">
        <label>Rasgo caracteristico</label>
        <input
          value={draft.rasgo}
          readOnly={ro}
          onChange={(e) => update({ rasgo: e.target.value })}
        />
      </div>

      {playbooksEnabled && (
        <>
          <div className="field">
            <label>Playbook</label>
            <select
              value={draft.playbookId ?? ""}
              disabled={ro}
              onChange={(e) => update({ playbookId: e.target.value })}
            >
              <option value="">Sin playbook</option>
              {PLAYBOOKS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {selectedPlaybook && (
            <div className="playbook-info">
              <p>
                <strong>Habilidad:</strong> {selectedPlaybook.habilidad}
              </p>
              <p>
                <strong>Como se recarga:</strong> {selectedPlaybook.recarga}
              </p>
            </div>
          )}

          <PipTrack
            title={selectedPlaybook ? selectedPlaybook.metaCurrency : "Meta currency"}
            value={draft.playbookMetaValue ?? 0}
            max={PLAYBOOK_META_MAX}
            disabled={ro}
            onChange={(v) => update({ playbookMetaValue: v })}
          />
        </>
      )}

      <div className="sheet__attrs">
        {ATRIBUTOS_INFO.map((info) => {
          const base = draft.atributos[info.key];
          const degradado = draft.degradado[info.degradadoKey];
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
                    update({
                      atributos: {
                        ...draft.atributos,
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
                  update({
                    degradado: {
                      ...draft.degradado,
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
              <button
                type="button"
                className="attr__roll"
                disabled={ro}
                title={`Tirar 2d6 + ${info.label}`}
                onClick={() => diceRollerRef.current?.roll(info.key)}
              >
                🎲
              </button>
            </div>
          );
        })}
      </div>

      {experienciasEnabled && (
        <Experiences
          experiences={draft.experiencias ?? []}
          disabled={ro}
          onChange={(experiencias) => update({ experiencias })}
        />
      )}

      <GuapuraTrack
        value={draft.guapura}
        disabled={ro}
        onChange={(guapura) => update({ guapura })}
      />

      <DiceRoller
        ref={diceRollerRef}
        attributes={attributeOptions}
        experiences={experienciasEnabled ? draft.experiencias ?? [] : []}
        guapura={draft.guapura}
        guapuraMax={GUAPURA_MAX}
        guapuraDieExcluded={guapuraDieExcluded}
        disabled={ro}
        onSpendGuapura={() =>
          update({ guapura: Math.max(0, draft.guapura - 1) })
        }
        onGainGuapura={() =>
          update({ guapura: Math.min(GUAPURA_MAX, draft.guapura + 1) })
        }
        onRoll={(r) =>
          onDiceRoll?.({ ...r, characterName: draft.name || "Personaje" })
        }
      />

      <div className="sheet__tracks">
        <ConditionTrack
          title="Salud"
          values={draft.salud}
          labels={SALUD_LABELS}
          disabled={ro}
          onChange={(salud) => update({ salud })}
        />
        <ConditionTrack
          title="Estabilidad"
          values={draft.estabilidad}
          labels={ESTABILIDAD_LABELS}
          disabled={ro}
          onChange={(estabilidad) => update({ estabilidad })}
        />
      </div>

      <div className="field">
        <label>Arreos y Aperos</label>
        <textarea
          value={draft.arreos}
          readOnly={ro}
          rows={2}
          placeholder="Pertenencias, equipo, otros..."
          onChange={(e) => update({ arreos: e.target.value })}
        />
      </div>

      <div className="field">
        <label>Notas sobre su historia previa</label>
        <textarea
          value={draft.notas}
          readOnly={ro}
          rows={3}
          placeholder="Edad, motivaciones, mayor pena o deseo..."
          onChange={(e) => update({ notas: e.target.value })}
        />
      </div>
    </div>
  );
}
