import { useCallback, useEffect, useRef, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
import {
  Character,
  EMPTY_STATE,
  METADATA_KEY,
  PampaState,
  PartyItem,
} from "../types";

function readState(metadata: Record<string, unknown>): PampaState {
  const raw = metadata[METADATA_KEY] as Partial<PampaState> | undefined;
  return {
    characters: raw?.characters ?? [],
    inventory: raw?.inventory ?? [],
    playbooksEnabled: raw?.playbooksEnabled ?? false,
  };
}

/**
 * Estado compartido (roster + inventario) persistido en la metadata de la
 * sala. Todos los clientes (GM y jugadores) quedan sincronizados en vivo.
 */
export function useRoster() {
  const [state, setState] = useState<PampaState>(EMPTY_STATE);
  const [ready, setReady] = useState(false);
  const stateRef = useRef<PampaState>(EMPTY_STATE);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    OBR.onReady(async () => {
      const metadata = await OBR.room.getMetadata();
      const initial = readState(metadata);
      stateRef.current = initial;
      setState(initial);
      setReady(true);

      unsubscribe = OBR.room.onMetadataChange((next) => {
        const parsed = readState(next);
        stateRef.current = parsed;
        setState(parsed);
      });
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  // Escribe el nuevo estado en la metadata de la sala. La actualizacion
  // local llega de vuelta via onMetadataChange, pero tambien lo aplicamos
  // de forma optimista para que la UI responda al instante.
  const commit = useCallback(async (next: PampaState) => {
    stateRef.current = next;
    setState(next);
    await OBR.room.setMetadata({ [METADATA_KEY]: next });
  }, []);

  const addCharacter = useCallback(
    (character: Character) =>
      commit({
        ...stateRef.current,
        characters: [...stateRef.current.characters, character],
      }),
    [commit],
  );

  const updateCharacter = useCallback(
    (id: string, patch: Partial<Character>) =>
      commit({
        ...stateRef.current,
        characters: stateRef.current.characters.map((c) =>
          c.id === id ? { ...c, ...patch } : c,
        ),
      }),
    [commit],
  );

  const removeCharacter = useCallback(
    (id: string) =>
      commit({
        ...stateRef.current,
        characters: stateRef.current.characters.filter((c) => c.id !== id),
      }),
    [commit],
  );

  const assignOwner = useCallback(
    (id: string, ownerId: string | null) => updateCharacter(id, { ownerId }),
    [updateCharacter],
  );

  const addItem = useCallback(
    (item: PartyItem) =>
      commit({
        ...stateRef.current,
        inventory: [...stateRef.current.inventory, item],
      }),
    [commit],
  );

  const updateItem = useCallback(
    (id: string, patch: Partial<PartyItem>) =>
      commit({
        ...stateRef.current,
        inventory: stateRef.current.inventory.map((i) =>
          i.id === id ? { ...i, ...patch } : i,
        ),
      }),
    [commit],
  );

  const removeItem = useCallback(
    (id: string) =>
      commit({
        ...stateRef.current,
        inventory: stateRef.current.inventory.filter((i) => i.id !== id),
      }),
    [commit],
  );

  const setPlaybooksEnabled = useCallback(
    (playbooksEnabled: boolean) =>
      commit({ ...stateRef.current, playbooksEnabled }),
    [commit],
  );

  return {
    state,
    ready,
    addCharacter,
    updateCharacter,
    removeCharacter,
    assignOwner,
    addItem,
    updateItem,
    removeItem,
    setPlaybooksEnabled,
  };
}

export type Roster = ReturnType<typeof useRoster>;
