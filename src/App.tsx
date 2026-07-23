import { useEffect, useMemo, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { useRole } from "./obr/useRole";
import { useParty } from "./obr/useParty";
import { useRoster } from "./obr/useRoster";
import { broadcastDiceRoll, useDiceRollFeed } from "./obr/useDiceRollFeed";
import { CharacterCard } from "./components/CharacterCard";
import { CharacterSheet } from "./components/CharacterSheet";
import { PartyInventory } from "./components/PartyInventory";
import { Tabs } from "./components/Tabs";
import { makeCharacter } from "./types";

const CONTENT_TABS = [
  { id: "sheet", label: "Ficha" },
  { id: "inventory", label: "Inventario de la party" },
];

export default function App() {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    // OBR.isAvailable indica si estamos embebidos dentro de Owlbear Rodeo.
    setAvailable(OBR.isAvailable);
  }, []);

  if (available === false) {
    return (
      <div className="standalone">
        <h1>Pampa Primigenia</h1>
        <p>
          Esta pagina es una extension de Owlbear Rodeo. Abrila desde dentro de
          una sala de Owlbear usando el boton de la extension.
        </p>
      </div>
    );
  }

  return <PartyManager />;
}

function PartyManager() {
  const { isGM, playerId, playerName, role } = useRole();
  const players = useParty();
  const roster = useRoster();
  useDiceRollFeed();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetDirty, setSheetDirty] = useState(false);
  const [screen, setScreen] = useState<"main" | "options">("main");
  const [contentTab, setContentTab] = useState<string>("sheet");

  const {
    characters,
    inventory,
    playbooksEnabled,
    experienciasEnabled,
    guapuraDieExcluded,
  } = roster.state;

  const myCharacters = useMemo(
    () => characters.filter((c) => c.ownerId === playerId),
    [characters, playerId],
  );

  // Seleccion por defecto para el GM: el primer personaje del roster.
  useEffect(() => {
    if (!isGM) return;
    if (selectedId && characters.some((c) => c.id === selectedId)) return;
    setSelectedId(characters[0]?.id ?? null);
  }, [isGM, characters, selectedId]);

  if (!roster.ready || role === null) {
    return <div className="loading">Cargando el fogon...</div>;
  }

  // Evita perder cambios sin guardar al cambiar de ficha seleccionada.
  const trySelect = (id: string | null) => {
    if (sheetDirty && id !== selectedId) {
      const ok = window.confirm(
        "Tenes cambios sin guardar en esta ficha. Si continuas se van a perder. ¿Continuar de todas formas?",
      );
      if (!ok) return;
    }
    setSheetDirty(false);
    setSelectedId(id);
  };

  const handleCreate = () => {
    const c = makeCharacter();
    roster.addCharacter(c);
    trySelect(c.id);
  };

  if (isGM) {
    const selected = characters.find((c) => c.id === selectedId) ?? null;

    if (screen === "options") {
      return (
        <div className="app">
          <Header subtitle="Vista del Director (GM)" />
          <IdentityStrip name={playerName} role={role} />
          <OptionsScreen
            playbooksEnabled={playbooksEnabled}
            onTogglePlaybooks={roster.setPlaybooksEnabled}
            experienciasEnabled={experienciasEnabled}
            onToggleExperiencias={roster.setExperienciasEnabled}
            guapuraDieExcluded={guapuraDieExcluded}
            onToggleGuapuraDieExcluded={roster.setGuapuraDieExcluded}
            onBack={() => setScreen("main")}
          />
        </div>
      );
    }

    return (
      <div className="app app--gm">
        <Header subtitle="Vista del Director (GM)" />
        <IdentityStrip name={playerName} role={role} />

        <div className="top-actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setScreen("options")}
          >
            ⚙ Opciones
          </button>
        </div>

        <div className="gm-layout">
          <section className="roster gm-layout__roster">
            <div className="roster__head">
              <h3 className="section__title">Personajes ({characters.length})</h3>
              <button type="button" className="btn" onClick={handleCreate}>
                + Nuevo PJ
              </button>
            </div>
            {characters.length === 0 ? (
              <p className="muted">No hay paisanos en la pampa todavia.</p>
            ) : (
              <div className="roster__list">
                {characters.map((c) => (
                  <CharacterCard
                    key={c.id}
                    character={c}
                    players={players}
                    selected={c.id === selectedId}
                    onSelect={() => trySelect(c.id)}
                    onRemove={() => {
                      roster.removeCharacter(c.id);
                      if (selectedId === c.id) {
                        setSheetDirty(false);
                        setSelectedId(null);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="gm-layout__sheet">
            <Tabs tabs={CONTENT_TABS} active={contentTab} onChange={setContentTab} />

            {contentTab === "inventory" ? (
              <PartyInventory
                items={inventory}
                onAdd={roster.addItem}
                onUpdate={roster.updateItem}
                onRemove={roster.removeItem}
              />
            ) : selected ? (
              <CharacterSheet
                key={selected.id}
                character={selected}
                editable
                canAssign
                players={players}
                playbooksEnabled={playbooksEnabled}
                experienciasEnabled={experienciasEnabled}
                guapuraDieExcluded={guapuraDieExcluded}
                onUpdate={(patch) => roster.updateCharacter(selected.id, patch)}
                onAssign={(ownerId) => roster.assignOwner(selected.id, ownerId)}
                onDirtyChange={setSheetDirty}
                onDiceRoll={broadcastDiceRoll}
              />
            ) : (
              <p className="muted">Elegi un personaje de la lista para ver su ficha.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vista de jugador.
  return (
    <div className="app">
      <Header subtitle="Vista del jugador" />
      <IdentityStrip name={playerName} role={role} />

      <Tabs tabs={CONTENT_TABS} active={contentTab} onChange={setContentTab} />

      {contentTab === "inventory" ? (
        <PartyInventory
          items={inventory}
          onAdd={roster.addItem}
          onUpdate={roster.updateItem}
          onRemove={roster.removeItem}
        />
      ) : myCharacters.length === 0 ? (
        <p className="muted">
          Todavia no tenes ningun personaje asignado. Pedile al GM que te
          asigne uno desde su lista, seleccionando tu nombre en el dropdown
          "Jugador" de la ficha.
        </p>
      ) : (
        myCharacters.map((c) => (
          <CharacterSheet
            key={c.id}
            character={c}
            editable
            canAssign={false}
            players={players}
            playbooksEnabled={playbooksEnabled}
            experienciasEnabled={experienciasEnabled}
            guapuraDieExcluded={guapuraDieExcluded}
            onUpdate={(patch) => roster.updateCharacter(c.id, patch)}
            onAssign={() => {}}
            onDiceRoll={broadcastDiceRoll}
          />
        ))
      )}
    </div>
  );
}

function Header({ subtitle }: { subtitle: string }) {
  return (
    <header className="header">
      <div className="header__title">
        <span className="header__kicker">Pampa</span>
        <span className="header__main">Primigenia</span>
      </div>
      <p className="header__sub">{subtitle}</p>
    </header>
  );
}

interface OptionalRule {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
}

/** Pantalla de opciones del GM (reglas opcionales de mesa, activables). */
function OptionsScreen({
  playbooksEnabled,
  onTogglePlaybooks,
  experienciasEnabled,
  onToggleExperiencias,
  guapuraDieExcluded,
  onToggleGuapuraDieExcluded,
  onBack,
}: {
  playbooksEnabled: boolean;
  onTogglePlaybooks: (value: boolean) => void;
  experienciasEnabled: boolean;
  onToggleExperiencias: (value: boolean) => void;
  guapuraDieExcluded: boolean;
  onToggleGuapuraDieExcluded: (value: boolean) => void;
  onBack: () => void;
}) {
  const rules: OptionalRule[] = [
    {
      id: "playbooks",
      label: "Playbooks by Koru",
      description:
        "Activa el desplegable de playbooks (Vaquero, Payador, Cebador, Soldado, Cura gaucho, El Viejo) con su habilidad, como se recarga y un contador de meta currency en la ficha de cada personaje.",
      enabled: playbooksEnabled,
      onToggle: onTogglePlaybooks,
    },
    {
      id: "experiencias",
      label: "Experiencias",
      description:
        "Activa la seccion de Experiencias en la ficha: 4 iniciales (2 generales +1 a las tiradas, 1 de trasfondo, 1 del item caracteristico), con boton para agregar nuevas y un marcador que sube +1 el bono al confirmarse.",
      enabled: experienciasEnabled,
      onToggle: onToggleExperiencias,
    },
    {
      id: "guapura-die-excluded",
      label: "El dado de Guapura no cuenta para ganarla",
      description:
        'Al tirar dados usando Guapura (1d6 extra), ese dado no se tiene en cuenta para decidir si se gana 1 punto de Guapura por sacar mas de 12 (solo cuenta 2d6 + caracteristica + experiencia).',
      enabled: guapuraDieExcluded,
      onToggle: onToggleGuapuraDieExcluded,
    },
  ];

  return (
    <section className="options">
      <div className="options__head">
        <h3 className="section__title">Opciones</h3>
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Volver
        </button>
      </div>

      <div className="options__group">
        <h4 className="options__group-title">Reglas opcionales</h4>
        {rules.map((rule) => (
          <div key={rule.id} className="options__rule">
            <label className="toggle">
              <input
                type="checkbox"
                checked={rule.enabled}
                onChange={(e) => rule.onToggle(e.target.checked)}
              />
              {rule.label}
            </label>
            <p className="muted options__rule-desc">{rule.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Franja que muestra con que identidad (nombre y rol) esta conectado este
 * cliente, para saber rapidamente si se esta viendo como GM o como jugador.
 */
function IdentityStrip({
  name,
  role,
}: {
  name: string | null;
  role: string | null;
}) {
  return (
    <p className="identity">
      Conectado como <strong>{name ?? "..."}</strong> · rol{" "}
      <strong>{role ?? "..."}</strong>
    </p>
  );
}
