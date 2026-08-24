// ============================================================
// Contenido educativo — Bases de Keto
// Artículos estáticos incluidos en la app (no requieren backend).
// ============================================================

export type BaseCategoria =
  | "fundamentos"
  | "cuerpo"
  | "alimentos"
  | "recetas"
  | "sintomas";

export type Bloque =
  | { tipo: "subtitulo"; texto: string }
  | { tipo: "parrafo"; texto: string }
  | { tipo: "lista"; items: string[] }
  | { tipo: "pasos"; items: string[] }
  | { tipo: "tip"; texto: string }
  | { tipo: "alerta"; texto: string };

export interface BaseArticle {
  id: string;
  emoji: string;
  titulo: string;
  resumen: string;
  minutosLectura: number;
  categoria: BaseCategoria;
  bloques: Bloque[];
}

export const BASE_CATEGORIAS: { id: BaseCategoria; label: string }[] = [
  { id: "fundamentos", label: "🧪 Fundamentos" },
  { id: "cuerpo", label: "🫀 Tu cuerpo" },
  { id: "alimentos", label: "🥑 Alimentación" },
  { id: "recetas", label: "🍳 Recetas" },
  { id: "sintomas", label: "🤔 Síntomas" },
];

export const basesArticles: BaseArticle[] = [
  // ==================== FUNDAMENTOS ====================
  {
    id: "que-es-cetosis",
    emoji: "🧪",
    titulo: "¿Qué es la cetosis?",
    resumen:
      "El cambio de combustible: de quemar azúcar a quemar grasa. El corazón del método.",
    minutosLectura: 3,
    categoria: "fundamentos",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          "Tu cuerpo tiene dos gasolinas posibles: glucosa (azúcar, que viene sobre todo de los carbohidratos) y grasa. Cuando hay glucosa disponible, el cuerpo la prefiere primero.",
      },
      {
        tipo: "parrafo",
        texto:
          "La cetosis es el estado metabólico en el que, al reducir mucho los carbohidratos, tu cuerpo cambia de gasolina: empieza a usar su propia grasa como combustible principal, y tu hígado produce unas moléculas llamadas cetonas que alimentan al cerebro y a los músculos.",
      },
      {
        tipo: "parrafo",
        texto:
          "Es un estado natural del ser humano (nuestros ancestros lo vivían cada temporada sin cosechas) y no significa pasar hambre: significa acceder a una reserva energética que ya tenías guardada.",
      },
      { tipo: "subtitulo", texto: "Señales de que estás entrando" },
      {
        tipo: "lista",
        items: [
          "El apetito se vuelve más estable: pasas horas sin pensar en comida",
          "Energía pareja, sin bajonas después de comer",
          "Sabor metálico o distinto en el aliento los primeros días",
          "Orina más clara (vas eliminando agua de más)",
        ],
      },
      {
        tipo: "tip",
        texto:
          "Cetosis NO es cetoacidosis. La cetoacidosis es una emergencia médica de la diabetes tipo 1 con niveles de cetonas peligrosísimos. En personas sanas, la cetosis nutricional mantiene las cetonas en rangos seguros.",
      },
      {
        tipo: "alerta",
        texto:
          "Si vives con diabetes o tomas medicamentos, este camino siempre va de la mano de tu coach y tu médico.",
      },
    ],
  },
  {
    id: "como-entra-cetosis",
    emoji: "🚪",
    titulo: "¿Cómo entra tu cuerpo en cetosis?",
    resumen:
      "La secuencia paso a paso: bajar carbos, vaciar glucógeno y encender la máquina de grasa.",
    minutosLectura: 3,
    categoria: "fundamentos",
    bloques: [
      { tipo: "subtitulo", texto: "La secuencia completa" },
      {
        tipo: "pasos",
        items: [
          "Reduces los carbohidratos netos a ~20–30 g al día (vegetales verdes cuentan poco)",
          "En 24–48 h tu cuerpo agota el glucógeno: la reserva de azúcar guardada en hígado y músculos",
          "Con la reserva vacía, la insulina baja y se activa la lipólisis: abrir la despensa de grasa corporal",
          "El hígado convierte esa grasa en cetonas y las pone en circulación",
          "Entre el día 2 y 7 estás en cetosis plena (depende de tu metabolismo y actividad)",
        ],
      },
      { tipo: "subtitulo", texto: "Lo que acelera el proceso" },
      {
        tipo: "lista",
        items: [
          "Moverte: caminar o entrenar ayuda a gastar el glucógeno restante",
          "Ayuno de 12–14 h nocturno (si tu coach lo aprueba)",
          "Agua suficiente y sal en las comidas",
          "Comidas simples: proteína + grasa buena + verdura verde",
        ],
      },
      { tipo: "subtitulo", texto: "Lo que lo frena" },
      {
        tipo: "lista",
        items: [
          "Un pico de azúcar: 'solo un bocado' del postre",
          "Bebidas con azúcar escondida (jugos, refrescos 'naturales', cafés dulces)",
          "Exceso de frutos secos o lácteos sin medir",
        ],
      },
      {
        tipo: "tip",
        texto:
          "Un solo episodio de carbohidratos altos puede reiniciar el conteo. No pasa nada por un tropiezo, pero retoma el plan desde ya mismo, no desde el lunes.",
      },
    ],
  },
  {
    id: "cetonas-regeneracion",
    emoji: "⚡",
    titulo: "¿Qué son las cetonas? Y su papel en la regeneración celular",
    resumen:
      "Las moléculas que alimentan tu cerebro con grasa… y activan la limpieza interna de tus células.",
    minutosLectura: 4,
    categoria: "fundamentos",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          "Cuando el hígado procesa grasa produce tres tipos de cetonas: acetoacetato, beta-hidroxibutirato (la estrella) y acetona (la responsable del aliento característico del principio).",
      },
      {
        tipo: "parrafo",
        texto:
          "El beta-hidroxibutirato no solo es combustible: es una molécula señal. Le dice a tus células 'tiempos de abundancia de grasa: ponte eficientes'. Tu cerebro, que normalmente exige glucosa, corre excelente con ellas — por eso tanta gente reporta foco mental superior.",
      },
      { tipo: "subtitulo", texto: "Autofagia: la limpieza celular" },
      {
        tipo: "parrafo",
        texto:
          "Con insulina baja y cetonas presentes, las células activan la autofagia: un proceso de reciclaje interno donde limpian piezas dañadas y las reutilizan. Es como ordenar y reparar la casa por dentro. Se asocia a mejor regeneración y envejecimiento celular más saludable.",
      },
      {
        tipo: "lista",
        items: [
          "Combustible cerebral estable → concentración sostenida",
          "Menos antojos: la señal de hambre se normaliza",
          "Menos estrés oxidativo que quemar azúcar constantemente",
        ],
      },
      {
        tipo: "alerta",
        texto:
          "La ciencia de la autofagia avanza rápido pero aún tiene preguntas abiertas. Los efectos individuales varían: tu coach lee TU caso.",
      },
    ],
  },
  {
    id: "desinflamacion",
    emoji: "🌿",
    titulo: "La desinflamación: el gran beneficio silencioso",
    resumen:
      "Por qué bajar el azúcar y los ultraprocesados reduce dolores, hinchazón y fatiga.",
    minutosLectura: 3,
    categoria: "fundamentos",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          "Hay dos inflamaciones: la buena (hinchazón de una lesión que sana) y la crónica de bajo grado: un fuego lento provocado por azúcar constante, ultraprocesados y exceso de carbohidratos. Está detrás de dolores articulares, hinchazón, digestión pesada y ese cansancio que no se quita.",
      },
      {
        tipo: "parrafo",
        texto:
          "Al eliminar azúcar, harinas y ultraprocesados — y al bajar la insulina — ese fuego baja. Muchas personas notan anillos flojos, menos rigidez al despertar y articulaciones más tranquilas antes incluso de ver gran cambio en la báscula.",
      },
      { tipo: "subtitulo", texto: "Lo que suele mejorar (2–6 semanas)" },
      {
        tipo: "lista",
        items: [
          "Retención de líquidos e hinchazón facial",
          "Dolor articular de fondo",
          "Digestión: menos reflujo y pesadez",
          "Piel (menos brotes relacionados con azúcar)",
          "Marcadores de sangre como PCR (pídelo en tus próximos análisis)",
        ],
      },
      {
        tipo: "tip",
        texto:
          "Lleva un mini diario de cómo duermes, duele y te hincha, semana por semana. En un mes tendrás evidencia propia que ningún análisis te dará tan claro.",
      },
    ],
  },

  // ==================== TU CUERPO ====================
  {
    id: "cronologia-cuerpo",
    emoji: "📅",
    titulo: "¿Qué le pasa a tu cuerpo? (día 0 → 30)",
    resumen:
      "La línea de tiempo real de la adaptación: qué esperar en cada semana y por qué.",
    minutosLectura: 4,
    categoria: "cuerpo",
    bloques: [
      { tipo: "subtitulo", texto: "Días 1–3 · Vaciamiento" },
      {
        tipo: "lista",
        items: [
          "Se agota el glucógeno y con él el agua retenida (báscula feliz, rápido)",
          "Posible antojo de dulce: es química, no debilidad",
          "Energía algo irregular mientras cambia el combustible",
        ],
      },
      { tipo: "subtitulo", texto: "Días 4–7 · Keto flu (si aparece)" },
      {
        tipo: "lista",
        items: [
          "Posibles: dolor de cabeza, cansancio, irritabilidad, calambres",
          "Causa real: pierdes sodio y agua al bajar la insulina",
          "Solución: más agua + sal + no hacer ejercicio intenso aún",
        ],
      },
      { tipo: "subtitulo", texto: "Semanas 2–3 · Encendido" },
      {
        tipo: "lista",
        items: [
          "Las cetonas suben y llega la energía estable y el foco",
          "El apetito se apacigua: comidas más simples y satisfactorias",
          "Sueño que se reordena (algunos días raros son normales)",
        ],
      },
      { tipo: "subtitulo", texto: "Semana 4+ · Adaptado" },
      {
        tipo: "lista",
        items: [
          "Grasa como combustible principal: pérdida constante y sostenible",
          "Digestión y hinchazón notablemente mejores",
          "El plan se vuelve rutina, no esfuerzo",
        ],
      },
      {
        tipo: "alerta",
        texto:
          "El keto flu NO es obligatorio ni debe durar semanas: si te golpea fuerte, casi siempre falta sal y agua. Avísale a tu coach.",
      },
    ],
  },
  {
    id: "como-se-quema-grasa",
    emoji: "🔥",
    titulo: "¿Cómo se elimina o consume la grasa corporal?",
    resumen:
      "Nada se 'derrite': así sale realmente la grasa que bajas (spoiler: respiras parte de ella).",
    minutosLectura: 3,
    categoria: "cuerpo",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          "Olvídate del mito de derretir grasa con sudor o cremas. La grasa corporal es una reserva química: cuando la insulina baja, las células la liberan como ácidos grasos (lipólisis), la sangre los lleva a las mitocondrias y ahí se combinan con oxígeno para producir energía.",
      },
      {
        tipo: "parrafo",
        texto:
          "El resultado final sale principalmente por tu RESPIRACIÓN (CO₂) y el resto como agua y calor. Por eso respirar bien, dormir bien y moverte todos ayudan: son parte de la salida del proceso.",
      },
      { tipo: "subtitulo", texto: "Por qué en keto funciona mejor" },
      {
        tipo: "lista",
        items: [
          "Insulina baja = la puerta de la grasa almacenada queda abierta",
          "Comer grasa sacia → comes menos calorías sin pasar hambre",
          "Menos picos de azúcar = menos bloqueos para quemar",
        ],
      },
      {
        tipo: "tip",
        texto:
          "Para perder ~1 kg de grasa pura hacen falta ~7700 kcal de diferencia acumulada. Por eso la báscula diaria engaña y la tendencia semanal habla verdad.",
      },
    ],
  },
  {
    id: "trigliceridos",
    emoji: "🩸",
    titulo: "¿Qué son los triglicéridos?",
    resumen:
      "La grasa que viaja en tu sangre y por qué el exceso de azúcar los dispara.",
    minutosLectura: 3,
    categoria: "cuerpo",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          "Los triglicéridos son la forma en que tu cuerpo transporta grasa por la sangre. Sirven: son la despensa móvil. El problema es tener demasiados circulando todo el tiempo.",
      },
      {
        tipo: "parrafo",
        texto:
          "Dato clave que sorprende a todos: la mayor parte de tus triglicéridos NO viene de comer grasa, sino del exceso de azúcar y carbohidratos que no usaste — el hígado los convierte en grasa de transporte (lipogénesis de novo).",
      },
      { tipo: "subtitulo", texto: "Patrón típico en keto bien hecha" },
      {
        tipo: "lista",
        items: [
          "Triglicéridos ↓ (bajan claramente)",
          "HDL (colesterol bueno) ↑",
          "Glucosa e insulina en ayunas ↓",
        ],
      },
      {
        tipo: "tip",
        texto:
          "Pide análisis antes de empezar y a los 3–6 meses. Los números objetivos son la mejor motivación que existe.",
      },
      {
        tipo: "alerta",
        texto:
          "Jamás ajustes medicamentos (estatinas, insulina, antihipertensivos) por tu cuenta: eso se decide con tu médico viendo tus resultados.",
      },
    ],
  },
  {
    id: "agua-o-grasa",
    emoji: "⚖️",
    titulo: "¿He perdido agua, grasa o ambas?",
    resumen:
      "Por qué la primera semana baja rapidísimo… y por qué eso no es la meta (pero sí buen inicio).",
    minutosLectura: 3,
    categoria: "cuerpo",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          "Cada gramo de glucógeno guarda ~3 gramos de agua. Al vaciar las reservas de azúcar la primera semana, sueltas también esa agua: por eso la báscula cae 2–3 kg rapidísimo. Es agua real, pero no es LA meta.",
      },
      {
        tipo: "parrafo",
        texto:
          "Después el ritmo se normaliza: 0.5–1 kg por semana es el rango sano de grasa real. Ahí la báscula se mueve lento y engaña — entran en juego otras métricas.",
      },
      { tipo: "subtitulo", texto: "Cómo saber si bajas grasa de verdad" },
      {
        tipo: "lista",
        items: [
          "Talla de ropa (cinturón, pantalón) cada 2 semanas",
          "Fotos frente/perfil misma luz y pose, cada 2 semanas",
          "Medición de cintura con cinta",
          "Tendencia de peso promediando la semana, nunca un día suelto",
        ],
      },
      {
        tipo: "tip",
        texto:
          "Respuesta corta: al inicio ambas, después grasa. Usa báscula + fotos + cintura y deja que tu coach interprete la película completa.",
      },
    ],
  },

  // ==================== ALIMENTACIÓN ====================
  {
    id: "alimentos-permitidos",
    emoji: "🥑",
    titulo: "Alimentos permitidos: el semáforo keto",
    resumen:
      "Qué comer sin pensarlo, qué moderar y qué dejar fuera — la guía definitiva.",
    minutosLectura: 4,
    categoria: "alimentos",
    bloques: [
      { tipo: "subtitulo", texto: "✅ Base diaria (sin culpa)" },
      {
        tipo: "lista",
        items: [
          "Proteína: res, cerdo, pollo, pavo, pescado, mariscos, huevo",
          "Grasas buenas: aguacate, aceite de oliva, coco, mantequilla, manteca de cerdo",
          "Vegetales verdes y bajos: espinaca, lechuga, pepino, calabacita, brócoli, espárragos, ejote, coliflor",
          "Quesos naturales (sin procesar) con moderación natural",
          "Bebidas: agua, café y té sin azúcar, agua mineral",
        ],
      },
      { tipo: "subtitulo", texto: "⚠️ Con moderación (midelos)" },
      {
        tipo: "lista",
        items: [
          "Frutos secos: nuez, almendra, pacana (fáciles de pasarse)",
          "Lácteos enteros: crema, queso crema",
          "Bayas: fresas, moras, arándanos (puñados pequeños)",
          "Chocolate ≥85%",
          "Cebolla, zanahoria, tomate (carbos suman rápido)",
        ],
      },
      { tipo: "subtitulo", texto: "❌ Fuera del plan" },
      {
        tipo: "lista",
        items: [
          "Azúcar en TODAS sus formas: mesa, miel, agave, piloncillo",
          "Harinas: pan, tortilla de maíz/trigo, pasta, galletas",
          "Arroz, papa, camote, elote",
          "Frijoles, lentejas, garbanzos",
          "Frutas altas: plátano, mango, uva, sandía, naranja (jugo = peor)",
          "Refrescos, jugos, bebidas 'light' ultraprocesadas",
        ],
      },
      {
        tipo: "tip",
        texto:
          "Regla de etiqueta: Carbohidratos netos = carbohidratos totales − fibra. Y cuidado con los 'aptos para keto' ultraprocesados: si tiene 20 ingredientes raros, no es comida.",
      },
    ],
  },

  // ==================== RECETAS ====================
  {
    id: "receta-hotcakes-coco",
    emoji: "🥞",
    titulo: "Hot cakes de coco con crema de cacahuate",
    resumen: "Desayuno de antojo sin remordimiento · ~15 min · <8 g netos",
    minutosLectura: 2,
    categoria: "recetas",
    bloques: [
      {
        tipo: "lista",
        items: [
          "2 huevos",
          "2 cucharadas de harina de coco",
          "1 cucharada de eritritol (o tu edulcorante)",
          "Pizca de canela y ¼ cucharadita de polvo para hornear",
          "Mantequilla para la sartén",
        ],
      },
      { tipo: "subtitulo", texto: "Preparación" },
      {
        tipo: "pasos",
        items: [
          "Mezcla todo hasta integrar y deja reposar 2 min (la harina de coco espesa)",
          "Sartén a fuego medio-bajo con un poco de mantequilla",
          "Vierte porciones pequeñas; voltea cuando burbujee y esté dorado abajo",
          "Sirve con crema batida sin azúcar y 3 frambuesas",
        ],
      },
      {
        tipo: "tip",
        texto: "Rinde 4–5 hot cakes (~8 g de carbos netos TODO el plato).",
      },
    ],
  },
  {
    id: "receta-tacos-lechuga",
    emoji: "🌮",
    titulo: "Tacos de lechuga con pollo",
    resumen: "El antojo de tacos resuelto · ~20 min · ~6 g netos por 3 tacos",
    minutosLectura: 2,
    categoria: "recetas",
    bloques: [
      {
        tipo: "lista",
        items: [
          "1 pechuga de pollo en cubos",
          "Comino, paprika y ajo en polvo, sal y pimienta",
          "Hojas de lechuga butter o romana (las 'tortillas')",
          "Aguacate en rebanadas y limón",
          "Pico de gallo sin exceso de chile (opcional)",
        ],
      },
      { tipo: "subtitulo", texto: "Preparación" },
      {
        tipo: "pasos",
        items: [
          "Sazona el pollo con las especias",
          "Fríe a fuego medio-alto hasta dorar (8–10 min)",
          "Rellena las hojas de lechuga, agrega aguacate y pico",
          "Exprime limón encima y a disfrutar",
        ],
      },
      {
        tipo: "tip",
        texto: "Doble de proteína y menos hojas = cena perfecta post-entreno.",
      },
    ],
  },
  {
    id: "receta-cafe-bala",
    emoji: "☕",
    titulo: "Café bala (bulletproof)",
    resumen: "Combustible matutino cremoso · ~5 min · 0 g netos",
    minutosLectura: 1,
    categoria: "recetas",
    bloques: [
      {
        tipo: "lista",
        items: [
          "250 ml de café caliente",
          "1 cucharada de mantequilla sin sal (o ghee)",
          "1 cucharadita de aceite MCT o de coco",
        ],
      },
      { tipo: "subtitulo", texto: "Preparación" },
      {
        tipo: "pasos",
        items: [
          "Todo a la licuadora",
          "Licúa 20 segundos hasta que emulsione (quede cremoso, no con charco de aceite)",
          "Sirve y disfruta despacio",
        ],
      },
      {
        tipo: "tip",
        texto:
          "Si tu coach aprueba el ayuno extendido, el café bala cuenta como grasa pura: no agregues más grasas libres en esa ventana.",
      },
    ],
  },
  {
    id: "receta-aguachile",
    emoji: "🍤",
    titulo: "Aguachile verde",
    resumen: "Cena fresca de restaurante · ~25 min · <4 g netos",
    minutosLectura: 2,
    categoria: "recetas",
    bloques: [
      {
        tipo: "lista",
        items: [
          "300 g de camarón (fresco para curar o precocido para rapidez)",
          "1 pepino en rodajas",
          "1–2 chiles serranos, 1 diente de ajo, cilantro y jugo de 6 limones",
          "Cebolla morada en plumas, sal",
        ],
      },
      { tipo: "subtitulo", texto: "Preparación" },
      {
        tipo: "pasos",
        items: [
          "Licúa serrano, ajo, cilantro, jugo de limón y sal: esa es el agua chile",
          "Si es fresco: cura el camarón 15 min en el jugo (deja de ser translúcido). Precocido: solo mézclalo",
          "Integra pepino y cebolla, refrigera 10 min y sirve",
        ],
      },
      {
        tipo: "tip",
        texto: "Aguacate en cubos arriba lo vuelve una cena completa de viernes.",
      },
    ],
  },
  {
    id: "receta-flan-coco",
    emoji: "🍮",
    titulo: "Flan de coco sin azúcar",
    resumen: "Postre de fiesta aprobado · ~60 min · ~3 g netos por porción",
    minutosLectura: 2,
    categoria: "recetas",
    bloques: [
      {
        tipo: "lista",
        items: [
          "4 huevos",
          "200 ml de crema de leche",
          "200 ml de leche de coco",
          "½ taza de eritritol (o al gusto) + vainilla",
          "Caramelo de eritritol para el molde (opcional)",
        ],
      },
      { tipo: "subtitulo", texto: "Preparación" },
      {
        tipo: "pasos",
        items: [
          "Licúa huevos, cremas, edulcorante y vainilla",
          "Vierte al molde caramelizado",
          "Baño María tapado: 40–45 min a 180 °C (o vaporera)",
          "Enfría por completo antes de desmoldar: firme perfecto",
        ],
      },
      {
        tipo: "tip",
        texto: "Rinde 6 porciones. Refrigerado dura 4 días (si sobrevive).",
      },
    ],
  },

  // ==================== SÍNTOMAS ====================
  {
    id: "energia-foco",
    emoji: "🚀",
    titulo: "Mucha energía y foco mental",
    resumen:
      "El superpoder reportado por casi todos: por qué aparece y cuándo esperararlo.",
    minutosLectura: 2,
    categoria: "sintomas",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          "Tu cerebro es el consumidor más exigente de glucosa. Cuando corre con cetonas recibe un combustible constante, sin picos ni valles: el resultado que describe la mayoría es energía pareja todo el día y una claridad mental notable.",
      },
      {
        tipo: "lista",
        items: [
          "Normalmente aparece entre la semana 2 y 3 (primero se adapta el cuerpo, luego el cerebro)",
          "Se nota más en las mañanas y en tardes donde antes había 'bajona'",
          "Va acompañado de apetito tranquilo: comes para vivir, no por ansia",
        ],
      },
      {
        tipo: "tip",
        texto:
          "Identifica tu ventana de máximo foco y ponla a trabajar en lo importante del día. Es un regalo de la adaptación: aprovéchalo.",
      },
    ],
  },
  {
    id: "no-puedes-dormir",
    emoji: "🌙",
    titulo: "¿No puedes dormir?",
    resumen:
      "Insomnio inicial: por qué pasa los primeros días y cómo resolverlo rápido.",
    minutosLectura: 3,
    categoria: "sintomas",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          "Al inicio algunos reportan sueño ligero o despertares a media noche. Es temporal: el cuerpo está cambiando de combustible y los electrolitos están en transición. No es para alarmarse, sí para ajustar.",
      },
      { tipo: "subtitulo", texto: "Ajustes que funcionan" },
      {
        tipo: "lista",
        items: [
          "Sal suficiente en las comidas (el sodio bajo fragmenta el sueño)",
          "Última cafeína antes de las 2 pm",
          "Cena ligera 2–3 h antes de acostarte (evita grasa pesada tarde al inicio)",
          "Cuarto oscuro y fresco; pantalla fuera 30 min antes",
          "Magnesio por la noche puede ayudar (consúltalo con tu coach)",
        ],
      },
      {
        tipo: "alerta",
        texto:
          "Si el mal sueño persiste más de 2 semanas o viene con palpitaciones, toca el tema con tu coach: se revisa cena, electrolitos y horarios contigo.",
      },
    ],
  },
  {
    id: "dolor-de-cabeza",
    emoji: "🤕",
    titulo: "Te duele la cabeza",
    resumen:
      "El clásico keto flu: casi siempre es falta de sodio y agua, no algo grave.",
    minutosLectura: 2,
    categoria: "sintomas",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          "Cuando la insulina baja, los riñones eliminan sodio y agua de más (efecto diurético natural del keto). Un cerebro hidratado con pocos electrolitos duele. Ese es el 90% de los casos.",
      },
      { tipo: "subtitulo", texto: "Protocolo rápido" },
      {
        tipo: "lista",
        items: [
          "Vaso grande de agua + pizca extra de sal en la siguiente comida",
          "Potasio: aguacate, espinacas, calabacita",
          "Magnesio: semillas, verduras verdes (o suplemento si tu coach lo indica)",
          "Baja la intensidad del ejercicio estos días: camina, no rompas records",
        ],
      },
      {
        tipo: "tip",
        texto:
          "Un pellizco de sal bajo la lengua + sorbos de agua alivia en minutos a mucha gente. Suena raro, funciona de verdad.",
      },
      {
        tipo: "alerta",
        texto:
          "Dolor intenso persistente o con otros síntomas raros ≠ keto flu: consulta médica sin esperarlo.",
      },
    ],
  },
  {
    id: "agua-y-sal",
    emoji: "💧",
    titulo: "¿Cuánta agua debo tomar? (y lo de la sal bajo la lengua)",
    resumen:
      "Hidratación con números claros, electrolitos y el truco del pellizco de sal.",
    minutosLectura: 3,
    categoria: "sintomas",
    bloques: [
      { tipo: "subtitulo", texto: "Agua: la guía práctica" },
      {
        tipo: "lista",
        items: [
          "~30–35 ml por kg de peso al día (70 kg ≈ 2.1–2.5 L)",
          "Repartida durante el día, no de golpe",
          "Termómetro casero: orina amarillo claro = vas bien; oscura = te falta agua",
        ],
      },
      { tipo: "subtitulo", texto: "Electrolitos: el trío que manda" },
      {
        tipo: "lista",
        items: [
          "Sodio: el protagonista en keto. Sazona de verdad tus comidas",
          "Potasio: aguacate, espinaca, calabacita",
          "Magnesio: semillas, verdes; suplemento solo si tu coach lo sugiere",
        ],
      },
      {
        tipo: "tip",
        texto:
          "EL TRUCO: ante mareo, fatiga repentina o dolor de cabeza — un pellizco de sal bajo la lengua, déjala disolver 30 segundos y toma agua despacio. Repuesto instantáneo de sodio. Llévalo contigo: una bolsita de sal en la bolsa/chamarra no pesa nada.",
      },
      {
        tipo: "alerta",
        texto:
          "Vives con hipertensión o enfermedad renal? La cantidad de sodio la define tu médico. Este tip general no sustituye su indicación.",
      },
    ],
  },

  // ==================== TANDA 2 · FUNDAMENTOS ====================
  {
    id: "insulina-hormona-llave",
    emoji: "🗝️",
    titulo: "Insulina: la hormona llave",
    resumen:
      "La llave que abre y cierra la puerta de tu despensa de grasa. Entiéndela y todo cuadra.",
    minutosLectura: 3,
    categoria: "fundamentos",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          "La insulina es la hormona de almacenamiento. Cada vez que comes (sobre todo carbohidratos), sube para guardar el exceso de energía: primero llena el glucógeno, y lo que no cabe… directo a grasa corporal.",
      },
      {
        tipo: "parrafo",
        texto:
          "Lo crucial para ti: mientras la insulina esté alta, la puerta de TU grasa almacenada está CERRADA. No importa cuántas camines o cuántas calorías recortes: con insulina alta, quemar esa reserva es casi imposible. Cuando baja (keto), la puerta se abre.",
      },
      { tipo: "subtitulo", texto: "Qué tanto sube la insulina" },
      {
        tipo: "lista",
        items: [
          "Carbohidratos: sube fuerte (es su trabajo)",
          "Proteína: sube un poco (necesario y sano en las comidas)",
          "Grasa: casi ni se inmuta",
        ],
      },
      {
        tipo: "parrafo",
        texto:
          "Por eso keto funciona tan bien para perder grasa: mantiene la insulina baja y estable entre comidas, dando a tu cuerpo acceso permanente a la despensa.",
      },
      {
        tipo: "tip",
        texto:
          "Dos comidas sin 'medios bocadillos' entre ellas = ventanas largas con insulina baja = tiempo real quemando grasa. El picoteo continuo mata esas ventanas.",
      },
    ],
  },
  {
    id: "cerebro-necesita-azucar-mito",
    emoji: "🧠",
    titulo: "\"El cerebro necesita azúcar\": el mito",
    resumen:
      "Verdad a medias: necesita UN POCO de glucosa… y tu cuerpo la fabrica sola. Te explicamos.",
    minutosLectura: 3,
    categoria: "fundamentos",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          "Es la objeción #1: \"¿y mi cerebro?\". La verdad completa: el cerebro sí consume glucosa, pero NO necesitas comer azúcar para dársela. Tu hígado fabrica toda la glucosa mínima necesaria a partir de proteína y de la grasa misma: se llama gluconeogénesis. Es un proceso automático, seguro y que existe desde siempre.",
      },
      {
        tipo: "parrafo",
        texto:
          "Además, tras unas semanas adaptado, hasta ~70% del combustible cerebral puede venir de cetonas. El requerimiento real de glucosa cae drásticamente.",
      },
      { tipo: "subtitulo", texto: "De dónde sale esa glucosa mínima" },
      {
        tipo: "lista",
        items: [
          "De la proteína que comes (parte se convierte en glucosa a demanda)",
          "Del glicerol liberado al quemar tus reservas de grasa",
          "Nunca hace falta 'cargar azúcar' para cubrirla",
        ],
      },
      {
        tipo: "parrafo",
        texto:
          "Los vegetales bajos que comes aportan carbos suficientes de regalo. Por eso el plan no es 'cero carbohidratos': es cero azúcar y harinas, con verduras de sobra.",
      },
      {
        tipo: "alerta",
        texto:
          "Diabetes tipo 1, embarazo o condiciones especiales: este camino requiere acompañamiento médico cercano. No es un mito ahí, es seriedad clínica.",
      },
    ],
  },

  // ==================== TANDA 2 · TU CUERPO ====================
  {
    id: "meseta-stall",
    emoji: "⏳",
    titulo: "Meseta: cuando la báscula se detiene",
    resumen:
      "Llega en la semana 4–6 a casi todos. No es fracaso: tiene causas claras y solución clara.",
    minutosLectura: 4,
    categoria: "cuerpo",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          "Semana 4–6: la báscula se congela. Pánico inicial injustificado: una meseta dura unos días (a veces 2 semanas) y casi siempre es AGUA nueva tapando grasa que SÍ estás perdiendo.",
      },
      { tipo: "subtitulo", texto: "Las 4 causas reales" },
      {
        tipo: "lista",
        items: [
          "Retención de agua: entrenas nuevo, estrés, ciclo menstrual, sal variable — la grasa sigue bajando pero el agua la tapa en el número",
          "Calorías que se colaron: quesos, frutos secos y aceites 'al ojo' suman rápido",
          "Pasos diarios bajaron: el trabajo de oficina gana partidos silenciosos",
          "Salsas y aderezos con carbos ocultos",
        ],
      },
      { tipo: "subtitulo", texto: "Protocolo anti-meseta (en orden)" },
      {
        tipo: "pasos",
        items: [
          "Respira: compara fotos y cintura de hace 2 semanas, no la báscula del día",
          "Auditoría honesta de 3 días: anota TODO, con cantidades reales",
          "Mide aceites, quesos y frutos secos con cucharas, no 'al ojo'",
          "+1,000–2,000 pasos diarios",
          "Revisa salsas/aderezos con lupa de etiquetas",
          "Si nada movió en 2–3 semanas: revisión con tu coach (ajusta él/ella, no improvises)",
        ],
      },
      {
        tipo: "alerta",
        texto:
          "Nunca te auto-recortes proteína drásticamente ni hagas días de hambre para 'romper' la meseta: eso cuesta músculo y rebota. Con tu coach hay ajustes inteligentes.",
      },
    ],
  },
  {
    id: "estrenimiento-keto",
    emoji: "🚻",
    titulo: "Estreñimiento en keto",
    resumen:
      "El tema incómodo que le pasa a medio mundo. Causas claras, soluciones simples.",
    minutosLectura: 3,
    categoria: "cuerpo",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          "Al salir los granos y harinas, baja la fibra total; si además el agua no acompaña, el intestino se vuelve perezoso. Es temporal y tiene protocolo.",
      },
      { tipo: "subtitulo", texto: "El protocolo (en orden de importancia)" },
      {
        tipo: "lista",
        items: [
          "Verdura verde en AL MENOS dos comidas al día: brócoli, espinaca, chayote, ejote, coliflor",
          "Agua: sin los 2 litros, nada de lo demás funciona",
          "Chia o linaza hidratadas (1 cda en agua 15 min) agregadas al desayuno",
          "Magnesio por la noche (pregúntale a tu coach): ayuda a mover y a dormir",
          "Caminata de 15–20 min: el intestino responde al movimiento",
          "Café de la mañana: aliado legal",
        ],
      },
      {
        tipo: "alerta",
        texto:
          "Más de 4 días con dolor o con sangre → médico, sin rodeos. Y laxantes estimulantes solo bajo indicación: cronificados empeoran el problema.",
      },
      {
        tipo: "tip",
        texto:
          "Previene desde el día 1: verdura verde x2 + agua + chia. Mucho más fácil prevenir que resolver.",
      },
    ],
  },

  // ==================== TANDA 2 · ALIMENTACIÓN ====================
  {
    id: "guia-super-keto",
    emoji: "🛒",
    titulo: "Guía de súper keto (por pasillo)",
    resumen:
      "Tu lista de compras organizada como un súper mexicano real. Copia, pega, compra.",
    minutosLectura: 4,
    categoria: "alimentos",
    bloques: [
      { tipo: "subtitulo", texto: "🥩 Carnicería" },
      {
        tipo: "lista",
        items: [
          "Res: arrachera, diezmillo, bistec, molida PURA de res (lee que no lleve soya)",
          "Cerdo: chuleta, lomo, chicharrón de mercado",
          "Pollo: muslos (más baratos y sabrosos), pechuga con piel",
          "Pescadería: camarón, salmón cuando haya oferta, atún fresco",
        ],
      },
      { tipo: "subtitulo", texto: "🥬 Frutas y verduras" },
      {
        tipo: "lista",
        items: [
          "Espinaca, lechuga, pepino, calabacita, brócoli, ejote, coliflor",
          "Aguacate (maduro y firme: escalona tus días), limones, chile serrano",
          "Cilantro, cebolla (poca), jitomate (pocos), champiñones, nopales, espárragos",
        ],
      },
      { tipo: "subtitulo", texto: "🧀 Lácteos" },
      {
        tipo: "lista",
        items: [
          "Crema entera, mantequilla REAL (que diga 100% mantequilla)",
          "Queso Oaxaca, panela, fresco, manchego natural",
          "Queso crema (moderación)",
        ],
      },
      { tipo: "subtitulo", texto: "🥫 Abarrotes" },
      {
        tipo: "lista",
        items: [
          "Aceite de oliva y de coco, atún en agua, sardinas",
          "Harina de coco y de almendra, eritritol o estevia",
          "Sal de grano, pimienta, comino, paprika, orégano, chiles secos",
          "Café, té, agua mineral (tu soda keto)",
          "Almendras y nueces SIN sal (porción medida)",
        ],
      },
      { tipo: "subtitulo", texto: "❄️ Congelados" },
      {
        tipo: "lista",
        items: ["Brócoli y espinaca congelados (salvan cenas)", "Bayas para ocasión especial"],
      },
      {
        tipo: "tip",
        texto:
          "Reglas de oro: nunca vayas con hambre, recorre primero el perímetro (frescos) y deja los pasillos centrales para tu lista exacta. Lista impresa = presupuesto intacto.",
      },
    ],
  },
  {
    id: "carbohidratos-ocultos",
    emoji: "🔍",
    titulo: "Carbohidratos ocultos: lee etiquetas como detective",
    resumen:
      "El azúcar se esconde con 20 nombres distintos. Aquí aprendes a atraparlo siempre.",
    minutosLectura: 4,
    categoria: "alimentos",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          "Muchos tropiezos 'inexplicables' vienen de productos que parecen inocentes: salsas, aderezos, embutidos, cafés preparados. El detective keto lee DOS cosas: tabla de nutriments y LISTA DE INGREDIENTES — nunca el frente bonito del empaque.",
      },
      { tipo: "subtitulo", texto: "Alias del azúcar (memorízalos)" },
      {
        tipo: "lista",
        items: [
          "Azúcar, dextrosa, dextrosa de maíz, maltodextrina",
          "Jarabe de maíz de alta fructosa, miel, agave, piloncillo",
          "Jugo de fruta concentrado, melaza, cebada malteada",
          "'Azúcar de coco', 'néctar'… todo eso es azúcar con traje",
        ],
      },
      { tipo: "subtitulo", texto: "Trampas clásicas en México" },
      {
        tipo: "lista",
        items: [
          "Embutidos con relleno de soya/almidón (molida 'especial')",
          "Ketchup, salsas botaneras y aderezos: 4–8 g de azúcar por cuchara",
          "Yogur 'natural' azucarado y leche (lactosa suma)",
          "Moles y adobos preparados con pan, azúcar o galleta",
          "Caldos en polvo con maltodextrina",
        ],
      },
      { tipo: "subtitulo", texto: "El método detective (30 segundos)" },
      {
        tipo: "pasos",
        items: [
          "Lee ingredientes: si azúcar o algún alias va entre los 3 primeros → devuélvelo",
          "Busca alias ocultos en toda la lista",
          "Checa carbohidratos totales y aplica: netos = totales − fibra",
          "Ojo con el tamaño de porción: '8 g por ¼ de taza' engaña",
        ],
      },
      {
        tipo: "alerta",
        texto:
          "La maltodextrina sube la glucosa incluso MÁS rápido que el azúcar de mesa, aunque se anuncie como 'carbohidrato complejo'. Vigílala en polvos y suplementos.",
      },
    ],
  },

  // ==================== TANDA 2 · VIDA SOCIAL ====================
  {
    id: "vida-social-taquerias",
    emoji: "🎉",
    titulo: "Taquerías, fiestas y bodas: vida social keto",
    resumen:
      "Salir a comer fuera sin romper el plan — guía práctica para México real.",
    minutosLectura: 4,
    categoria: "alimentos",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          "El keto no vive en tu cocina, vive en tu vida real: taquis con amigos, cumpleaños, bodas de la prima. La buena noticia: la comida mexicana de verdad (carne, cebolla, cilantro, limón, aguacate) ES keto. Lo que estorba es la tortilla y el refresco — y eso se resuelve.",
      },
      { tipo: "subtitulo", texto: "Antes de salir" },
      {
        tipo: "lista",
        items: [
          "Come algo de proteína antes: llegas con cabeza fría, no con hambre de tortilla",
          "Decide tu bebida ANTES (ver abajo) — la decisión tomada en casa no se discute en la mesa",
          "Si es evento grande con mesa de dulces: lleva tu propio postre keto en la bolsa",
        ],
      },
      { tipo: "subtitulo", texto: "En cada lugar clásico" },
      {
        tipo: "lista",
        items: [
          "Taquería: tacos de asada/trípas DESARMADOS ('en plato, sin tortilla, jefe'), arrachera, cebollitas y guacamole",
          "Mariscos: aguachile, ceviche sin galleta, coctél sin catsup, pescado sarandeado",
          "Asado/parrilla: corte + nopales + ensalada verde; cuidado con salsas BBQ comerciales (azúcar)",
          "Fonda/comida corrida: pide guisado SIN arroz/sopa y doble verdura",
          "Bodas: platillo fuerte de carne, quítale la base (puré/arroz), brindis estratégico",
        ],
      },
      { tipo: "subtitulo", texto: "Bebidas" },
      {
        tipo: "lista",
        items: [
          "Destilados con agua mineral y limón: tequila, mezcal, whisky, vodka seco",
          "Vino tinto seco: una copa, moderación",
          "Evita: cerveza (pan líquido), micheladas completas, cocteles con azúcar",
        ],
      },
      {
        tipo: "tip",
        texto:
          "Tu frase lista, memorizada: \"Voy muy bien con mi plan, gracias\" + cambia de tema sonriendo. Nadie insiste más de dos veces cuando respondes seguro.",
      },
      {
        tipo: "alerta",
        texto:
          "Un evento con exceso de carbohidratos PAUSA la cetosis, no borra tu progreso. Al día siguiente: desayuno keto limpio, agua + sal, y sigues. El plan se retoma en la siguiente comida, no el siguiente lunes.",
      },
    ],
  },

  // ==================== TANDA 2 · RECETAS ====================
  {
    id: "receta-chilaquiles-verdes-keto",
    emoji: "🌯",
    titulo: "Chilaquiles verdes keto",
    resumen: "El desayuno mexicano de antojo, resuelto · ~25 min · ~7 g netos",
    minutosLectura: 2,
    categoria: "recetas",
    bloques: [
      {
        tipo: "lista",
        items: [
          "100 g de harina de almendra + 50 g de queso rallado + 1 huevo (para los 'totopos')",
          "8–10 tomates verdes, 1 serrano, ajo, cilantro",
          "2 huevos por persona",
          "Crema, queso fresco y cebolla picada para servir",
        ],
      },
      { tipo: "subtitulo", texto: "Preparación" },
      {
        tipo: "pasos",
        items: [
          "Totopos: mezcla almendra + queso + huevo, extiende fino entre papel encerado y hornea 10–12 min a 180 °C; corta triángulos y dora en sartén",
          "Salsa: cuece tomatillo con serrano y ajo, licúa con cilantro y sazónala en sartén",
          "Integra los totopos a la salsa SOLO 30 segundos (que no se ablanden)",
          "Sirve con huevo estrellado encima, crema y queso",
        ],
      },
      {
        tipo: "tip",
        texto:
          "Versión comida: agrégale pollo deshebrado a la salsa y tienes la cena completa de la semana.",
      },
    ],
  },
  {
    id: "receta-pollo-chipotle-crema",
    emoji: "🌶️",
    titulo: "Pollo en chipotle con crema",
    resumen: "Clásico reconfortante sobre espagueti de calabacita · ~30 min · ~6 g netos",
    minutosLectura: 2,
    categoria: "recetas",
    bloques: [
      {
        tipo: "lista",
        items: [
          "2 pechugas o 4 muslos deshuesados",
          "2–3 chipotles en adobo picados (lee etiqueta: sin azúcar añadido)",
          "200 ml de crema entera",
          "Ajo, cebolla, mantequilla, sal y pimienta",
          "2 calabacitas en espagueti (con pelador o juliana)",
        ],
      },
      { tipo: "subtitulo", texto: "Preparación" },
      {
        tipo: "pasos",
        items: [
          "Sazona y sella el pollo en mantequilla; reserva",
          "En la misma sartén: cebolla y ajo; agrega chipotle y sofríe 1 min",
          "Vierte la crema, integra y regresa el pollo; cocina 10 min a fuego bajo",
          "Aparte, saltea el espagueti de calabacita 3 min (al dente) y sirve como cama",
        ],
      },
      {
        tipo: "tip",
        texto: "Un toque de queso rallado encima al final lo convierte en comida de domingo.",
      },
    ],
  },
  {
    id: "receta-guacamole-chicharron",
    emoji: "🥑",
    titulo: "Guacamole con chicharrones",
    resumen: "Snack de reunión aprobado · ~10 min · ~4 g netos por porción",
    minutosLectura: 1,
    categoria: "recetas",
    bloques: [
      {
        tipo: "lista",
        items: [
          "2 aguacates maduros",
          "Jugo de ½ limón, sal al gusto",
          "Cebolla morada y cilantro picados finos, tomate cherry opcional",
          "Chicharrón de cerdo de mercado, trozado grueso",
        ],
      },
      { tipo: "subtitulo", texto: "Preparación" },
      {
        tipo: "pasos",
        items: [
          "Machaca aguacate con limón y sal (deja trocitos)",
          "Integra cebolla, cilantro y tomate",
          "Sirve con chicharrón como 'totopo' — se come con las manos, como debe ser",
        ],
      },
      {
        tipo: "tip",
        texto:
          "Arma el guac al momento para que no se oxide. Chicharrón de mercado ≫ de bolsa: menos aceites raros, más crujido real.",
      },
    ],
  },
  {
    id: "receta-consome-pollo",
    emoji: "🍲",
    titulo: "Consomé de pollo con verduras",
    resumen: "Aliado oficial del keto flu · ~45 min · ~5 g netos",
    minutosLectura: 2,
    categoria: "recetas",
    bloques: [
      {
        tipo: "lista",
        items: [
          "4 muslos de pollo CON hueso y piel",
          "2 litros de agua, ½ cebolla, 2 dientes de ajo",
          "Calabacita y champiñones en trozos (media zanahoria opcional)",
          "Laurel, tomillo, SAL GENEROSA (aquí está el oro)",
          "Cilantro y limón para servir",
        ],
      },
      { tipo: "subtitulo", texto: "Preparación" },
      {
        tipo: "pasos",
        items: [
          "Todo al agua fría; al hervir, retira la espuma",
          "Fuego bajo 35–40 min con tapa",
          "Deshebra el pollo, ajusta la sal (generosa), regresa verduras",
          "Sirve con cilantro y limón exprimido",
        ],
      },
      {
        tipo: "tip",
        texto:
          "Este consomé es sodio natural en taza: perfecto para días de keto flu, después de entrenar o de noche fría. La sal aquí no es pecado, es medicina.",
      },
    ],
  },
  {
    id: "receta-carne-asada-nopales",
    emoji: "🥩",
    titulo: "Carne asada con nopales",
    resumen: "Domingo de parrilla sin culpa · ~20 min · ~6 g netos",
    minutosLectura: 2,
    categoria: "recetas",
    bloques: [
      {
        tipo: "lista",
        items: [
          "Arrachera o diezmillo (500 g)",
          "Nopales en tiras, cebolla en cuartos",
          "Limón, sal de grano, orégano",
          "Guacamole para acompañar (opcional pero recomendadísimo)",
        ],
      },
      { tipo: "subtitulo", texto: "Preparación" },
      {
        tipo: "pasos",
        items: [
          "Sazona la carne solo con sal de grano 20 min antes",
          "Nopales y cebolla al comal/plancha hasta que suelten su baba y se evapore",
          "Asa la carne al término que gustes; deja reposar 5 min antes de rebanar",
          "Rebana CONTRA la fibra y sirve con limón, orégano y guacamole",
        ],
      },
      {
        tipo: "tip",
        texto:
          "Cortar contra la fibra (perpendicular a las líneas del músculo) duplica la ternura. Detalle de 3 segundos, diferencia enorme.",
      },
    ],
  },
  {
    id: "receta-mousse-fresa",
    emoji: "🍓",
    titulo: "Mousse de fresa sin azúcar",
    resumen: "Postre elegante de 3 ingredientes · ~10 min + frío · ~5 g netos",
    minutosLectura: 1,
    categoria: "recetas",
    bloques: [
      {
        tipo: "lista",
        items: [
          "200 ml de crema para batir (fría de refrigerador)",
          "5 fresas medianas",
          "Edulcorante al gusto (eritritol en polvo) + gotas de vainilla",
        ],
      },
      { tipo: "subtitulo", texto: "Preparación" },
      {
        tipo: "pasos",
        items: [
          "Bate la crema fría con edulcorante y vainilla hasta punto de copete firme",
          "Machaca 3 fresas e intégralas con movimientos envolventes",
          "Sirve en copas, decora con la fresa restante rebanada",
          "Refrigera 30 min mínimo",
        ],
      },
      {
        tipo: "tip",
        texto:
          "Rinde 3 copas. Para aniversarios: fresa rebanada en abanico arriba = nivel restaurante con 5 g de carbos netos.",
      },
    ],
  },
];
