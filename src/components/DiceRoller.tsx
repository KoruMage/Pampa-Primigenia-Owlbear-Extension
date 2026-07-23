import { useState } from "react";
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

interface DiceRollerProps {
  attributes: AttributeOption[];
  experiences: Experience[];
  guapura: number;
  guapuraMax: number;
  guapuraDieExcluded: boolean;
  disabled?: boolean;
  onSpendGuapura: () => void;
  onGainGuapura: () => void;
}

function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Tirador de dados: 2d6 + caracteristica elegida + experiencia elegida
 * (puede quedar vacia) + 1d6 extra si se gasta un punto de Guapura.
 *
 * Con mas de 12 en el resultado se gana 1 punto de Guapura. Si la regla
 * opcional "guapuraDieExcluded" esta activa, el d6 de Guapura no cuenta
 * para esa decision (solo suma al resultado de la tirada en si).
 */
export function DiceRoller({
  attributes,
  experiences,
  guapura,
  guapuraMax,
  guapuraDieExcluded,
  disabled,
  onSpendGuapura,
  onGainGuapura,
}: DiceRollerProps) {
  const [attrKey, setAttrKey] = useState(attributes[0]?.key ?? "");
  const [expId, setExpId] = useState("");
  const [useGuapura, setUseGuapura] = useState(false);
  const [result, setResult] = useState<RollResult | null>(null);

  const canUseGuapura = guapura > 0;

  const roll = () => {
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

    setResult({
      d1,
      d2,
      attrLabel: attr?.label ?? "Sin caracteristica",
      attrValue,
      expLabel: exp ? exp.text || "Experiencia sin nombre" : null,
      expValue,
      guapuraDie,
      total,
      overThreshold,
      reallyGained,
    });
  };

  return (
    <div className="dice-roller">
      <h4 className="section__title">Tirar dados</h4>
      <div className="dice-roller__controls">
        <label className="dice-roller__field">
          <span>Caracteristica</span>
          <select
            value={attrKey}
            disabled={disabled}
            onChange={(e) => setAttrKey(e.target.value)}
          >
            {attributes.map((a) => (
              <option key={a.key} value={a.key}>
                {a.label} ({a.effective >= 0 ? "+" : ""}
                {a.effective})
              </option>
            ))}
          </select>
        </label>

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

        <button type="button" className="btn" disabled={disabled} onClick={roll}>
          🎲 Tirar
        </button>
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
}
