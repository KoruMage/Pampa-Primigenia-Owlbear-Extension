import { forwardRef, useImperativeHandle, useState } from "react";
import { Experience } from "../types";

interface AttributeOption {
  key: string;
  label: string;
  effective: number;
}

interface RollResult {
  d1: number;
  d2: number;
  attrLabel: string;
  attrValue: number;
  expLabel: string | null;
  expValue: number;
  guapuraDie: number | null;
  total: number;
  overThreshold: boolean;
  reallyGained: boolean;
}

export interface DiceRollSummary {
  summary: string;
  total: number;
  gainedGuapura: boolean;
}

export interface DiceRollerHandle {
  roll: (attrKey: string) => void;
}

interface DiceRollerProps {
  attributes: AttributeOption[];
  experiences: Experience[];
  guapura: number;
  guapuraMax: number;
  guapuraDieExcluded: boolean;
  disabled?: boolean;
  onSpendGuapura: () => void;
  onGainGuapura: () => void;
  onRoll?: (result: DiceRollSummary) => void;
}

function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Opciones y resultado del tirador de dados: 2d6 + caracteristica elegida
 * (el boton 🎲 esta sobre cada stat) + experiencia elegida (puede quedar
 * vacia) + 1d6 extra si se gasta un punto de Guapura.
 *
 * Con mas de 12 en el resultado se gana 1 punto de Guapura. Si la regla
 * opcional "guapuraDieExcluded" esta activa, el d6 de Guapura no cuenta
 * para esa decision (solo suma al resultado de la tirada en si).
 */
export const DiceRoller = forwardRef<DiceRollerHandle, DiceRollerProps>(
  function DiceRoller(
    {
      attributes,
      experiences,
      guapura,
      guapuraMax,
      guapuraDieExcluded,
      disabled,
      onSpendGuapura,
      onGainGuapura,
      onRoll,
    },
    ref,
  ) {
    const [expId, setExpId] = useState("");
    const [useGuapura, setUseGuapura] = useState(false);
    const [result, setResult] = useState<RollResult | null>(null);

    const canUseGuapura = guapura > 0;

    const roll = (attrKey: string) => {
      const d1 = rollD6();
      const d2 = rollD6();
      const attr = attributes.find((a) => a.key === attrKey) ?? null;
      const attrValue = attr?.effective ?? 0;
      const exp = experiences.find((e) => e.id === expId) ?? null;
      const expValue = exp?.value ?? 0;
      const willUseGuapura = useGuapura && canUseGuapura;
      const guapuraDie = willUseGuapura ? rollD6() : null;

      if (willUseGuapura) onSpendGuapura();

      const total = d1 + d2 + attrValue + expValue + (guapuraDie ?? 0);
      const checkTotal =
        guapuraDieExcluded && guapuraDie !== null ? total - guapuraDie : total;
      const overThreshold = checkTotal > 12;
      const reallyGained = overThreshold && guapura < guapuraMax;
      if (overThreshold) onGainGuapura();

      const attrLabel = attr?.label ?? "Sin caracteristica";
      const expLabel = exp ? exp.text || "Experiencia sin nombre" : null;

      setResult({
        d1,
        d2,
        attrLabel,
        attrValue,
        expLabel,
        expValue,
        guapuraDie,
        total,
        overThreshold,
        reallyGained,
      });

      const parts = [
        `2d6: ${d1}+${d2}`,
        `${attrLabel} ${attrValue >= 0 ? "+" : ""}${attrValue}`,
      ];
      if (expLabel) parts.push(`${expLabel} +${expValue}`);
      if (guapuraDie !== null) parts.push(`Guapura (d6) +${guapuraDie}`);
      const outcome = overThreshold
        ? reallyGained
          ? " → +1 Guapura"
          : " → +1 Guapura (ya al maximo)"
        : "";
      onRoll?.({
        summary: `${parts.join(" · ")} = ${total}${outcome}`,
        total,
        gainedGuapura: reallyGained,
      });
    };

    useImperativeHandle(ref, () => ({ roll }));

    return (
      <div className="dice-roller">
        <h4 className="section__title">Tirar dados</h4>
        <p className="dice-roller__hint muted">
          Elegi experiencia y si usas Guapura, despues apreta el 🎲 de la
          caracteristica con la que querés tirar.
        </p>
        <div className="dice-roller__controls">
          {experiences.length > 0 && (
            <label className="dice-roller__field">
              <span>Experiencia</span>
              <select
                value={expId}
                disabled={disabled}
                onChange={(e) => setExpId(e.target.value)}
              >
                <option value="">Ninguna</option>
                {experiences.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {(exp.text || "Sin nombre") + ` (+${exp.value})`}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="toggle dice-roller__guapura">
            <input
              type="checkbox"
              checked={useGuapura}
              disabled={disabled || !canUseGuapura}
              onChange={(e) => setUseGuapura(e.target.checked)}
            />
            Usar Guapura (gasta 1 punto, +1d6)
          </label>
        </div>

        {result && (
          <div className={`dice-result ${result.reallyGained ? "dice-result--win" : ""}`}>
            <p className="dice-result__total">
              Resultado: <strong>{result.total}</strong>
            </p>
            <p className="dice-result__detail">
              2d6: {result.d1} + {result.d2} · {result.attrLabel}:{" "}
              {result.attrValue >= 0 ? "+" : ""}
              {result.attrValue}
              {result.expLabel && (
                <>
                  {" "}
                  · {result.expLabel}: +{result.expValue}
                </>
              )}
              {result.guapuraDie !== null && (
                <>
                  {" "}
                  · Guapura (d6): +{result.guapuraDie}
                </>
              )}
            </p>
            <p className="dice-result__outcome">
              {result.overThreshold
                ? result.reallyGained
                  ? "¡Mas de 12! Ganaste 1 punto de Guapura."
                  : "¡Mas de 12! (Ya estabas al maximo de Guapura, no ganaste mas)."
                : "12 o menos: sin punto de Guapura extra."}
            </p>
          </div>
        )}
      </div>
    );
  },
);
