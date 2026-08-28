"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as ExcelJS from "exceljs";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DownloadIcon from "@mui/icons-material/Download";

import EmptyState from "@/components/ui/emptystate";
import {
  listCoachUsers,
  bulkImportData,
  CoachUserSummary,
} from "@/services/keto/coach.service";
import {
  WEIGHT_HEADERS,
  MEAL_HEADERS,
  LIQUID_HEADERS,
  VALID_MEAL_TYPES,
  parseDateDDMMYYYY,
  parseTimeHHMM,
  cellString,
  cellNumber,
  makeIsoFromDateAndTime,
  styleHeaderRow,
} from "@/features/coach/importhelpers";

// ─── Tipos ────────────────────────────────────────────────────

interface RowResult {
  row: number;
  sheet: string;
  valid: boolean;
  errors: string[];
  data?: Record<string, unknown>;
}

type Stage = "select" | "validating" | "review" | "importing" | "done";

// ─── Layout template download ─────────────────────────────────

async function downloadLayout() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "KetoFlow Coach";
  wb.created = new Date();

  // ── Hoja Pesos ──
  const wsP = wb.addWorksheet("Pesos");
  wsP.columns = [
    { header: "Fecha (dd/mm/yyyy)", key: "fecha", width: 22 },
    { header: "Peso (kg)", key: "peso", width: 14 },
    { header: "Nota", key: "nota", width: 30 },
  ];
  styleHeaderRow(wsP.getRow(1));
  wsP.addRow(["15/01/2025", 95.5, "Inicio del programa"]);
  wsP.addRow(["22/01/2025", 94.2, ""]);
  wsP.addRow(["29/01/2025", 93.8, "Me sentí bien"]);

  // ── Hoja Comidas ──
  const wsC = wb.addWorksheet("Comidas");
  wsC.columns = [
    { header: "Fecha (dd/mm/yyyy)", key: "fecha", width: 22 },
    { header: "Hora (HH:mm)", key: "hora", width: 16 },
    { header: "Alimento", key: "alimento", width: 28 },
    { header: "Gramos", key: "gramos", width: 12 },
    { header: "Tipo", key: "tipo", width: 14 },
    { header: "Nota", key: "nota", width: 28 },
  ];
  styleHeaderRow(wsC.getRow(1));
  wsC.addRow(["15/01/2025", "08:30", "Huevos con aguacate", 300, "desayuno", ""]);
  wsC.addRow(["15/01/2025", "13:00", "Ensalada de pollo", 400, "almuerzo", ""]);
  wsC.addRow(["15/01/2025", "20:00", "Salmón con brócoli", 350, "cena", ""]);
  wsC.addRow(["16/01/2025", "09:00", "Smoothie keto", 250, "desayuno", "Snack"]);

  // ── Hoja Líquidos (opcional; la validación la admite con o sin ella) ──
  const wsL = wb.addWorksheet("Líquidos");
  wsL.columns = [
    { header: "Fecha (dd/mm/yyyy)", key: "fecha", width: 22 },
    { header: "Hora (HH:mm)", key: "hora", width: 16 },
    { header: "Cantidad (ml)", key: "ml", width: 14 },
    { header: "Nota", key: "nota", width: 28 },
  ];
  styleHeaderRow(wsL.getRow(1));
  wsL.addRow(["15/01/2025", "10:00", 250, "café"]);
  wsL.addRow(["15/01/2025", "14:00", 1000, "1 L de agua"]);
  wsL.addRow(["15/01/2025", "20:00", 500, ""]);
  wsL.addRow(["16/01/2025", "9:00", 2000, "2 L de agua"]);

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "layout-importacion-keto.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Componente principal ─────────────────────────────────────

export default function CoachImportView() {
  const [users, setUsers] = useState<CoachUserSummary[]>([]);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [stage, setStage] = useState<Stage>("select");
  const [results, setResults] = useState<RowResult[]>([]);
  const [importResult, setImportResult] = useState<{
    weights: number;
    meals: number;
    liquids: number;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 15;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listCoachUsers()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setUsers(list);
        if (list.length > 0) setSelectedUserId(list[0].userId);
      })
      .catch(() => setUsersError("No se pudo cargar la lista de usuarios."));
  }, []);

  // ─── Validar Excel ──────────────────────────────────────────

  const validateFile = useCallback(
    async (file: File) => {
      if (!selectedUserId) return;
      setStage("validating");
      setResults([]);
      setPage(0);

      try {
        const buffer = await file.arrayBuffer();
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(buffer);

        const rowResults: RowResult[] = [];

        // ── Validar hoja Pesos ──
        const wsP = wb.getWorksheet("Pesos");
        if (!wsP) {
          rowResults.push({
            row: 0,
            sheet: "Pesos",
            valid: false,
            errors: ['Falta la hoja "Pesos" en el archivo'],
          });
        } else {
          // Validar headers
          const pHeaders: string[] = [];
          wsP.getRow(1).eachCell({ includeEmpty: false }, (cell) => {
            pHeaders.push(cellString(cell));
          });
          const headersOk =
            pHeaders.length === WEIGHT_HEADERS.length &&
            pHeaders.every((h, i) => h === WEIGHT_HEADERS[i]);
          if (!headersOk) {
            rowResults.push({
              row: 0,
              sheet: "Pesos",
              valid: false,
              errors: [
                `Headers de "Pesos" inválidos. Se esperaba: ${WEIGHT_HEADERS.join(" | ")}`,
              ],
            });
          } else {
            const now = new Date();
            const seenDates = new Set<string>();

            wsP.eachRow({ includeEmpty: false }, (row, rowNumber) => {
              if (rowNumber === 1) return; // skip header

              const fechaRaw = cellString(row.getCell(1));
              const pesoRaw = cellNumber(row.getCell(2));
              const notaRaw = cellString(row.getCell(3));

              // Fila completamente vacía → ignorar
              if (!fechaRaw && pesoRaw === null && !notaRaw) return;

              const errors: string[] = [];

              // Fecha
              if (!fechaRaw) {
                errors.push("Fecha vacía");
              } else {
                const d = parseDateDDMMYYYY(fechaRaw);
                if (!d) {
                  errors.push("Formato de fecha inválido (usar dd/mm/yyyy)");
                } else if (d > now) {
                  errors.push("La fecha no puede ser futura");
                } else {
                  const iso = d.toISOString().slice(0, 10);
                  if (seenDates.has(iso)) {
                    errors.push("Fecha duplicada");
                  }
                  seenDates.add(iso);
                }
              }

              // Peso
              if (pesoRaw === null) {
                errors.push("Peso vacío");
              } else if (pesoRaw <= 0 || pesoRaw > 500) {
                errors.push("Peso debe ser entre 0.1 y 500 kg");
              }

              // Nota (solo largo)
              if (notaRaw.length > 200) {
                errors.push("La nota excede 200 caracteres");
              }

              const valid = errors.length === 0;
              let data: Record<string, unknown> | undefined;
              if (valid) {
                const d = parseDateDDMMYYYY(fechaRaw)!;
                data = {
                  fechaHora: d.toISOString(),
                  pesoKg: pesoRaw!,
                  nota: notaRaw || undefined,
                };
              }

              rowResults.push({
                row: rowNumber,
                sheet: "Pesos",
                valid,
                errors,
                data,
              });
            });
          }
        }

        // ── Validar hoja Comidas ──
        const wsC = wb.getWorksheet("Comidas");
        if (!wsC) {
          rowResults.push({
            row: 0,
            sheet: "Comidas",
            valid: false,
            errors: ['Falta la hoja "Comidas" en el archivo'],
          });
        } else {
          const cHeaders: string[] = [];
          wsC.getRow(1).eachCell({ includeEmpty: false }, (cell) => {
            cHeaders.push(cellString(cell));
          });
          const headersOk =
            cHeaders.length === MEAL_HEADERS.length &&
            cHeaders.every((h, i) => h === MEAL_HEADERS[i]);
          if (!headersOk) {
            rowResults.push({
              row: 0,
              sheet: "Comidas",
              valid: false,
              errors: [
                `Headers de "Comidas" inválidos. Se esperaba: ${MEAL_HEADERS.join(" | ")}`,
              ],
            });
          } else {
            const now = new Date();
            const seenDT = new Set<string>();

            wsC.eachRow({ includeEmpty: false }, (row, rowNumber) => {
              if (rowNumber === 1) return;

              const fechaRaw = cellString(row.getCell(1));
              const horaRaw = cellString(row.getCell(2));
              const alimentoRaw = cellString(row.getCell(3));
              const gramosRaw = cellNumber(row.getCell(4));
              const tipoRaw = cellString(row.getCell(5)).toLowerCase();
              const notaRaw = cellString(row.getCell(6));

              // Fila vacía
              if (!fechaRaw && !horaRaw && !alimentoRaw && gramosRaw === null) return;

              const errors: string[] = [];

              // Fecha
              let fechaDate: Date | null = null;
              if (!fechaRaw) {
                errors.push("Fecha vacía");
              } else {
                fechaDate = parseDateDDMMYYYY(fechaRaw);
                if (!fechaDate) {
                  errors.push("Formato de fecha inválido (usar dd/mm/yyyy)");
                } else if (fechaDate > now) {
                  errors.push("La fecha no puede ser futura");
                }
              }

              // Hora
              const horaParsed = parseTimeHHMM(horaRaw);
              if (!horaRaw) {
                errors.push("Hora vacía");
              } else if (!horaParsed) {
                errors.push("Formato de hora inválido (usar HH:mm)");
              }

              // Duplicado fecha+hora
              if (fechaDate && horaParsed) {
                const key = `${fechaDate.toISOString().slice(0, 10)}_${horaParsed}`;
                if (seenDT.has(key)) {
                  errors.push("Ya existe una comida para esta fecha y hora");
                }
                seenDT.add(key);
              }

              // Alimento
              if (!alimentoRaw) {
                errors.push("Alimento vacío");
              } else if (alimentoRaw.length > 120) {
                errors.push("El alimento excede 120 caracteres");
              }

              // Gramos
              if (gramosRaw === null) {
                errors.push("Gramos vacíos");
              } else if (gramosRaw <= 0) {
                errors.push("Gramos debe ser mayor a 0");
              }

              // Tipo
              if (tipoRaw && !VALID_MEAL_TYPES.includes(tipoRaw)) {
                errors.push(
                  `Tipo inválido ("${tipoRaw}"). Usar: ${VALID_MEAL_TYPES.join(", ")}`,
                );
              }

              // Nota
              if (notaRaw.length > 200) {
                errors.push("La nota excede 200 caracteres");
              }

              const valid = errors.length === 0;
              let data: Record<string, unknown> | undefined;
              if (valid && fechaDate && horaParsed) {
                const dt = new Date(fechaDate);
                const [h, m] = horaParsed.split(":").map(Number);
                dt.setHours(h, m, 0, 0);
                data = {
                  fechaHora: dt.toISOString(),
                  alimento: alimentoRaw,
                  gramos: gramosRaw!,
                  comida: tipoRaw || undefined,
                  nota: notaRaw || undefined,
                };
              }

              rowResults.push({
                row: rowNumber,
                sheet: "Comidas",
                valid,
                errors,
                data,
              });
            });
          }
        }

        // ── Validar hoja Líquidos (opcional: si no existe, el archivo sigue siendo válido) ──
        const wsL = wb.getWorksheet("Líquidos");
        if (wsL) {
          const lHeaders: string[] = [];
          wsL.getRow(1).eachCell({ includeEmpty: false }, (cell) => {
            lHeaders.push(cellString(cell));
          });
          const headersOk =
            lHeaders.length === LIQUID_HEADERS.length &&
            lHeaders.every((h, i) => h === LIQUID_HEADERS[i]);
          if (!headersOk) {
            rowResults.push({
              row: 0,
              sheet: "Líquidos",
              valid: false,
              errors: [
                `Headers de "Líquidos" inválidos. Se esperaba: ${LIQUID_HEADERS.join(" | ")}`,
              ],
            });
          } else {
            const now = new Date();
            const seenDT = new Set<string>();

            wsL.eachRow({ includeEmpty: false }, (row, rowNumber) => {
              if (rowNumber === 1) return;

              const fechaRaw = cellString(row.getCell(1));
              const horaRaw = cellString(row.getCell(2));
              const mlRaw = cellNumber(row.getCell(3));
              const notaRaw = cellString(row.getCell(4));

              // Fila vacía → ignorar
              if (!fechaRaw && !horaRaw && mlRaw === null && !notaRaw) return;

              const errors: string[] = [];

              // Fecha
              let fechaDate: Date | null = null;
              if (!fechaRaw) {
                errors.push("Fecha vacía");
              } else {
                fechaDate = parseDateDDMMYYYY(fechaRaw);
                if (!fechaDate) {
                  errors.push("Formato de fecha inválido (usar dd/mm/yyyy)");
                } else if (fechaDate > now) {
                  errors.push("La fecha no puede ser futura");
                }
              }

              // Hora
              const horaParsed = parseTimeHHMM(horaRaw);
              if (!horaRaw) {
                errors.push("Hora vacía");
              } else if (!horaParsed) {
                errors.push("Formato de hora inválido (usar HH:mm)");
              }

              // Duplicado fecha+hora
              if (fechaDate && horaParsed) {
                const key = `${fechaDate.toISOString().slice(0, 10)}_${horaParsed}`;
                if (seenDT.has(key)) {
                  errors.push("Ya existe un registro para esta fecha y hora");
                }
                seenDT.add(key);
              }

              // Cantidad
              if (mlRaw === null) {
                errors.push("Cantidad vacía");
              } else if (mlRaw <= 0 || mlRaw > 10000) {
                errors.push("Cantidad debe ser entre 1 y 10000 ml");
              }

              // Nota
              if (notaRaw.length > 200) {
                errors.push("La nota excede 200 caracteres");
              }

              const valid = errors.length === 0;
              let data: Record<string, unknown> | undefined;
              if (valid && fechaDate && horaParsed) {
                data = {
                  fechaHora: makeIsoFromDateAndTime(fechaDate, horaParsed),
                  cantidadMl: mlRaw!,
                  nota: notaRaw || undefined,
                };
              }

              rowResults.push({
                row: rowNumber,
                sheet: "Líquidos",
                valid,
                errors,
                data,
              });
            });
          }
        }

        setResults(rowResults);
        setStage("review");
      } catch (err) {
        console.error(err);
        setResults([
          {
            row: 0,
            sheet: "-",
            valid: false,
            errors: ["No se pudo leer el archivo. Asegúrate de que sea un .xlsx válido."],
          },
        ]);
        setStage("review");
      }
    },
    [selectedUserId],
  );

  // ─── Drop zone handlers ─────────────────────────────────────

  const onDrop = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateFile(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [validateFile],
  );

  // ─── Importar ───────────────────────────────────────────────

  const handleImport = async () => {
    if (!selectedUserId) return;
    setStage("importing");
    setImportError(null);

    const validRows = results.filter((r) => r.valid && r.data);
    const weights = validRows
      .filter((r) => r.sheet === "Pesos")
      .map((r) => r.data as { fechaHora: string; pesoKg: number; nota?: string });
    const meals = validRows
      .filter((r) => r.sheet === "Comidas")
      .map(
        (r) =>
          r.data as {
            fechaHora: string;
            alimento: string;
            gramos: number;
            comida?: string;
            nota?: string;
          },
      );
    const liquids = validRows
      .filter((r) => r.sheet === "Líquidos")
      .map(
        (r) =>
          r.data as {
            fechaHora: string;
            cantidadMl: number;
            nota?: string;
          },
      );

    try {
      const res = await bulkImportData(selectedUserId, weights, meals, liquids);
      setImportResult(res.imported);
      setStage("done");
    } catch (err) {
      console.error(err);
      setImportError("Error al importar los datos. Intenta nuevamente.");
      setStage("review");
    }
  };

  // ─── Reset ──────────────────────────────────────────────────

  const handleReset = () => {
    setStage("select");
    setResults([]);
    setImportResult(null);
    setImportError(null);
    setPage(0);
  };

  // ─── Derived state ──────────────────────────────────────────

  const validCount = useMemo(
    () => results.filter((r) => r.valid).length,
    [results],
  );
  const errorCount = results.length - validCount;
  const hasErrors = errorCount > 0;
  const pagedResults = results.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  // ─── Render ─────────────────────────────────────────────────

  if (usersError) {
    return <EmptyState emoji="📡" title="Sin conexión" description={usersError} />;
  }

  return (
    <Box>
      {/* Selector de usuario */}
      {users.length > 0 && (
        <MuiTextField
          select
          label="Usuario destino"
          fullWidth
          size="small"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          sx={{ mb: 2 }}
          SelectProps={{ native: true }}
        >
          {users.map((u) => (
            <option key={u.userId} value={u.userId}>
              {u.nombre} ({u.email})
            </option>
          ))}
        </MuiTextField>
      )}

      {/* ─── Estado: Selección ─── */}
      {stage === "select" && (
        <Card
          elevation={0}
          sx={{ border: "1px dashed", borderColor: "primary.main", textAlign: "center", py: 4 }}
        >
          <CardContent>
            <UploadFileIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
            <Typography fontWeight={700} gutterBottom>
              Importar datos de usuario
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sube un archivo .xlsx con los pesos y comidas del usuario.
              <br />
              Descarga el layout de ejemplo para conocer el formato requerido.
            </Typography>
            <Box display="flex" justifyContent="center" gap={2}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={downloadLayout}
              >
                Descargar layout
              </Button>
              <Button
                variant="contained"
                startIcon={<UploadFileIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                Seleccionar archivo
              </Button>
            </Box>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              hidden
              onChange={onDrop}
            />
          </CardContent>
        </Card>
      )}

      {/* ─── Estado: Validando ─── */}
      {stage === "validating" && (
        <Box sx={{ py: 4 }}>
          <LinearProgress sx={{ borderRadius: 4 }} />
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
            Validando archivo...
          </Typography>
        </Box>
      )}

      {/* ─── Estado: Revisión ─── */}
      {(stage === "review" || stage === "importing") && (
        <Box>
          {importError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {importError}
            </Alert>
          )}

          {/* Resumen */}
          <Box display="flex" gap={1.5} mb={2} flexWrap="wrap">
            <Chip
              label={`${validCount} válida${validCount !== 1 ? "s" : ""}`}
              color="success"
              variant={hasErrors ? "outlined" : "filled"}
              icon={<CheckCircleIcon />}
            />
            {errorCount > 0 && (
              <Chip
                label={`${errorCount} con error`}
                color="error"
                variant="filled"
                icon={<ErrorIcon />}
              />
            )}
          </Box>

          {/* Tabla de resultados */}
          <TableContainer
            component={Card}
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider", mb: 2 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 50 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 80 }}>Hoja</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 90 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Comentario</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedResults.map((r) => (
                  <TableRow
                    key={`${r.sheet}-${r.row}`}
                    sx={{ bgcolor: r.valid ? "success.light" : "error.light", opacity: r.valid ? 1 : 0.85 }}
                  >
                    <TableCell>{r.row}</TableCell>
                    <TableCell>
                      <Chip
                        label={r.sheet}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem" }}
                      />
                    </TableCell>
                    <TableCell>
                      {r.data?.fechaHora
                        ? new Date(r.data.fechaHora as string).toLocaleDateString("es-PE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {r.valid ? (
                        <CheckCircleIcon fontSize="small" color="success" />
                      ) : (
                        <ErrorIcon fontSize="small" color="error" />
                      )}
                    </TableCell>
                    <TableCell sx={{ color: r.valid ? "success.main" : "error.main" }}>
                      {r.errors.length > 0 ? r.errors.join("; ") : "OK"}
                    </TableCell>
                  </TableRow>
                ))}
                {pagedResults.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        No hay filas para mostrar
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {results.length > rowsPerPage && (
            <TablePagination
              component="div"
              count={results.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[rowsPerPage]}
              labelRowsPerPage=""
              sx={{ mb: 2 }}
            />
          )}

          {/* Acciones */}
          <Box display="flex" justifyContent="flex-end" gap={1.5}>
            <Button variant="outlined" onClick={handleReset} disabled={stage === "importing"}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              disabled={hasErrors || stage === "importing"}
              onClick={handleImport}
            >
              {stage === "importing" ? "Importando..." : "Cargar datos"}
            </Button>
          </Box>
        </Box>
      )}

      {/* ─── Estado: Importando ─── */}
      {stage === "importing" && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress sx={{ borderRadius: 4 }} />
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
            Guardando datos en el servidor...
          </Typography>
        </Box>
      )}

      {/* ─── Estado: Completado ─── */}
      {stage === "done" && importResult && (
        <Card
          elevation={0}
          sx={{ border: "1px solid", borderColor: "success.main", textAlign: "center", py: 4 }}
        >
          <CardContent>
            <CheckCircleIcon sx={{ fontSize: 56, color: "success.main", mb: 1 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom>
              ¡Importación exitosa!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Se importaron{" "}
              {[
                importResult.weights > 0 &&
                  `${importResult.weights} peso${importResult.weights !== 1 ? "s" : ""}`,
                importResult.meals > 0 &&
                  `${importResult.meals} comida${importResult.meals !== 1 ? "s" : ""}`,
                importResult.liquids > 0 &&
                  `${importResult.liquids} registro${importResult.liquids !== 1 ? "s" : ""} de líquidos`,
              ]
                .filter((p): p is string => Boolean(p))
                .join(", ")}{" "}
              para el usuario seleccionado.
            </Typography>
            <Button variant="contained" onClick={handleReset}>
              Importar otro archivo
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
