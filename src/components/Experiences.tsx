import { EXPERIENCE_KIND_LABELS, Experience, makeExperience } from "../types";

interface ExperiencesProps {
  experiences: Experience[];
  disabled?: boolean;
  onChange: (experiences: Experience[]) => void;
}

/**
 * Lista de experiencias del personaje. Al terminar una sesion se elige 1:
 * agregar una experiencia nueva, o marcar una (si ya estaba marcada, la
 * marca se borra y el bono de esa experiencia sube +1).
 */
export function Experiences({ experiences, disabled, onChange }: ExperiencesProps) {
  const addExperience = () => {
    onChange([...experiences, makeExperience("general")]);
  };

  const updateText = (id: string, text: string) => {
    onChange(experiences.map((exp) => (exp.id === id ? { ...exp, text } : exp)));
  };

  const toggleMark = (id: string) => {
    onChange(
      experiences.map((exp) => {
        if (exp.id !== id) return exp;
        if (exp.marked) {
          return { ...exp, marked: false, value: exp.value + 1 };
        }
        return { ...exp, marked: true };
      }),
    );
  };

  const removeExperience = (id: string) => {
    onChange(experiences.filter((exp) => exp.id !== id));
  };

  return (
    <div className="experiences">
      <div className="experiences__head">
        <h4 className="section__title">Experiencias</h4>
        {!disabled && (
          <button type="button" className="btn btn--ghost" onClick={addExperience}>
            + Nueva experiencia
          </button>
        )}
      </div>
      <p className="muted experiences__hint">
        Al terminar una sesion, elegi 1: agregar una experiencia nueva, o marcar una
        (si ya estaba marcada, se borra la marca y sube +1 su bono).
      </p>
      <div className="experiences__list">
        {experiences.map((exp) => (
          <div key={exp.id} className="experience">
            <button
              type="button"
              className={`experience__mark ${exp.marked ? "experience__mark--on" : ""}`}
              disabled={disabled}
              aria-pressed={exp.marked}
              title={exp.marked ? "Confirmar: borra la marca y sube +1" : "Marcar"}
              onClick={() => toggleMark(exp.id)}
            />
            <input
              className="experience__text"
              value={exp.text}
              readOnly={disabled}
              placeholder={EXPERIENCE_KIND_LABELS[exp.kind]}
              onChange={(e) => updateText(exp.id, e.target.value)}
            />
            <span className="experience__value">+{exp.value}</span>
            {!disabled && (
              <button
                type="button"
                className="experience__remove"
                title="Eliminar experiencia"
                onClick={() => removeExperience(exp.id)}
              >
                x
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
