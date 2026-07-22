import { useEffect, useMemo, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { useRole } from "./obr/useRole";
import { useParty } from "./obr/useParty";
import { useRoster } from "./obr/useRoster";
import { CharacterCard } from "./components/CharacterCard";
import { CharacterSheet } from "./components/CharacterSheet";
import { PartyInventory } from "./components/PartyInventory";
import { makeCharacter } from "./types";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetDirty, setSheetDirty] = useState(false);

  const { characters, inventory } = roster.state;

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
    return (
      <div className="app">
        <Header subtitle="Vista del Director (GM)" />
        <IdentityStrip name={playerName} role={role} />

        <section className="roster">
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

        {selected && (
          <CharacterSheet
            key={selected.id}
            character={selected}
            editable
            canAssign
            players={players}
            onUpdate={(patch) => roster.updateCharacter(selected.id, patch)}
            onAssign={(ownerId) => roster.assignOwner(selected.id, ownerId)}
            onDirtyChange={setSheetDirty}
          />
        )}

        <PartyInventory
          items={inventory}
          onAdd={roster.addItem}
          onUpdate={roster.updateItem}
          onRemove={roster.removeItem}
        />
      </div>
    );
  }

  // Vista de jugador.
  return (
    <div className="app">
      <Header subtitle="Vista del jugador" />
      <IdentityStrip name={playerName} role={role} />

      {myCharacters.length === 0 ? (
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
            onUpdate={(patch) => roster.updateCharacter(c.id, patch)}
            onAssign={() => {}}
          />
        ))
      )}

      <PartyInventory
        items={inventory}
        onAdd={roster.addItem}
        onUpdate={roster.updateItem}
        onRemove={roster.removeItem}
      />
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
