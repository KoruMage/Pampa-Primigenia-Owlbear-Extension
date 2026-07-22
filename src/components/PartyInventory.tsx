import { useState } from "react";
import { PartyItem, makePartyItem } from "../types";

interface PartyInventoryProps {
  items: PartyItem[];
  onAdd: (item: PartyItem) => void;
  onUpdate: (id: string, patch: Partial<PartyItem>) => void;
  onRemove: (id: string) => void;
}

/** Inventario compartido de la party (agregar / editar / borrar). */
export function PartyInventory({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: PartyInventoryProps) {
  const [name, setName] = useState("");

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({ ...makePartyItem(trimmed) });
    setName("");
  };

  return (
    <section className="inventory">
      <h3 className="section__title">Inventario de la party</h3>

      <div className="inventory__add">
        <input
          value={name}
          placeholder="Nuevo item..."
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <button type="button" className="btn" onClick={handleAdd}>
          Agregar
        </button>
      </div>

      {items.length === 0 ? (
        <p className="muted">Todavia no hay nada en el fardo comun.</p>
      ) : (
        <ul className="inventory__list">
          {items.map((item) => (
            <li key={item.id} className="inventory__item">
              <input
                className="inventory__qty"
                type="number"
                min={0}
                value={item.qty}
                onChange={(e) =>
                  onUpdate(item.id, { qty: Number(e.target.value) || 0 })
                }
              />
              <input
                className="inventory__name"
                value={item.name}
                onChange={(e) => onUpdate(item.id, { name: e.target.value })}
              />
              <input
                className="inventory__notes"
                value={item.notes}
                placeholder="notas"
                onChange={(e) => onUpdate(item.id, { notes: e.target.value })}
              />
              <button
                type="button"
                className="inventory__remove"
                title="Quitar item"
                onClick={() => onRemove(item.id)}
              >
                x
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
