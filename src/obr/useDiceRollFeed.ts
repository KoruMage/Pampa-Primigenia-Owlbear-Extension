import { useEffect } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { DICE_ROLL_CHANNEL, DiceRollBroadcast } from "../types";

/**
 * Avisa a todos los demas clientes conectados (GM y jugadores) que alguien
 * tiro los dados, para que les aparezca una notificacion de Owlbear con el
 * resultado.
 */
export function broadcastDiceRoll(payload: DiceRollBroadcast) {
  OBR.broadcast.sendMessage(DICE_ROLL_CHANNEL, payload, {
    destination: "REMOTE",
  });
}

/**
 * Escucha las tiradas de dados de los demas clientes y les muestra una
 * notificacion nativa de Owlbear Rodeo a todos los presentes en la sala.
 */
export function useDiceRollFeed() {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    OBR.onReady(() => {
      unsubscribe = OBR.broadcast.onMessage(DICE_ROLL_CHANNEL, (event) => {
        const payload = event.data as DiceRollBroadcast | undefined;
        if (!payload) return;
        OBR.notification.show(
          `🎲 ${payload.characterName}: ${payload.summary}`,
          payload.gainedGuapura ? "SUCCESS" : "DEFAULT",
        );
      });
    });

    return () => unsubscribe?.();
  }, []);
}
