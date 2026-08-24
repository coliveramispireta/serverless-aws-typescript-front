import { KetoMetrics } from "./metrics";

/**
 * Motor de mensajes y recomendaciones automáticas.
 * Selecciona el mensaje motivacional y la recomendación keto según el
 * progreso actual. Todo lo generado aquí es contenido "auto" del sistema.
 */

export interface AutoContent {
  texto: string;
  motivo: string; // clave interna de la regla aplicada
}

/** Mensaje motivacional según el estado del usuario */
export function getAutoMotivation(metrics: KetoMetrics): AutoContent {
  if (!metrics.hasData) {
    return {
      motivo: "bienvenida",
      texto:
        "¡Bienvenido/a a KetoCoach! Registra tu primer peso y tus comidas para empezar a ver tu progreso.",
    };
  }

  if (
    metrics.pesoObjetivo != null &&
    metrics.pesoActual != null &&
    metrics.pesoActual <= metrics.pesoObjetivo
  ) {
    return {
      motivo: "meta-alcanzada",
      texto:
        "🎉 ¡Alcanzaste tu peso objetivo! Tu disciplina te llevó hasta aquí. Mantén el rumbo.",
    };
  }

  const cambio7d = metrics.cambioUltimos7DiasKg ?? 0;

  if (cambio7d > 0.5) {
    return {
      motivo: "repunte",
      texto:
        "Esta semana subiste un poco. No pasa nada: vuelve al plan, hidrátate bien y sigue registrando. 💪",
    };
  }

  if (cambio7d < -0.2) {
    return {
      motivo: "buena-perdida",
      texto:
        "¡Excelente ritmo esta semana! Tu cuerpo está respondiendo al keto. Sigue así. 🔥",
    };
  }

  // Estancamiento con pérdida previa acumulada
  if (Math.abs(cambio7d) <= 0.2 && (metrics.perdidaTotalKg ?? 0) > 1) {
    return {
      motivo: "estancamiento",
      texto:
        "Estás en fase de estabilización. Es normal: revisa los carbohidratos ocultos y cuida el sueño. 🧘",
    };
  }

  if (metrics.pesoObjetivo != null && metrics.pesoActual != null) {
    const restante = Number((metrics.pesoActual - metrics.pesoObjetivo).toFixed(1));
    if (restante <= 2) {
      return {
        motivo: "cerca-meta",
        texto: `¡Te faltan solo ${restante} kg para tu meta! El último tramo se gana con constancia. ⚡`,
      };
    }
  }

  return {
    motivo: "general",
    texto:
      "Cada registro cuenta. La constancia diaria es el secreto del éxito en keto. ¡Vas bien! 💚",
  };
}

/** Recomendación automática según el progreso */
export function getAutoRecommendation(metrics: KetoMetrics): AutoContent {
  if (!metrics.hasData) {
    return {
      motivo: "primeros-pasos",
      texto:
        "Empieza pesándote hoy mismo y registra tus comidas principales. Con datos reales tu coach podrá ayudarte mejor.",
    };
  }

  if ((metrics.rachaDias ?? 0) < 3) {
    return {
      motivo: "crear-habito",
      texto:
        "Consejo: registra tus comidas justo después de comer. Crear el hábito de registrar es la base del progreso.",
    };
  }

  if (!metrics.tieneEvidencias) {
    return {
      motivo: "evidencia-foto",
      texto:
        "Añade una foto de tu báscula al registrar el peso: valida tu progreso y ayuda a tu coach a acompañarte.",
    };
  }

  const cambio7d = metrics.cambioUltimos7DiasKg ?? 0;
  if (cambio7d > 0.5) {
    return {
      motivo: "revisar-carbos",
      texto:
        "Revisa los carbohidratos netos de tus últimas comidas: salsas, lácteos y frutos secos suelen esconderlos.",
    };
  }

  if ((metrics.perdidaPorcentaje ?? 0) >= 5) {
    return {
      motivo: "mantener-electrolitos",
      texto:
        "Vas perdiendo un buen porcentaje. Recuerda electrolitos (sodio, magnesio, potasio) para evitar fatiga.",
    };
  }

  return {
    motivo: "proteina",
    texto:
      "Asegura proteína suficiente en cada comida (~1.6 g por kg de peso objetivo): sacia y protege tu músculo.",
  };
}
