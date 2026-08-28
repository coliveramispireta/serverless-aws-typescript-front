import * as ExcelJS from "exceljs";

/**
 * Helpers compartidos de la importación masiva del coach.
 * Usados por `importview.tsx` (pesos/comidas/líquidos) para mantener una
 * única implementación de parsing y validación del Excel.
 */

// ─── Constantes de hojas ───────────────────────────────────────

export const WEIGHT_HEADERS = ["Fecha (dd/mm/yyyy)", "Peso (kg)", "Nota"];
export const MEAL_HEADERS = [
  "Fecha (dd/mm/yyyy)",
  "Hora (HH:mm)",
  "Alimento",
  "Gramos",
  "Tipo",
  "Nota",
];
export const LIQUID_HEADERS = [
  "Fecha (dd/mm/yyyy)",
  "Hora (HH:mm)",
  "Cantidad (ml)",
  "Nota",
];
export const VALID_MEAL_TYPES = ["desayuno", "almuerzo", "cena", "snack"];

// ─── Parsing de celdas ─────────────────────────────────────────

/** Fecha texto `dd/mm/yyyy` → Date local (null si inválida) */
export function parseDateDDMMYYYY(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (
    date.getDate() !== Number(d) ||
    date.getMonth() !== Number(m) - 1 ||
    date.getFullYear() !== Number(y)
  )
    return null;
  return date;
}

/** Hora texto `HH:mm` → "HH:mm" normalizado (null si inválida) */
export function parseTimeHHMM(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const min = Number(match[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function cellString(cell: ExcelJS.Cell): string {
  const v = cell.value;
  if (v === null || v === undefined) return "";
  if (typeof v === "object" && "text" in (v as unknown as Record<string, unknown>)) {
    return String((v as unknown as { text: string }).text ?? "").trim();
  }
  return String(v).trim();
}

export function cellNumber(cell: ExcelJS.Cell): number | null {
  const v = cell.value;
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return v;
  const n = Number(String(v).trim());
  return Number.isNaN(n) ? null : n;
}

/** Combina fecha (local) + hora en ISO (mis valores de comidas/líquidos: hora local → UTC) */
export function makeIsoFromDateAndTime(date: Date, time: string): string {
  const [h, m] = time.split(":").map(Number);
  const dt = new Date(date);
  dt.setHours(h, m, 0, 0);
  return dt.toISOString();
}

/**
 * Estilo de encabezados para los layouts descargables.
 * (Sound: fondo azul, texto blanco, negrita, centrado vertical)
 */
export function styleHeaderRow(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1A56DB" },
    };
    cell.alignment = { vertical: "middle" };
  });
}

/** Alias de fecha de la hoja (solo de ejemplo/lectura) */
export function formatDateForCell(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}