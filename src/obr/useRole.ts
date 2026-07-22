import { useEffect, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";

export type Role = "GM" | "PLAYER";

/**
 * Rol del jugador actual e id de conexion (user id de OBR).
 * Se mantiene sincronizado si el rol cambia durante la sesion.
 */
export function useRole() {
  const [role, setRole] = useState<Role | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    OBR.onReady(async () => {
      const [currentRole, id, name] = await Promise.all([
        OBR.player.getRole(),
        OBR.player.getId(),
        OBR.player.getName(),
      ]);
      setRole(currentRole);
      setPlayerId(id);
      setPlayerName(name);

      unsubscribe = OBR.player.onChange((player) => {
        setRole(player.role);
        setPlayerId(player.id);
        setPlayerName(player.name);
      });
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  return { role, playerId, playerName, isGM: role === "GM" };
}
