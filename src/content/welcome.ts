// ============================================================
// Contenido del onboarding de bienvenida — KetoFlow
// Textos breves, motivacionales y fáciles de leer.
// La experiencia debe sentirse como un saludo, no un formulario.
// ============================================================

export interface IntroFeature {
  emoji: string;
  label: string;
  desc: string;
}

export interface IntroSlide {
  id: string;
  emoji?: string;
  title: string;
  /** Subtítulo (aparece con fade al completarse el titular) */
  subtitle?: string;
  /** Si el titular se escribe con efecto typewriter */
  typewriter?: boolean;
  /** Viñetas cortas (metabolismo y coach) */
  bullets?: string[];
  /** Enlace de refuerzo (p. ej. Bases de keto) */
  link?: { label: string; href: string };
  /** Slide con video explicativo (cetosis) */
  isVideo?: boolean;
  /** Características de la plataforma */
  features?: IntroFeature[];
  /** Slide final con CTA */
  isDone?: boolean;
  /** Etiqueta del botón principal */
  ctaLabel?: string;
  /** Etiqueta del botón secundario (solo en el slide final) */
  secondaryLabel?: string;
}

/**
 * Video explicativo de cetosis (embed de YouTube).
 * TODO(producto): reemplazar la ID por el video en español aprobado por el coach.
 * Si se deja vacío, el slide muestra una tarjeta "próximamente".
 */
export const KETOSIS_VIDEO_URL = "https://youtu.be/jSLw90pDqYk?si=m3zMIIwi9030px0n";

export const INTRO_SLIDES: IntroSlide[] = [
  {
    id: "hola",
    emoji: "👋",
    title: "Hola, {nombre}",
    subtitle: "Tu proceso de sanación comienza hoy.",
  },
  {
    id: "sanacion",
    emoji: "✨",
    title: "Bienvenido a tu proceso de sanación.",
    typewriter: true,
  },
  {
    id: "relacion",
    emoji: "🌱",
    title: "Este no es simplemente un cambio de alimentación.",
    subtitle: "Es el comienzo de una nueva relación con tu cuerpo.",
    typewriter: true,
  },
  {
    id: "metabolismo",
    emoji: "🔬",
    title: "Primero entendamos algo fundamental: cómo funciona nuestro cuerpo.",
    bullets: [
      "Tu cuerpo tiene dos combustibles: azúcar (carbohidratos) y grasa.",
      "Mientras hay azúcar disponible, la quema primero.",
      "La insulina es la hormona que «guarda» energía… con ella alta, tu grasa queda cerrada.",
      "Para tocar esa reserva hay que cambiar de combustible.",
    ],
    link: { label: "Aprende más en Bases de Keto", href: "/bases" },
  },
  {
    id: "cetosis",
    emoji: "🧪",
    title: "Ahora sí: conozcamos la cetosis.",
    subtitle: "Un cambio de combustible: de quemar azúcar a quemar grasa.",
    isVideo: true,
    ctaLabel: "Entendido, continuar",
  },
  {
    id: "acompanamiento",
    emoji: "🤝",
    title: "Y no estarás solo en este proceso.",
    features: [
      { emoji: "🍽️", label: "Alimentación", desc: "Registra lo que comes" },
      { emoji: "💧", label: "Hidratación", desc: "Lleva el control de tus líquidos" },
      { emoji: "⚖️", label: "Peso", desc: "Seguimiento semanal con evidencia" },
      { emoji: "📈", label: "Progreso", desc: "Métricas y logros automáticos" },
    ],
  },
  {
    id: "coach",
    emoji: "💬",
    title: "Tu coach estará contigo.",
    typewriter: true,
    bullets: [
      "Verá tu avance en cada registro.",
      "Te dará feedback y orientación.",
      "Ajustará tu plan contigo.",
    ],
  },
  {
    id: "listo",
    emoji: "🚀",
    title: "Listo para empezar.",
    subtitle: "Tu viaje empieza con tu primera comida keto.",
    isDone: true,
    ctaLabel: "Comenzar recorrido",
    secondaryLabel: "Explorar por mi cuenta",
  },
];