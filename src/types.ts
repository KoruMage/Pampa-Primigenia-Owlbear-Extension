// Modelo de datos de Pampa Primigenia (Pulp Austral).
// Basado en la ficha oficial de personaje.

export const METADATA_KEY = "com.pampa-primigenia/state";

// Canal usado para avisarle a todos los clientes conectados (GM y jugadores)
// cuando alguien tira los dados, via OBR.broadcast.
export const DICE_ROLL_CHANNEL = "com.pampa-primigenia/dice-roll";

export interface DiceRollBroadcast {
  characterName: string;
  summary: string;
  total: number;
  gainedGuapura: boolean;
}

/** Atributos base del personaje. */
export interface Atributos {
  mate: number;
  viveza: number;
  facon: number;
}

/**
 * Estado degradado de cada atributo. Cuando esta activo, el atributo
 * correspondiente sufre -2 (Lerdo, Aturdio, Cagao).
 */
export interface Degradado {
  lerdo: boolean; // Mate degradado
  aturdio: boolean; // Viveza degradado
  cagao: boolean; // Facon degradado
}

/** Pista de Salud (en orden de gravedad segun la ficha). */
export interface Salud {
  [key: string]: boolean;
  herido: boolean;
  lastimado: boolean;
  magullado: boolean;
  tullido: boolean;
  incapacitado: boolean;
}

/** Pista de Estabilidad (en orden de gravedad segun la ficha). */
export interface Estabilidad {
  [key: string]: boolean;
  inestable: boolean;
  perturbado: boolean;
  preocupado: boolean;
  descontrolado: boolean;
  psicotico: boolean;
}

/**
 * Tipo de experiencia segun su origen inicial. Sirve solo para mostrar un
 * placeholder util; las 4 iniciales y las que se agreguen despues se tratan
 * todas igual una vez creadas.
 */
export type ExperienceKind = "general" | "trasfondo" | "item";

/**
 * Experiencia de personaje: otorga +1 (o mas, si subio de nivel) a las
 * tiradas relacionadas. Se puede "marcar"; si ya estaba marcada, la marca
 * se borra y el bono sube +1.
 */
export interface Experience {
  id: string;
  kind: ExperienceKind;
  text: string;
  value: number; // bono a la tirada, arranca en 1
  marked: boolean;
}

/** Ficha completa de un personaje. */
export interface Character {
  id: string;
  name: string;
  pertenencia: string; // Pertenencia particular
  rasgo: string; // Rasgo caracteristico
  arreos: string; // Arreos y Aperos (equipo personal, texto libre)
  notas: string; // Notas sobre su historia previa
  experiencias: Experience[];
  playbookId: string; // id de PLAYBOOKS, o "" si no elegio playbook todavia
  playbookMetaValue: number; // 0..PLAYBOOK_META_MAX, meta currency del playbook elegido
  ownerId: string | null; // id del jugador (OBR) asignado, o null
  atributos: Atributos;
  degradado: Degradado;
  guapura: number; // 0..3 (los tres anillos de la ficha)
  salud: Salud;
  estabilidad: Estabilidad;
}

/** Item del inventario compartido de la party. */
export interface PartyItem {
  id: string;
  name: string;
  qty: number;
  notes: string;
}

/** Estado completo que se guarda en la metadata de la sala. */
export interface PampaState {
  characters: Character[];
  inventory: PartyItem[];
  // Reglas opcionales, activables por el GM desde la pantalla de Opciones.
  playbooksEnabled: boolean; // habilita el campo "Playbook" en la ficha de cada PJ.
  experienciasEnabled: boolean; // habilita la seccion de Experiencias en la ficha.
  // Si esta activo, al tirar dados el d6 de Guapura no cuenta para decidir
  // si se gana 1 punto de Guapura por sacar mas de 12.
  guapuraDieExcluded: boolean;
}

export const GUAPURA_MAX = 3;

/** Toda meta currency de playbook va de 0 a 3, sin importar el playbook. */
export const PLAYBOOK_META_MAX = 3;

/** Definicion de un playbook: nombre, meta currency, habilidad y recarga. */
export interface PlaybookDef {
  id: string;
  name: string;
  metaCurrency: string;
  habilidad: string;
  recarga: string;
}

/** Playbooks by Koru: lista fija de playbooks jugables. */
export const PLAYBOOKS: PlaybookDef[] = [
  {
    id: "vaquero",
    name: "Vaquero",
    metaCurrency: "Vinculo",
    habilidad:
      "Tenes un companero animal: mientras mayor sea el vinculo, mas confia en vos y mas cosas se anima a hacer por vos (recorda que es un juego de fantasia oscura).",
    recarga:
      "Subis el vinculo en base a acciones que hagas para que suba (cuidarlo, alimentarlo, tomar heridas en su lugar, salvarlo de un peligro, etc).",
  },
  {
    id: "payador",
    name: "Payador",
    metaCurrency: "Rimas",
    habilidad:
      "En cualquier momento podes empezar una payada que dura durante la escena. Si aciertas, todos tus aliados suman la cantidad de payada a su tirada.",
    recarga:
      "Las Rimas duran unicamente en la escena. Requiere una tirada de Mate dificultad 7 + rimas x2 para ganar 1; si fallas bajas 1 y no podes volver a hacerlo en la escena.",
  },
  {
    id: "cebador",
    name: "Cebador",
    metaCurrency: "Yuyos",
    habilidad:
      "Tiene unos yuyos que ayudan a curar y vigorizar el cuerpo, ademas de calmar la mente. Si se pone a cebar unos mates al descansar, recupera 1 punto de Salud extra, o 1 punto de Estabilidad extra, o 2 de ambos si gasta los 3.",
    recarga:
      "Los recupera buscando yuyos en el monte (implica tirada) o comprandolos en alguna tienda.",
  },
  {
    id: "soldado",
    name: "Soldado",
    metaCurrency: "Balas",
    habilidad:
      "Tiene un arma caracteristica que puede disparar con soltura y hacer que el disparo logre algo que normalmente no saldria (ser mas preciso, tiro de rebote, etc).",
    recarga: "Se recupera cuando se realiza un acto de valentia o heroico.",
  },
  {
    id: "cura_gaucho",
    name: "Cura gaucho",
    metaCurrency: "Rosarios",
    habilidad:
      "Puede rezar un rosario para limpiar maldiciones, atraer o repeler criaturas, o dar estabilidad a un aliado. Potencian el rezo: usar mas rosarios, estar quieto mientras reza, hacer un acto de fe. Lo debilitan: moverse (si durante el rezo realiza acciones, puede requerir una tirada y cortar el efecto deseado).",
    recarga:
      "Recupera los rezos cuando le dedica un tiempo largo a rezar, o si reza en una iglesia.",
  },
  {
    id: "el_viejo",
    name: "El Viejo",
    metaCurrency: "Memorias/Recuerdos",
    habilidad:
      "Puede dedicarse un momento a ver si recuerda alguna leyenda, cancion o vivencia, preguntandole al DJ alguna pregunta sobre alguna criatura o suceso. Por cada recuerdo que gaste, el DJ debe ser mas preciso.",
    recarga:
      "Para recuperar recuerdos tiene que hacer una tirada de Facon para ver si rememorar el recuerdo no le afecta el cuerpo (Dificultad 7 + heridas).",
  },
];

export const SALUD_LABELS: { key: keyof Salud; label: string }[] = [
  { key: "herido", label: "Herido" },
  { key: "lastimado", label: "Lastimado" },
  { key: "magullado", label: "Magullado" },
  { key: "tullido", label: "Tullido" },
  { key: "incapacitado", label: "Incapacitado" },
];

export const ESTABILIDAD_LABELS: { key: keyof Estabilidad; label: string }[] = [
  { key: "inestable", label: "Inestable" },
  { key: "perturbado", label: "Perturbado" },
  { key: "preocupado", label: "Preocupado" },
  { key: "descontrolado", label: "Descontrolado" },
  { key: "psicotico", label: "Psicotico" },
];

export const ATRIBUTOS_INFO: {
  key: keyof Atributos;
  label: string;
  degradadoKey: keyof Degradado;
  degradadoLabel: string;
}[] = [
  { key: "mate", label: "Mate", degradadoKey: "lerdo", degradadoLabel: "Lerdo" },
  { key: "viveza", label: "Viveza", degradadoKey: "aturdio", degradadoLabel: "Aturdio" },
  { key: "facon", label: "Facon", degradadoKey: "cagao", degradadoLabel: "Cagao" },
];

export const DEGRADADO_PENALTY = 2;

export const EXPERIENCE_KIND_LABELS: Record<ExperienceKind, string> = {
  general: "Experiencia (+1 a las tiradas)",
  trasfondo: "Experiencia de trasfondo",
  item: "Experiencia del item caracteristico",
};

/** Genera un id unico simple (suficiente para uso local). */
export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Crea una experiencia nueva (arranca en +1, sin marcar). */
export function makeExperience(kind: ExperienceKind = "general"): Experience {
  return { id: makeId(), kind, text: "", value: 1, marked: false };
}

/**
 * Set inicial de experiencias con el que arranca todo personaje nuevo:
 * 2 generales (+1 a las tiradas), 1 de trasfondo y 1 del item caracteristico.
 */
export function makeInitialExperiences(): Experience[] {
  return [
    makeExperience("general"),
    makeExperience("general"),
    makeExperience("trasfondo"),
    makeExperience("item"),
  ];
}

/** Crea un personaje nuevo con valores por defecto. */
export function makeCharacter(name = "Nuevo paisano"): Character {
  return {
    id: makeId(),
    name,
    pertenencia: "",
    rasgo: "",
    arreos: "",
    notas: "",
    experiencias: makeInitialExperiences(),
    playbookId: "",
    playbookMetaValue: 0,
    ownerId: null,
    atributos: { mate: 0, viveza: 0, facon: 0 },
    degradado: { lerdo: false, aturdio: false, cagao: false },
    guapura: 0,
    salud: {
      herido: false,
      lastimado: false,
      magullado: false,
      tullido: false,
      incapacitado: false,
    },
    estabilidad: {
      inestable: false,
      perturbado: false,
      preocupado: false,
      descontrolado: false,
      psicotico: false,
    },
  };
}

export function makePartyItem(name = ""): PartyItem {
  return { id: makeId(), name, qty: 1, notes: "" };
}

export const EMPTY_STATE: PampaState = {
  characters: [],
  inventory: [],
  playbooksEnabled: false,
  experienciasEnabled: false,
  guapuraDieExcluded: false,
};
