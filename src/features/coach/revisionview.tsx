"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Tab,
  Tabs,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";
import { Download } from "@mui/icons-material";
import * as ExcelJS from "exceljs";

import EmptyState from "@/components/ui/emptystate";
import WeightChart from "@/components/ui/weightchart";
import { HydrationChart, MetabolismChart } from "@/components/ui/metricscharts";
import dayjs from "dayjs";
import { getUserProgress, listCoachUsers, UserProgress } from "@/services/keto/coach.service";
import { CoachUserSummary } from "@/services/keto/coach.service";
import { LiquidEntry } from "@/model/keto.models";
import { computeHydrationStats, computeNutritionStats } from "@/lib/engine/metrics";
import { formatDateForCell, formatTimeForCell, styleHeaderRow } from "@/features/coach/importhelpers";

/**
 * Revisión individual: selecciona un usuario y revisa su alimentación,
 * pesos y evidencias fotográficas.
 */
export default function CoachRevisionView() {
  const [users, setUsers] = useState<CoachUserSummary[]>([]);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    listCoachUsers()
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) setSelectedUserId(data[0].userId);
      })
      .catch((err) => {
        console.error(err);
        setUsersError("No se pudo cargar la lista de usuarios.");
      });
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    setLoadingProgress(true);
    setProgressError(null);
    getUserProgress(selectedUserId)
      .then(setProgress)
      .catch((err) => {
        console.error(err);
        setProgressError("No se pudo cargar el progreso (servicio no disponible aún).");
        setProgress(null);
      })
      .finally(() => setLoadingProgress(false));
  }, [selectedUserId]);

  // ─── Líquidos agrupados por día (total en litros) ───
  const liquidosPorDia = useMemo(() => {
    const groups = new Map<string, LiquidEntry[]>();
    for (const l of progress?.liquidos ?? []) {
      const key = dayjs(l.fechaHora).format("YYYY-MM-DD");
      const arr = groups.get(key) ?? [];
      arr.push(l);
      groups.set(key, arr);
    }
    return Array.from(groups.entries())
      .map(([key, items]) => ({
        key,
        label: dayjs(`${key}T12:00:00`).format("dddd DD [de] MMMM"),
        totalMl: items.reduce((sum, l) => sum + l.cantidadMl, 0),
        items: [...items].sort(
          (a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime(),
        ),
      }))
      .sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [progress]);

  // Último peso del usuario (para calcular el objetivo de hidratación)
  const latestPesoKg = useMemo(() => {
    const ps = progress?.pesos;
    if (!ps || ps.length === 0) return undefined;
    return [...ps].sort(
      (a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime(),
    )[0].pesoKg;
  }, [progress]);

  // Métricas de metabolismo (cetosis/autofagia) desde las comidas
  const nutritional = useMemo(
    () => computeNutritionStats(progress?.comidas ?? []),
    [progress],
  );

  // Métricas de hidratación desde los líquidos (objetivo según peso y altura)
  const hyd = useMemo(
    () =>
      computeHydrationStats(
        progress?.liquidos ?? [],
        latestPesoKg,
        progress?.usuario?.alturaCm,
      ),
    [progress, latestPesoKg],
  );

  /** Descarga la data completa del usuario (pesos, comidas, hidratación) en Excel. */
  const handleDownloadExcel = async () => {
    if (!progress) return;
    setDownloading(true);
    try {
      const wb = new ExcelJS.Workbook();
      wb.creator = "KetoApp Coach";
      wb.created = new Date();

      // ── Hoja Pesos ──
      const wsP = wb.addWorksheet("Pesos");
      wsP.columns = [
        { header: "Fecha", key: "fecha", width: 14 },
        { header: "Hora", key: "hora", width: 10 },
        { header: "Peso (kg)", key: "peso", width: 12 },
        { header: "Evidencia foto URL", key: "foto", width: 40 },
        { header: "Nota", key: "nota", width: 28 },
      ];
      styleHeaderRow(wsP.getRow(1));
      const pesosSorted = [...(progress.pesos ?? [])].sort(
        (a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime(),
      );
      for (const w of pesosSorted) {
        const d = new Date(w.fechaHora);
        wsP.addRow({
          fecha: formatDateForCell(d),
          hora: formatTimeForCell(d),
          peso: w.pesoKg,
          foto: w.evidenciaFotoUrl ?? "",
          nota: w.nota ?? "",
        });
      }

      // ── Hoja Comidas ──
      const wsC = wb.addWorksheet("Comidas");
      wsC.columns = [
        { header: "Fecha", key: "fecha", width: 14 },
        { header: "Hora", key: "hora", width: 10 },
        { header: "Alimento", key: "alimento", width: 30 },
        { header: "Gramos", key: "gramos", width: 10 },
        { header: "Tipo de comida", key: "tipo", width: 16 },
        { header: "Carbohidratos netos (g)", key: "carbos", width: 22 },
        { header: "Nota", key: "nota", width: 28 },
      ];
      styleHeaderRow(wsC.getRow(1));
      const comidasSorted = [...(progress.comidas ?? [])].sort(
        (a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime(),
      );
      for (const m of comidasSorted) {
        const d = new Date(m.fechaHora);
        wsC.addRow({
          fecha: formatDateForCell(d),
          hora: formatTimeForCell(d),
          alimento: m.alimento,
          gramos: m.gramos,
          tipo: m.comida ?? "",
          carbos: m.carbohidratosNetos ?? "",
          nota: m.nota ?? "",
        });
      }

      // ── Hoja Hidratación ──
      const wsH = wb.addWorksheet("Hidratación");
      wsH.columns = [
        { header: "Fecha", key: "fecha", width: 14 },
        { header: "Hora", key: "hora", width: 10 },
        { header: "Cantidad (ml)", key: "ml", width: 16 },
        { header: "Nota", key: "nota", width: 28 },
      ];
      styleHeaderRow(wsH.getRow(1));
      const liquidosSorted = [...(progress.liquidos ?? [])].sort(
        (a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime(),
      );
      for (const l of liquidosSorted) {
        const d = new Date(l.fechaHora);
        wsH.addRow({
          fecha: formatDateForCell(d),
          hora: formatTimeForCell(d),
          ml: l.cantidadMl,
          nota: l.nota ?? "",
        });
      }

      // ── Descarga ──
      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const nombre =
        progress.usuario?.nombre
          ?.normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-")
          .toLowerCase() ?? "usuario";
      const today = dayjs().format("YYYY-MM-DD");
      const a = document.createElement("a");
      a.href = url;
      a.download = `datos-${nombre}-${today}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  if (usersError) {
    return <EmptyState emoji="📡" title="Sin conexión" description={usersError} />;
  }

  return (
    <Box>
      {/* Selector de usuario */}
      {users.length > 0 && (
        <MuiTextField
          select
          label="Usuario"
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

      {!loadingProgress && progress && (
        <Button
          variant="outlined"
          size="small"
          color="primary"
          onClick={handleDownloadExcel}
          disabled={downloading}
          startIcon={<Download />}
          sx={{ mb: 2 }}
        >
          {downloading ? "Generando…" : "Descargar datos (Excel)"}
        </Button>
      )}

      {loadingProgress && <LinearProgress sx={{ borderRadius: 4 }} />}

      {!loadingProgress && progressError && (
        <EmptyState emoji="📭" title="Sin datos disponibles" description={progressError} />
      )}

      {!loadingProgress && !progressError && progress && (
        <>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2, "& .MuiTab-root": { minHeight: 44, fontSize: 13 } }}
          >
            <Tab label="Peso" />
            <Tab label="Alimentación" />
            <Tab label="Hidratación" />
            <Tab label="Evidencias" />
            <Tab label="Logros" />
          </Tabs>

          {/* Peso */}
          {tab === 0 && (
            <>
              <Card elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main", mb: 1.5 }}>
                <CardContent sx={{ p: 2 }}>
                  <WeightChart weights={progress.pesos ?? []} targetWeight={progress.usuario?.pesoObjetivoKg} />
                </CardContent>
              </Card>
              {(progress.pesos ?? []).length === 0 ? (
                <EmptyState emoji="⚖️" title="Sin registros de peso" />
              ) : (
                [...progress.pesos]
                  .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime())
                  .map((w) => (
                    <Box key={w.id} display="flex" justifyContent="space-between" py={0.8} borderBottom="1px solid" borderColor="AMUltraLightGray.main">
                      <Typography variant="body2">{dayjs(w.fechaHora).format("DD/MM/YYYY HH:mm")}</Typography>
                      <Typography variant="body2" fontWeight={700}>{w.pesoKg} kg</Typography>
                    </Box>
                  ))
              )}
            </>
          )}

          {/* Alimentación */}
          {tab === 1 && (
            <>
              <Card elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main", mb: 1.5 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    🧬 Metabolismo (cetosis y autofagia)
                  </Typography>
                  <MetabolismChart stats={nutritional} />
                </CardContent>
              </Card>
              {(progress.comidas ?? []).length === 0 ? (
                <EmptyState emoji="🍽️" title="Sin registros de alimentación" />
              ) : (
                [...progress.comidas]
                  .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime())
                  .map((m) => (
                    <Card key={m.id} elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main", mb: 1 }}>
                      <CardContent sx={{ p: 1.5, display: "flex", justifyContent: "space-between", "&:last-child": { pb: 1.5 } }}>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>{m.alimento}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(m.fechaHora).format("DD/MM HH:mm")} · {m.comida ?? "comida"}
                          </Typography>
                        </Box>
                        <Typography variant="body2">{m.gramos} g</Typography>
                      </CardContent>
                    </Card>
                  ))
              )}
            </>
          )}

          {/* Hidratación */}
          {tab === 2 && (
            <>
              <Card elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main", mb: 1.5 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    💧 Hidratación (cumplimiento)
                  </Typography>
                  <HydrationChart
                    days={hyd.days}
                    objetivoMl={hyd.objetivoMl}
                    cumplimiento7d={hyd.cumplimiento7d}
                  />
                </CardContent>
              </Card>
              {liquidosPorDia.length === 0 ? (
                <EmptyState
                  emoji="💧"
                  title="Sin registros de hidratación"
                  description="La hidratación del usuario aparecerá aquí cuando se cargue (p. ej. con la hoja Líquidos de la carga masiva)."
                />
              ) : (
                liquidosPorDia.map((d) => (
                  <Card key={d.key} elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main", mb: 1 }}>
                    <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: "capitalize" }}>
                          {d.label}
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={800} color="info.main">
                          {(d.totalMl / 1000).toLocaleString("es-PE", { maximumFractionDigits: 2 })} L
                        </Typography>
                      </Box>
                      {d.items.map((l) => (
                        <Box
                          key={l.id}
                          display="flex"
                          justifyContent="space-between"
                          py={0.6}
                          borderBottom="1px solid"
                          borderColor="AMUltraLightGray.main"
                        >
                          <Typography variant="body2">
                            {dayjs(l.fechaHora).format("HH:mm")} · {l.cantidadMl} ml
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 2, textAlign: "right" }}>
                            {l.nota ?? ""}
                          </Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                ))
              )}
            </>
          )}

          {/* Evidencias */}
          {tab === 3 && (
            (() => {
              const conFoto = (progress.pesos ?? []).filter((w) => w.evidenciaFotoUrl);
              return conFoto.length === 0 ? (
                <EmptyState emoji="📸" title="Sin evidencias fotográficas" description="Las fotos de báscula del usuario aparecerán aquí." />
              ) : (
                <Grid container spacing={1.5}>
                  {conFoto.map((w) => (
                    <Grid item xs={6} sm={4} key={w.id}>
                      <Box component="img" src={w.evidenciaFotoUrl} alt={`Evidencia ${dayjs(w.fechaHora).format("DD/MM")}`} sx={{ width: "100%", borderRadius: 3 }} />
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(w.fechaHora).format("DD/MM/YYYY")} · {w.pesoKg} kg
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              );
            })()
          )}

          {/* Logros */}
          {tab === 4 && (
            (progress.logros ?? []).length === 0 ? (
              <EmptyState emoji="🏅" title="Sin logros registrados" />
            ) : (
              <Grid container spacing={1}>
                {progress.logros.map((a) => (
                  <Grid item xs={12} sm={6} key={a.id}>
                    <Card elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main" }}>
                      <CardContent sx={{ p: 1.5, display: "flex", gap: 1, alignItems: "center", "&:last-child": { pb: 1.5 } }}>
                        <Typography fontSize={22}>{a.emoji}</Typography>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>{a.titulo}</Typography>
                          <Typography variant="caption" color="text.secondary">{a.descripcion}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )
          )}
        </>
      )}

      {!loadingProgress && !progressError && !progress && users.length === 0 && (
        <EmptyState
          emoji="👥"
          title="Sin usuarios todavía"
          description="Cuando existan usuarios activos podrás revisar su progreso aquí."
          actionLabel="Reintentar"
          onAction={() => window.location.reload()}
        />
      )}
    </Box>
  );
}
