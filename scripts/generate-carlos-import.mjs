// ============================================================
// Generador del archivo de importación histórico de Carlos.
// Produce: imports/import-carlos.xlsx (formato KetoFlow).
// Usuario destino: Carlos Olivera Mispireta (coliveramispireta@gmail.com)
// Fuente: HTML completo de la conversación de Carlos con su coach keto
//         (380 mensajes decodificados → línea de tiempo 15/07–25/08/2026)
//         + imports/DIETA KETO.pdf (misma conversación, exportación).
// Pesajes reales del chat: 19/07 = 98.5 kg, 01/08 = 98.5 kg,
//        27/08 = 91.0 kg (peso actual confirmado por el usuario).
// Formato 100% compatible con src/features/coach/importview.tsx:
//   - Hoja "Pesos"    → Fecha (dd/mm/yyyy) | Peso (kg) | Nota
//   - Hoja "Comidas"  → Fecha (dd/mm/yyyy) | Hora (HH:mm) | Alimento | Gramos | Tipo | Nota
//   - Hoja "Líquidos" → Fecha (dd/mm/yyyy) | Hora (HH:mm) | Cantidad (ml) | Nota
//   - Hoja "Supuestos"→ extra (no afecta la validación de la app)
// Fechas y horas se escriben SIEMPRE como texto literal para que
// la validación del importview las acepte.
// ============================================================

import ExcelJS from "exceljs";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "..", "..", "imports");
const OUT_FILE = path.join(OUT_DIR, "import-carlos.xlsx");

const MEAL_HEADERS = [
  "Fecha (dd/mm/yyyy)",
  "Hora (HH:mm)",
  "Alimento",
  "Gramos",
  "Tipo",
  "Nota",
];
const WEIGHT_HEADERS = ["Fecha (dd/mm/yyyy)", "Peso (kg)", "Nota"];
const LIQUID_HEADERS = ["Fecha (dd/mm/yyyy)", "Hora (HH:mm)", "Cantidad (ml)", "Nota"];
const VALID_MEAL_TYPES = ["desayuno", "almuerzo", "cena", "snack"];

// ─── Rango de datos ──────────────────────────────────────────
const START = new Date(2026, 6, 15); // 15/07/2026
const END = new Date(2026, 7, 27); // 27/08/2026

function formatDDMMYYYY(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// ─── Pesos (CORREGIDOS con pesajes reales del chat) ──────────
// Reales: 15/07=102 (inicio), 19/07=98.5, 01/08=98.5, 27/08=91.0 (actual).
// Intermedios de agosto: estimación lineal de la caída real 01→27/08.
const WEIGHTS = [
  ["15/07/2026", 102.0, "Inicio de la dieta (retomé keto)"],
  ["19/07/2026", 98.5, "Pesaje real (madrugada): -3.5 kg en los primeros 4 días"],
  ["22/07/2026", 98.5, "Meseta"],
  ["29/07/2026", 98.6, "Fin de semana roto 25–26/07 (petipanes en Cieneguilla)"],
  ["01/08/2026", 98.5, "Pesaje real: sigo en 98.5 (estancado)"],
  ["05/08/2026", 97.3, "Estimado (caída real 01→27/08 ≈ 2 kg/semana)"],
  ["12/08/2026", 95.3, "Estimado"],
  ["19/08/2026", 93.3, "Estimado"],
  ["26/08/2026", 91.3, "Estimado"],
  ["27/08/2026", 91.0, "Peso actual (pesaje real del usuario)"],
];

// ─── Comidas con detalle real del chat ───────────────────────
// [fecha, hora, alimento, gramos, tipo, nota]
// Extraídas de messages.json (ver plan-carlos-import.md).
const REAL_MEALS = [
  // 15/07 — día de inicio (PDF + chat)
  ["15/07/2026", "10:00", "Huevo", 100, "desayuno", "2 duros"],
  ["15/07/2026", "12:30", "Queso fresco", 80, "snack", ""],
  ["15/07/2026", "14:00", "Atún", 140, "almuerzo", "1 lata al agua"],
  ["15/07/2026", "14:05", "Palta", 150, "almuerzo", "1 unidad"],
  // 16/07 — excepción pre-gym
  ["16/07/2026", "07:30", "Jugo de frutas con leche sin lactosa", 125, "snack", "Excepción pre-gym (NO keto): ½ vaso de papaya/piña/fresa"],
  // 19/07 — noche en familia (no pidió plato)
  ["19/07/2026", "20:30", "Mollejitas picadas", 90, "snack", "5–6 unidades, sin pedir plato"],
  ["19/07/2026", "20:45", "Queso de pizza", 25, "snack", "Pedacito, sin masa"],
  // 21/07 — hambre en el trabajo (antes del gym)
  ["21/07/2026", "16:40", "Atún", 140, "almuerzo", "1 lata al agua"],
  ["21/07/2026", "16:45", "Palta", 150, "almuerzo", "1 unidad"],
  ["21/07/2026", "18:25", "Chicharrones Frito-Lay", 48, "snack", "2 bolsitas de 24 g (<1 g carb c/u); hambre pre-gym"],
  // 23/07 — jueves
  ["23/07/2026", "12:00", "Salchicha huachana", 90, "almuerzo", "1½ unidades"],
  ["23/07/2026", "12:05", "Huevo", 200, "almuerzo", "4 revueltos"],
  ["23/07/2026", "12:10", "Palta", 75, "almuerzo", "½ unidad"],
  ["23/07/2026", "18:00", "Atún", 140, "cena", "1 lata al agua"],
  ["23/07/2026", "18:05", "Palta", 150, "cena", "1 unidad"],
  // 25/07 — cumpleaños en Cieneguilla (fin de semana roto)
  ["25/07/2026", "13:00", "Petipanes completos (pan + huevo + tocino)", 180, "almuerzo", "3 unidades; cumpleaños Cieneguilla; ≈30–45 g carb"],
  ["25/07/2026", "13:30", "Rellenos de petipán (huevo + tocino, sin pan)", 90, "almuerzo", "3 unidades"],
  // 30/07 — retomada tras el cumpleaños
  ["30/07/2026", "12:00", "Carne de res / chuleta", 220, "almuerzo", "Día de retomada post cumpleaños; también chorizo segoviana; dolor de cabeza"],
  ["30/07/2026", "20:30", "Bistec", 150, "cena", "A la plancha"],
  ["30/07/2026", "20:35", "Huevo", 100, "cena", "2 unidades"],
  // 03/08 — compartir en el trabajo
  ["03/08/2026", "11:00", "Albóndigas caseras rellenas de queso", 140, "almuerzo", "Carne molida + huevo + sal + pimienta; 2 unidades"],
  ["03/08/2026", "11:05", "Huevo", 200, "almuerzo", "4 unidades"],
  ["03/08/2026", "11:10", "Cuero de cerdo (freidora de aire)", 60, "almuerzo", "Tipo chicharroncitos"],
  ["03/08/2026", "12:30", "Relleno de quiche de rocoto", 120, "snack", "Compartir trabajo; SIN masa ni pasas"],
  ["03/08/2026", "18:00", "Palta", 150, "cena", "1 unidad"],
  ["03/08/2026", "18:05", "Albóndiga casera", 70, "cena", "1 unidad + rocoto"],
  // 08/08 — cumpleaños del hijo
  ["08/08/2026", "16:13", "Atún al agua", 280, "almuerzo", "2 latas"],
  ["08/08/2026", "16:20", "Huevo", 150, "almuerzo", "3 unidades"],
  ["08/08/2026", "16:25", "Ensalada (lechuga, pepino, tomate, espinaca, queso fresco)", 200, "almuerzo", ""],
  ["08/08/2026", "19:30", "Chicharrones Frito-Lay", 48, "snack", "2 bolsitas de 24 g; cumpleaños del hijo"],
  // 09/08 — cumpleaños de la suegra
  ["09/08/2026", "14:00", "Ensalada abundante con chimichurri", 220, "almuerzo", "Lechuga, tomate, pepino, limón, sal, chimichurri"],
  ["09/08/2026", "14:10", "Chorizos artesanales parrilleros", 150, "almuerzo", "2 unidades; sin etiqueta; no rompió cetosis"],
  ["09/08/2026", "14:15", "Anticuchos parrilleros", 160, "almuerzo", "2 unidades"],
  ["09/08/2026", "16:15", "Aceitunas verdes + quesito ayacuchano", 60, "snack", "Piqueos, porción pequeña"],
  // 11/08 — día alto en proteína
  ["11/08/2026", "13:00", "Carne molida", 400, "almuerzo", "Freidora de aire; solo sal y pimienta"],
  ["11/08/2026", "13:05", "Huevo", 200, "almuerzo", "4 unidades"],
  ["11/08/2026", "17:30", "Palta", 150, "snack", "1 unidad"],
  ["11/08/2026", "20:30", "Chorizo parrillero", 90, "cena", "1 unidad"],
  ["11/08/2026", "20:35", "Bife a la parrilla", 150, "cena", ""],
];

const REAL_MEAL_DATES = new Set(REAL_MEALS.map((row) => row[0]));

// ─── Rotación de proteína (ciclo de 4 días, solo días plantilla) ──
const MEAT_VARIANTS = [
  {
    alimento: "Carne de res",
    gramos: 200,
    nota: "Salteada con rocoto, limón, sal y pimienta y hierbas",
  },
  {
    alimento: "Pollo",
    gramos: 250,
    nota: "A la plancha con rocoto, limón, sal y pimienta y hierbas",
  },
  {
    alimento: "Atún",
    gramos: 140,
    nota: "1 lata al agua, con rocoto y limón",
  },
  {
    alimento: "Pescado",
    gramos: 200,
    nota: "Filete de tilapia con limón, ajo, perejil, sal y pimienta",
  },
];
const EGG_STYLES = ["duros", "pasados", "revueltos"];

function eggNote(count, style) {
  const singular = style.replace(/s$/, "");
  return `${count} ${count === 1 ? singular : style}`;
}

// ─── Construcción de comidas ─────────────────────────────────
const MEALS = [];
for (const row of REAL_MEALS) MEALS.push(row);

// Días sin dato real → rutina habitual de Carlos (plantilla)
function addDefaultDay(fecha, idx) {
  const meat = MEAT_VARIANTS[idx % MEAT_VARIANTS.length];
  const style = EGG_STYLES[idx % EGG_STYLES.length];
  const fiveEggs = idx % 2 === 1;

  MEALS.push([fecha, "10:00", "Huevo", 100, "desayuno", eggNote(2, style)]);
  if (fiveEggs) {
    MEALS.push([fecha, "12:00", "Huevo", 50, "snack", eggNote(1, style)]);
  }
  MEALS.push([fecha, "13:00", meat.alimento, meat.gramos, "almuerzo", meat.nota]);
  MEALS.push([fecha, "13:05", "Huevo", 50, "almuerzo", eggNote(1, style)]);
  MEALS.push([fecha, "13:10", "Queso fresco", 80, "almuerzo", ""]);
  MEALS.push([fecha, "17:00", "Palta", 150, "snack", "Con rocoto, limón, sal y pimienta"]);
  MEALS.push([fecha, "17:05", "Huevo", 50, "snack", eggNote(1, style)]);
}

// ─── Construcción de líquidos ────────────────────────────────
// Todos los días: promedio 1.5–2 L (café sin azúcar + agua repartida).
const LIQUIDS = [];

function addDefaultLiquids(fecha, idx) {
  const twoLiters = idx % 2 === 0;
  LIQUIDS.push([fecha, "08:30", 200, "café sin azúcar"]);
  if (twoLiters) {
    LIQUIDS.push([fecha, "13:30", 1000, "1 L de agua"]);
    LIQUIDS.push([fecha, "18:00", 800, ""]); // total 2.0 L
  } else {
    LIQUIDS.push([fecha, "13:30", 800, "0.8 L de agua"]);
    LIQUIDS.push([fecha, "18:00", 500, ""]); // total 1.5 L
  }
}

{
  let idx = 0;
  const d = new Date(START);
  while (d <= END) {
    const fecha = formatDDMMYYYY(d);
    addDefaultLiquids(fecha, idx);
    if (!REAL_MEAL_DATES.has(fecha)) {
      addDefaultDay(fecha, idx);
    }
    idx++;
    d.setDate(d.getDate() + 1);
  }
}

// ─── Hoja Supuestos ──────────────────────────────────────────
const ASSUMPTIONS = [
  ["Usuario", "Carlos Olivera Mispireta (coliveramispireta@gmail.com)", "Config"],
  ["Rango", "15/07/2026 – 27/08/2026 (44 días)", "Config"],
  ["Fuente", "HTML completo del chat de Carlos con su coach (380 mensajes, decodificado) + PDF DIETA KETO (inicio mié 15/07 ~102 kg)", "Chat + PDF"],
  ["Huevo", "50 g por unidad (equivalencia del catálogo)", "Catálogo"],
  ["Palta", "150 g por unidad (equivalencia del catálogo)", "Catálogo"],
  ["Atún al agua", "≈ 140 g (una lata)", "Estimado"],
  ["Filete de tilapia", "≈ 200 g", "Estimado"],
  ["Pesos reales", "19/07 = 98.5 kg (pesaje 00:15); 01/08 = 98.5 kg (pesaje 20:09); 27/08 = 91.0 kg (peso actual)", "Chat + usuario"],
  ["Pesos intermedios", "Estimación lineal de la caída real 01/08 → 27/08 (≈2 kg/semana, 7.5 kg en 26 días)", "Estimado"],
  ["Pesos previos del plan (101.6/101.2/99.6)", "DESCARTADOS: contradecían los pesajes reales del chat", "Nota"],
  ["Días con detalle real", "15, 16, 19, 21, 23, 25 y 30/07; 03, 08, 09 y 11/08 (extraído del chat)", "Chat"],
  ["25/07 Cieneguilla", "Cumpleaños: 3 petipanes completos + 3 rellenos (huevo/tocino). Fin de semana roto 25–26/07", "Chat"],
  ["08/08 cumpleaños hijo", "2 atunes + 3 huevos + ensalada; 2 bolsitas de chicharrones Frito-Lay", "Chat"],
  ["09/08 cumpleaños suegra", "Ensalada + 2 chorizos artesanales + 2 anticuchos; piqueos aceitunas + quesito ayacuchano", "Chat"],
  ["11/08", "400 g carne molida + 4 huevos; 1 palta; 1 chorizo parrillero + 150 g bife (día alto en proteína)", "Chat"],
  ["Consultas con etiquetas", "06/08 tortilla 🔴 (54.3 g carb/100 g); 23/08 filete de tilapia 🟢; 25/08 oblea de arroz 🔴 (no son comidas consumidas)", "Chat"],
  ["Días sin reporte", "Rutina habitual de Carlos: 4–5 huevos, 80 g queso, 1 palta y carne rotativa (res, pollo, atún o tilapia)", "Usuario"],
  ["Horario habitual", "Carne+huevo+queso a la 1pm; palta a las 5pm", "Usuario"],
  ["Complementos", "Rocoto con limón, sal, pimienta y hierbas (registrados en la nota)", "Usuario"],
  ["Carne", "Rotación en ciclo de 4 días para variedad (solo días plantilla)", "Config"],
  ["Líquidos", "Todos los días: promedio 1.5–2 L (café sin azúcar + agua repartida)", "Usuario"],
  ["Pesos", "Anclados en pesajes reales del chat (98.5 kg desde 19/07; 91.0 kg el 27/08 = peso actual)", "Chat + usuario"],
  ["Múltiples alimentos por comida", "Se desfasa la hora en +5 min para evitar el check de fecha+hora duplicada", "Nota"],
];

// ─── Validación (misma lógica que importview) ────────────────

function parseDateDDMMYYYY(value) {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (date.getDate() !== Number(d) || date.getMonth() !== Number(m) - 1 || date.getFullYear() !== Number(y)) return null;
  return date;
}

function parseTimeHHMM(value) {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const min = Number(match[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function validateWeights(rows) {
  const errors = [];
  const seenDates = new Set();
  const now = new Date();
  rows.forEach(([fechaRaw, pesoRaw, notaRaw], idx) => {
    const rowNum = idx + 2;
    const rowErrors = [];
    const d = parseDateDDMMYYYY(fechaRaw);
    if (!fechaRaw || !d) {
      rowErrors.push("Fecha inválida");
    } else if (d > now) {
      rowErrors.push("Fecha futura");
    } else {
      const iso = d.toISOString().slice(0, 10);
      if (seenDates.has(iso)) rowErrors.push("Fecha duplicada");
      seenDates.add(iso);
    }
    if (typeof pesoRaw !== "number" || pesoRaw <= 0 || pesoRaw > 500) {
      rowErrors.push("Peso inválido (0.1–500)");
    }
    if (notaRaw && notaRaw.length > 200) rowErrors.push("Nota > 200");
    if (rowErrors.length > 0) errors.push(`Fila ${rowNum}: ${rowErrors.join("; ")}`);
  });
  if (errors.length > 0) throw new Error("Validación de pesos falló:\n" + errors.join("\n"));
}

function validateMeals(rows) {
  const errors = [];
  const seenDT = new Set();
  const now = new Date();
  rows.forEach(([fechaRaw, horaRaw, alimentoRaw, gramosRaw, tipoRaw, notaRaw], idx) => {
    const rowNum = idx + 2;
    const rowErrors = [];
    const fechaDate = parseDateDDMMYYYY(fechaRaw);
    if (!fechaRaw || !fechaDate) {
      rowErrors.push("Fecha inválida");
    } else if (fechaDate > now) {
      rowErrors.push("Fecha futura");
    }
    const horaParsed = parseTimeHHMM(horaRaw);
    if (!horaParsed) rowErrors.push("Hora inválida");
    if (fechaDate && horaParsed) {
      const key = `${fechaDate.toISOString().slice(0, 10)}_${horaParsed}`;
      if (seenDT.has(key)) rowErrors.push("Fecha+hora duplicada");
      seenDT.add(key);
    }
    if (!alimentoRaw) rowErrors.push("Alimento vacío");
    else if (alimentoRaw.length > 120) rowErrors.push("Alimento > 120");
    if (typeof gramosRaw !== "number" || !(gramosRaw > 0)) rowErrors.push("Gramos inválidos");
    if (tipoRaw && !VALID_MEAL_TYPES.includes(tipoRaw)) rowErrors.push(`Tipo inválido ${tipoRaw}`);
    if (notaRaw && notaRaw.length > 200) rowErrors.push("Nota > 200");
    if (rowErrors.length > 0) errors.push(`Fila ${rowNum}: ${rowErrors.join("; ")}`);
  });
  if (errors.length > 0) throw new Error("Validación de comidas falló:\n" + errors.join("\n"));
}

function validateLiquids(rows) {
  const errors = [];
  const seenDT = new Set();
  const now = new Date();
  rows.forEach(([fechaRaw, horaRaw, mlRaw, notaRaw], idx) => {
    const rowNum = idx + 2;
    const rowErrors = [];
    const fechaDate = parseDateDDMMYYYY(fechaRaw);
    if (!fechaRaw || !fechaDate) {
      rowErrors.push("Fecha inválida");
    } else if (fechaDate > now) {
      rowErrors.push("Fecha futura");
    }
    const horaParsed = parseTimeHHMM(horaRaw);
    if (!horaParsed) rowErrors.push("Hora inválida");
    if (fechaDate && horaParsed) {
      const key = `${fechaDate.toISOString().slice(0, 10)}_${horaParsed}`;
      if (seenDT.has(key)) rowErrors.push("Fecha+hora duplicada");
      seenDT.add(key);
    }
    if (typeof mlRaw !== "number" || !(mlRaw > 0 && mlRaw <= 10000)) {
      rowErrors.push("Cantidad (ml) inválida (1–10000)");
    }
    if (notaRaw && notaRaw.length > 200) rowErrors.push("Nota > 200");
    if (rowErrors.length > 0) errors.push(`Fila ${rowNum}: ${rowErrors.join("; ")}`);
  });
  if (errors.length > 0) throw new Error("Validación de líquidos falló:\n" + errors.join("\n"));
}

function styleHeaderRow(row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A56DB" } };
    cell.alignment = { vertical: "middle" };
  });
}

async function main() {
  validateWeights(WEIGHTS);
  validateMeals(MEALS);
  validateLiquids(LIQUIDS);

  const wb = new ExcelJS.Workbook();
  wb.creator = "KetoFlow Coach";
  wb.created = new Date();

  // ── Hoja Pesos ──
  const wsP = wb.addWorksheet("Pesos");
  wsP.columns = WEIGHT_HEADERS.map((header) => ({
    header,
    width: header.startsWith("Fecha") ? 22 : header.startsWith("Nota") ? 40 : 14,
  }));
  styleHeaderRow(wsP.getRow(1));
  for (const row of WEIGHTS) wsP.addRow(row);

  // ── Hoja Comidas ──
  const wsC = wb.addWorksheet("Comidas");
  wsC.columns = [
    { header: "Fecha (dd/mm/yyyy)", width: 22 },
    { header: "Hora (HH:mm)", width: 16 },
    { header: "Alimento", width: 38 },
    { header: "Gramos", width: 12 },
    { header: "Tipo", width: 14 },
    { header: "Nota", width: 46 },
  ];
  styleHeaderRow(wsC.getRow(1));
  for (const row of MEALS) wsC.addRow(row);

  // ── Hoja Líquidos ──
  const wsL = wb.addWorksheet("Líquidos");
  wsL.columns = [
    { header: "Fecha (dd/mm/yyyy)", width: 22 },
    { header: "Hora (HH:mm)", width: 16 },
    { header: "Cantidad (ml)", width: 14 },
    { header: "Nota", width: 42 },
  ];
  styleHeaderRow(wsL.getRow(1));
  for (const row of LIQUIDS) wsL.addRow(row);

  // ── Hoja Supuestos ──
  const wsA = wb.addWorksheet("Supuestos");
  wsA.columns = [
    { header: "Concepto", width: 34 },
    { header: "Detalle", width: 78 },
    { header: "Fuente", width: 16 },
  ];
  styleHeaderRow(wsA.getRow(1));
  for (const row of ASSUMPTIONS) wsA.addRow(row);

  // ── Escribir y re-validar el archivo generado ──
  const buf = await wb.xlsx.writeBuffer();
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, Buffer.from(buf));

  const check = new ExcelJS.Workbook();
  await check.xlsx.load(buf);
  const required = ["Pesos", "Comidas", "Líquidos"];
  for (const name of required) {
    if (!check.getWorksheet(name)) throw new Error(`Falta la hoja ${name}`);
  }

  function verifyHeaders(ws, expected, sheetName) {
    const headers = [];
    ws.getRow(1).eachCell({ includeEmpty: false }, (cell) => headers.push(String(cell.value).trim()));
    if (headers.length !== expected.length || !headers.every((h, i) => h === expected[i])) {
      throw new Error(`Headers de ${sheetName} no coinciden: ${headers.join(" | ")}`);
    }
  }
  verifyHeaders(check.getWorksheet("Pesos"), WEIGHT_HEADERS, "Pesos");
  verifyHeaders(check.getWorksheet("Comidas"), MEAL_HEADERS, "Comidas");
  verifyHeaders(check.getWorksheet("Líquidos"), LIQUID_HEADERS, "Líquidos");

  // Re-validar las filas leídas del archivo generado (no solo los arrays)
  function readRows(ws, nCols) {
    const out = [];
    ws.eachRow({ includeEmpty: false }, (row, rn) => {
      if (rn === 1) return;
      const cells = [];
      for (let c = 1; c <= nCols; c++) cells.push(row.getCell(c).value);
      out.push(cells);
    });
    return out;
  }
  validateWeights(readRows(check.getWorksheet("Pesos"), 3));
  validateMeals(readRows(check.getWorksheet("Comidas"), 6));
  validateLiquids(readRows(check.getWorksheet("Líquidos"), 4));

  function rowCount(ws) {
    let n = 0;
    ws.eachRow({ includeEmpty: false }, (_row, rn) => {
      if (rn > 1) n++;
    });
    return n;
  }

  console.log("✅ Archivo generado y verificado:");
  console.log(`   ${OUT_FILE}`);
  console.log(`   Pesos: ${rowCount(check.getWorksheet("Pesos"))} filas · Comidas: ${rowCount(check.getWorksheet("Comidas"))} filas · Líquidos: ${rowCount(check.getWorksheet("Líquidos"))} filas · Supuestos: ${ASSUMPTIONS.length} filas`);
  console.log("   Válido para el flujo: Coach → Importar datos de usuario (usuario Carlos).");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});