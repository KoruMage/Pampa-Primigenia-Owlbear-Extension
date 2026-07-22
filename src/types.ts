// Modelo de datos de Pampa Primigenia (Pulp Austral).
// Basado en la ficha oficial de personaje.

export const METADATA_KEY = "com.pampa-primigenia/state";

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

/** Ficha completa de un personaje. */
export interface Character {
  id: string;
  name: string;
  pertenencia: string; // Pertenencia particular
  rasgo: string; // Rasgo caracteristico
  arreos: string; // Arreos y Aperos (equipo personal, texto libre)
  notas: string; // Notas sobre su historia previa
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
}

export const GUAPURA_MAX = 3;

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

/** Genera un id unico simple (suficiente para uso local). */
export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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

export const EMPTY_STATE: PampaState = { characters: [], inventory: [] };
