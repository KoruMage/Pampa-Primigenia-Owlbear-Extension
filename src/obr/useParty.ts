import { useEffect, useState } from "react";
import OBR, { type Player } from "@owlbear-rodeo/sdk";

/**
 * Lista de jugadores conectados a la sala (sin incluir necesariamente
 * al GM que ejecuta la extension). Se actualiza en vivo.
 */
export function useParty() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    OBR.onReady(async () => {
      const current = await OBR.party.getPlayers();
      setPlayers(current);
      unsubscribe = OBR.party.onChange((next) => setPlayers(next));
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  return players;
}
