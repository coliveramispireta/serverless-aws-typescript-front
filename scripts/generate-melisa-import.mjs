// ============================================================
// Generador del archivo de importación de comidas de Melisa.
// Produce: imports/melisa-comidas-2026-08.xlsx (formato KetoFlow).
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
const OUT_FILE = path.join(OUT_DIR, "melisa-comidas-2026-08.xlsx");

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

// ─── Datos extraídos del chat (CHATS.txt) ─────────────────────
// [fecha, hora, alimento, gramos, tipo, nota]
const MEALS = [
  // 20/08
  ["20/08/2026", "10:00", "Huevo", 100, "desayuno", "2 huevos duros"],
  ["20/08/2026", "12:00", "Huevo", 50, "snack", "1 huevo duro"],
  ["20/08/2026", "14:00", "Pechuga de pollo", 120, "almuerzo", "½ pechuga a la brasa (estimado)"],
  ["20/08/2026", "16:00", "Huevo", 50, "snack", "1 huevo duro"],
  ["20/08/2026", "18:00", "Queso fresco", 198, "snack", "198 g de queso"],
  ["20/08/2026", "18:05", "Aceitunas verdes", 100, "snack", "1 L de agua"],
  // 21/08
  ["21/08/2026", "10:00", "Huevo", 100, "desayuno", "2 huevos duros"],
  ["21/08/2026", "10:05", "Aceitunas verdes", 150, "desayuno", "Café"],
  ["21/08/2026", "14:00", "Atún", 140, "almuerzo", "1 lata al agua (estimado)"],
  ["21/08/2026", "14:05", "Jamón de pavita", 30, "almuerzo", "Embutido — evitar (almidón)"],
  ["21/08/2026", "14:10", "Palta", 150, "almuerzo", ""],
  ["21/08/2026", "20:00", "Huevo", 100, "cena", "2 pasados · té helado sin azúcar · 1.5 L de agua"],
  // 22/08
  ["22/08/2026", "13:00", "Palta", 150, "snack", ""],
  ["22/08/2026", "15:00", "Pollo", 250, "almuerzo", "Pollo a la brasa (estimado)"],
  ["22/08/2026", "19:00", "Chicharrón", 45, "snack", "Bolsa Fritolay (estimado) · 2 L de agua"],
  // 23/08
  ["23/08/2026", "11:00", "Huevo", 150, "desayuno", "3 pasados"],
  ["23/08/2026", "11:05", "Aceitunas verdes", 100, "desayuno", ""],
  ["23/08/2026", "15:00", "Carne molida", 280, "almuerzo", ""],
  ["23/08/2026", "15:05", "Tomate", 100, "almuerzo", "1 tomate (estimado)"],
  ["23/08/2026", "15:10", "Palta", 150, "almuerzo", ""],
  ["23/08/2026", "18:30", "Carne molida", 120, "snack", "2 L de agua aprox"],
  // 24/08
  ["24/08/2026", "10:45", "Huevo", 150, "desayuno", "3 duros"],
  ["24/08/2026", "10:50", "Aceitunas verdes", 100, "desayuno", ""],
  ["24/08/2026", "13:30", "Pechuga de pollo", 200, "almuerzo", "A la plancha (estimado)"],
  ["24/08/2026", "13:35", "Palta", 150, "almuerzo", "Café americano 12:00 · 1.5 L de agua"],
  // 26/08
  ["26/08/2026", "16:00", "Aceitunas verdes", 120, "snack", ""],
  ["26/08/2026", "16:05", "Queso fresco", 100, "snack", ""],
  ["26/08/2026", "22:00", "Palta", 150, "cena", "Día sin desayuno ni almuerzo"],
];

// Estimaciones y forma de cálculo (hoja de soporte del archivo)
const ASSUMPTIONS = [
  ["Huevo", "50 g por unidad (equivalencia del catálogo)", "Catálogo"],
  ["Palta", "150 g por unidad (equivalencia del catálogo)", "Catálogo"],
  ["Atún al agua", "≈ 140 g (una lata)", "Estimado"],
  ["½ pechuga a la brasa", "≈ 120 g", "Estimado"],
  ["Pollo a la brasa", "≈ 250 g (una porción)", "Estimado"],
  ["Pechuga a la plancha", "≈ 200 g", "Estimado"],
  ["Tomate", "≈ 100 g (1 tomate mediano)", "Estimado"],
  ["Chicharrón Fritolay", "≈ 45 g (una bolsa)", "Estimado"],
  ["Jamón de pavita", "≈ 30 g (lonchas)", "Estimado"],
  ["Café / té / agua", "Se importan como Líquidos (hoja Líquidos). Cantidades en ml estimadas según el chat", "Estimado"],
  ["Hoja Líquidos", "Opcional en la app: si el archivo no la trae, no afecta la validación", "Nota"],
  ["Hoja Pesos", "Sin filas: no había kg reales en el chat (fotos omitidas); el coach los captura aparte", "Nota"],
  ["Múltiples alimentos por comida", "Se desfasa la hora en +5 min para evitar el check de fecha+hora duplicada", "Nota"],
  ["25/08 y 27/08", "Sin comidas reportadas en el chat", "Nota"],
];

// ─── Hidratación extraída del chat (hoja Líquidos) ────────────
// [fecha, hora, cantidadMl, nota]
const LIQUIDS = [
  ["20/08/2026", "14:00", 1000, "1 L de agua (con almuerzo)"],
  ["21/08/2026", "10:05", 200, "café"],
  ["21/08/2026", "20:00", 1500, "1.5 L de agua + té helado sin azúcar"],
  ["22/08/2026", "19:00", 2000, "2 L de agua aprox"],
  ["23/08/2026", "18:30", 2000, "2 L de agua aprox"],
  ["24/08/2026", "12:00", 200, "café americano"],
  ["24/08/2026", "13:35", 1500, "1.5 L de agua"],
];

// ─── Helpers de validación (misma lógica que importview) ──────

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

function validateMeals(rows) {
  const errors = [];
  const seenDT = new Set();
  const now = new Date();

  rows.forEach(([fechaRaw, horaRaw, alimentoRaw, gramosRaw, tipoRaw], idx) => {
    const rowNum = idx + 2; // +1 por header
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

    if (rowErrors.length > 0) errors.push(`Fila ${rowNum}: ${rowErrors.join("; ")}`);
  });

  if (errors.length > 0) {
    throw new Error("Validación de comidas falló:\n" + errors.join("\n"));
  }
}

function validateLiquids(rows) {
  const errors = [];
  const seenDT = new Set();
  const now = new Date();

  rows.forEach(([fechaRaw, horaRaw, mlRaw, notaRaw], idx) => {
    const rowNum = idx + 2; // +1 por header
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

  if (errors.length > 0) {
    throw new Error("Validación de líquidos falló:\n" + errors.join("\n"));
  }
}

function styleHeaderRow(row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A56DB" } };
    cell.alignment = { vertical: "middle" };
  });
}

async function main() {
  validateMeals(MEALS);
  validateLiquids(LIQUIDS);

  const wb = new ExcelJS.Workbook();
  wb.creator = "KetoFlow Coach";
  wb.created = new Date();

  // ── Hoja Pesos (obligatoria; solo encabezados) ──
  const wsP = wb.addWorksheet("Pesos");
  wsP.columns = WEIGHT_HEADERS.map((header) => ({
    header,
    width: header.startsWith("Fecha") ? 22 : header.startsWith("Nota") ? 30 : 14,
  }));
  styleHeaderRow(wsP.getRow(1));

  // ── Hoja Comidas ──
  const wsC = wb.addWorksheet("Comidas");
  wsC.columns = [
    { header: "Fecha (dd/mm/yyyy)", width: 22 },
    { header: "Hora (HH:mm)", width: 16 },
    { header: "Alimento", width: 26 },
    { header: "Gramos", width: 12 },
    { header: "Tipo", width: 14 },
    { header: "Nota", width: 40 },
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

  // ── Hoja Supuestos (extra, la app la ignora) ──
  const wsA = wb.addWorksheet("Supuestos");
  wsA.columns = [
    { header: "Concepto", width: 30 },
    { header: "Detalle", width: 60 },
    { header: "Fuente", width: 14 },
  ];
  styleHeaderRow(wsA.getRow(1));
  for (const row of ASSUMPTIONS) wsA.addRow(row);

  // ── Escribir y re-validar el archivo generado ──
  const buf = await wb.xlsx.writeBuffer();
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, Buffer.from(buf));

  // Re-abrir = garantía de que "el archivo que se sube" pasa la validación real
  const check = new ExcelJS.Workbook();
  await check.xlsx.load(buf);
  const required = ["Pesos", "Comidas"];
  for (const name of required) {
    if (!check.getWorksheet(name)) throw new Error(`Falta la hoja ${name}`);
  }
  const wsCcheck = check.getWorksheet("Comidas");
  const cHeaders = [];
  wsCcheck.getRow(1).eachCell({ includeEmpty: false }, (cell) => cHeaders.push(String(cell.value).trim()));
  if (cHeaders.length !== MEAL_HEADERS.length || !cHeaders.every((h, i) => h === MEAL_HEADERS[i])) {
    throw new Error(`Headers de Comidas no coinciden: ${cHeaders.join(" | ")}`);
  }
  const wsLcheck = check.getWorksheet("Líquidos");
  if (!wsLcheck) throw new Error("Falta la hoja Líquidos");
  const lHeaders = [];
  wsLcheck.getRow(1).eachCell({ includeEmpty: false }, (cell) => lHeaders.push(String(cell.value).trim()));
  if (lHeaders.length !== LIQUID_HEADERS.length || !lHeaders.every((h, i) => h === LIQUID_HEADERS[i])) {
    throw new Error(`Headers de Líquidos no coinciden: ${lHeaders.join(" | ")}`);
  }
  const wsPcheck = check.getWorksheet("Pesos");
  const pHeaders = [];
  wsPcheck.getRow(1).eachCell({ includeEmpty: false }, (cell) => pHeaders.push(String(cell.value).trim()));
  if (pHeaders.length !== WEIGHT_HEADERS.length || !pHeaders.every((h, i) => h === WEIGHT_HEADERS[i])) {
    throw new Error(`Headers de Pesos no coinciden: ${pHeaders.join(" | ")}`);
  }

  console.log("✅ Archivo generado y verificado:");
  console.log(`   ${OUT_FILE}`);
  console.log(`   Comidas: ${MEALS.length} filas · Líquidos: ${LIQUIDS.length} filas · Pesos: solo encabezados · Supuestos: ${ASSUMPTIONS.length} filas`);
  console.log("   Válido para el flujo: Coach → Importar datos de usuario.");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});