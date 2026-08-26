// ============================================================
// Modelos de dominio — KetoFlow
// Entidades de la app de apoyo al coach de dieta cetogénica.
// ============================================================

/** Origen del contenido: automático (sistema) o creado por el coach */
export type ContentSource = "auto" | "coach";

/** Perfil extendido del usuario dentro del programa keto */
export interface UserProfile {
  userId: string;
  email: string;
  nombre: string;
  fotoUrl?: string;
  alturaCm?: number;
  pesoObjetivoKg?: number;
  fechaInicio?: string; // ISO date
  rol: "usuario" | "coach";
  disabled?: boolean;
}

/** Registro de peso (báscula) con evidencia fotográfica opcional */
export interface WeightEntry {
  id: string;
  userId: string;
  fechaHora: string; // ISO datetime
  pesoKg: number;
  evidenciaFotoUrl?: string;
  nota?: string;
}

/** Registro de alimentación: alimento consumido con gramos y momento */
export interface MealEntry {
  id: string;
  userId: string;
  alimento: string;
  gramos: number;
  fechaHora: string; // ISO datetime
  comida?: "desayuno" | "almuerzo" | "cena" | "snack";
  carbohidratosNetos?: number; // por porción registrada (opcional)
  nota?: string;
}

/** Receta keto (las publica/administra el coach) */
export interface Recipe {
  id: string;
  titulo: string;
  descripcion?: string;
  ingredientes: string[];
  pasos?: string[];
  minutosPreparacion?: number;
  porciones?: number;
  carbohidratosNetosPorPorcion?: number;
  imagenUrl?: string;
  source: ContentSource;
  creadaPor?: string;
  fechaCreacion?: string;
}

/** Recomendación mostrada al usuario (automática o del coach) */
export interface Recommendation {
  id: string;
  texto: string;
  source: ContentSource;
  destinatarioUserId?: string; // si es personalizada
  fechaCreacion: string;
  leida?: boolean;
}

/** Mensaje motivacional o personalizado */
export interface MotivationalMessage {
  id: string;
  texto: string;
  source: ContentSource;
  destinatarioUserId?: string;
  fechaCreacion: string;
  leida?: boolean;
}

/** Logro obtenido por el usuario */
export interface Achievement {
  id: string;
  codigo: string; // clave de la regla, ej: "primer-registro"
  titulo: string;
  descripcion: string;
  emoji: string;
  source: ContentSource;
  fechaObtenido: string;
  compartido?: boolean;
}

/** Publicación en el feed del grupo */
export interface Post {
  id: string;
  autorUserId: string;
  autorNombre: string;
  autorFotoUrl?: string;
  texto: string;
  imagenUrl?: string;
  imagenKey?: string;
  logroId?: string; // si la publicación comparte un logro
  fechaCreacion: string;
  comentariosCount?: number;
}

/** Comentario en una publicación */
export interface Comment {
  id: string;
  postId: string;
  autorUserId: string;
  autorNombre: string;
  autorFotoUrl?: string;
  texto: string;
  fechaCreacion: string;
}

/** Mensaje del chat grupal */
export interface ChatMessage {
  id: string;
  autorUserId: string;
  autorNombre: string;
  autorFotoUrl?: string;
  texto: string;
  fechaEnvio: string;
}

// ─── Catálogo de alimentos ────────────────────────────────────

export type FoodUnit = "g" | "und" | "ml";
export type FoodCategory =
  | "proteina"
  | "verdura"
  | "grasa"
  | "lacteo"
  | "fruto_seco"
  | "semilla"
  | "otro";

export interface FoodItem {
  foodId: string;
  nombre: string;
  unidad: FoodUnit;
  equivalenciaGramos?: number;
  categoria?: FoodCategory;
}

// ─── Líquidos ────────────────────────────────────────────────

export interface LiquidEntry {
  id: string;
  userId: string;
  fechaHora: string;
  cantidadMl: number;
}
