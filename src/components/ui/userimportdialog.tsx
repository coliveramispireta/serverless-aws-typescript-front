"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography,
} from "@mui/material";
import { UploadFile } from "@mui/icons-material";
import * as ExcelJS from "exceljs";

import { importUserData } from "@/services/keto/meals.service";
import {
  MEAL_HEADERS,
  LIQUID_HEADERS,
  parseDateDDMMYYYY,
  parseTimeHHMM,
  cellString,
  cellNumber,
  makeIsoFromDateAndTime,
} from "@/features/coach/importhelpers";

type MealType = "desayuno" | "almuerzo" | "cena" | "snack";

const VALID_MEAL_TYPES = ["desayuno", "almuerzo", "cena", "snack"];

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

/**
 * Diálogo de "Ponerme al día": permite al usuario importar sus alimentos y
 * agua (NO pesos) desde un Excel con las hojas "Comidas" y "Líquidos",
 * reutilizando el mismo formato del layout del coach. Pensado para cargar
 * varios días atrasados de una sola vez.
 */
export default function UserImportDialog({ open, onClose, onImported }: Props) {
  const [stage, setStage] = useState<"idle" | "parsing" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ meals: number; liquids: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const reset = () => {
    setStage("idle");
    setMessage("");
    setResult(null);
    setErrors([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const parseAndImport = async (file: File) => {
    reset();
    setStage("parsing");
    try {
      const buffer = await file.arrayBuffer();
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer);

      const norm = (s: string) =>
        s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      const findSheet = (name: string, headers: string[]): ExcelJS.Worksheet | null => {
        const n = norm(name);
        for (const ws of wb.worksheets) if (norm(ws.name) === n) return ws;
        for (const ws of wb.worksheets) {
          const hs: string[] = [];
          ws.getRow(1).eachCell({ includeEmpty: false }, (cell) => hs.push(cellString(cell)));
          if (hs.length === headers.length && hs.every((h, i) => h === headers[i])) return ws;
        }
        return null;
      };

      const wsM = findSheet("Comidas", MEAL_HEADERS);
      const wsL = findSheet("Líquidos", LIQUID_HEADERS);

      const problems: string[] = [];
      const meals: Array<{
        fechaHora: string;
        alimento: string;
        gramos: number;
        comida?: string;
      }> = [];
      const liquids: Array<{ fechaHora: string; cantidadMl: number }> = [];

      // ── Comidas ──
      if (wsM) {
        const seen = new Set<string>();
        wsM.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber === 1) return;
          const fechaRaw = cellString(row.getCell(1));
          const horaRaw = cellString(row.getCell(2));
          const alimento = cellString(row.getCell(3)).trim();
          const gramos = cellNumber(row.getCell(4));
          const tipoRaw = cellString(row.getCell(5)).trim();
          const nota = cellString(row.getCell(6)).trim();

          if (!fechaRaw && !horaRaw && !alimento && gramos === null) return;

          const fechaDate = parseDateDDMMYYYY(fechaRaw);
          const horaParsed = parseTimeHHMM(horaRaw);
          if (!fechaDate) return problems.push(`Comida row ${rowNumber}: fecha inválida`);
          if (!horaParsed) return problems.push(`Comida row ${rowNumber}: hora inválida`);
          if (!alimento) return problems.push(`Comida row ${rowNumber}: alimento vacío`);
          if (!gramos || gramos <= 0 || gramos > 10000)
            return problems.push(`Comida row ${rowNumber}: gramos inválidos`);

          const fechaHora = makeIsoFromDateAndTime(fechaDate, horaParsed);
          const key = `${fechaHora}_${alimento}`;
          if (seen.has(key)) return;
          seen.add(key);

          meals.push({
            fechaHora,
            alimento,
            gramos: Math.round(gramos),
            comida: VALID_MEAL_TYPES.includes(tipoRaw.toLowerCase())
              ? (tipoRaw.toLowerCase() as MealType)
              : undefined,
          });
        });
      } else {
        problems.push("No se encontró la hoja 'Comidas'");
      }

      // ── Líquidos ──
      if (wsL) {
        const seen = new Set<string>();
        wsL.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber === 1) return;
          const fechaRaw = cellString(row.getCell(1));
          const horaRaw = cellString(row.getCell(2));
          const ml = cellNumber(row.getCell(3));

          if (!fechaRaw && !horaRaw && ml === null) return;

          const fechaDate = parseDateDDMMYYYY(fechaRaw);
          const horaParsed = parseTimeHHMM(horaRaw);
          if (!fechaDate) return problems.push(`Líquido row ${rowNumber}: fecha inválida`);
          if (!horaParsed) return problems.push(`Líquido row ${rowNumber}: hora inválida`);
          if (!ml || ml <= 0 || ml > 10000)
            return problems.push(`Líquido row ${rowNumber}: cantidad inválida`);

          const fechaHora = makeIsoFromDateAndTime(fechaDate, horaParsed);
          const key = `${fechaHora}_${ml}`;
          if (seen.has(key)) return;
          seen.add(key);

          liquids.push({ fechaHora, cantidadMl: Math.round(ml) });
        });
      } else {
        problems.push("No se encontró la hoja 'Líquidos'");
      }

      if (problems.length) {
        setStage("error");
        setErrors(problems.slice(0, 20));
        return;
      }
      if (meals.length === 0 && liquids.length === 0) {
        setStage("error");
        setErrors(["El archivo no tiene filas válidas de comidas ni líquidos."]);
        return;
      }

      // Enviar al backend
      const res = await importUserData({ meals, liquids });
      setResult(res.imported);
      setStage("done");
      onImported();
    } catch (err) {
      console.error(err);
      setStage("error");
      setErrors(["No se pudo leer el archivo. Verifica que sea un .xlsx válido."]);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle fontWeight={800}>📤 Ponerme al día</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Importa tus <b>comidas</b> y <b>agua</b> de días atrasados en un solo paso
          (no se importan pesos). Usa el mismo formato que el layout del coach: hojas
          <i> Comidas</i> y <i> Líquidos</i> con columnas de fecha, hora, alimento/gramos o
          cantidad (ml).
        </Typography>

        {stage === "parsing" && <LinearProgress sx={{ borderRadius: 4 }} />}

        {stage === "idle" && (
          <Box textAlign="center" py={2}>
            <Button variant="contained" component="label" startIcon={<UploadFile />}>
              Seleccionar archivo .xlsx
              <input
                type="file"
                accept=".xlsx"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) parseAndImport(f);
                  e.target.value = "";
                }}
              />
            </Button>
          </Box>
        )}

        {stage === "done" && result && (
          <Box sx={{ bgcolor: "success.light", p: 2, borderRadius: 1 }}>
            <Typography fontWeight={700} color="success.dark">
              ✅ ¡Listo! Se importaron:
            </Typography>
            <Typography variant="body2">
              🍽️ {result.meals} comidas · 💧 {result.liquids} registros de agua
            </Typography>
          </Box>
        )}

        {stage === "error" && (
          <Box sx={{ bgcolor: "error.light", p: 2, borderRadius: 1 }}>
            <Typography fontWeight={700} color="error.dark" sx={{ mb: 1 }}>
              ⚠️ Revisa el archivo
            </Typography>
            {errors.map((e, i) => (
              <Typography key={i} variant="caption" display="block" color="error.dark">
                • {e}
              </Typography>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          {stage === "done" ? "Cerrar" : "Cancelar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
