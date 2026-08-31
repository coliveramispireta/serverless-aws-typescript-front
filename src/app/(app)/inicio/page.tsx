"use client";
import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";
import {
  Flag,
  LocalFireDepartment,
  MonitorWeight,
  NotificationsActive,
  Speed,
  TrendingDown,
  UploadFile,
} from "@mui/icons-material";
import Link from "next/link";

import EmptyState from "@/components/ui/emptystate";
import SourceBadge from "@/components/ui/sourcebadge";
import StatCard from "@/components/ui/statcard";
import UserImportDialog from "@/components/ui/userimportdialog";
import WeightChart from "@/components/ui/weightchart";
import {
  HydrationChart,
  MetricsCarousel,
  MetricHelp,
  NutritionChart,
} from "@/components/ui/metricscharts";
import useUserData from "@/hooks/useuserdata";
import usePush from "@/hooks/usepush";
import {
  computeHydrationStats,
  computeMetrics,
  computeNutritionStats,
  normalizeAlturaCm,
  buildWeightSeries,
} from "@/lib/engine/metrics";
import { getAutoMotivation, getAutoRecommendation } from "@/lib/engine/motivation";
import { evaluateAchievements } from "@/lib/engine/achievements";
import { buildLocalUserProfile, getProfilePrefs } from "@/lib/profileprefs";
import { getUserInfo } from "@/services/xstorage.cross.service";

/**
 * Dashboard personal: progreso visual del usuario.
 * Combina métricas automáticas (engine) con mensajes y recomendaciones
 * generadas por el sistema. El contenido del coach se mostrará cuando
 * el backend lo exponga.
 */
export default function InicioPage() {
  const userInfo = getUserInfo();
  const prefs = getProfilePrefs();
  const { weights, meals, liquids, loading, error, reload } = useUserData();
  const push = usePush();

  const [pushMsg, setPushMsg] = useState<string | null>(null);
  const [pushMsgOk, setPushMsgOk] = useState(false);
  const [openImport, setOpenImport] = useState(false);

  const metrics = useMemo(
    () => computeMetrics(weights, meals, prefs),
    [weights, meals, prefs]
  );
  const motivation = getAutoMotivation(metrics);
  const recommendation = getAutoRecommendation(metrics);
  const nutritionStats = useMemo(() => computeNutritionStats(meals), [meals]);
  const hydration = useMemo(
    () => computeHydrationStats(liquids, metrics.pesoActual, prefs.alturaCm),
    [liquids, metrics.pesoActual, prefs.alturaCm]
  );
  const achievements = useMemo(
    () =>
      evaluateAchievements(weights, meals, {
        ...prefs,
        liquids,
        nutrition: nutritionStats,
        hydration,
      }),
    [weights, meals, prefs, liquids, nutritionStats, hydration]
  );

  // Textos de ayuda (tooltip) para explicar cada métrica
  const helpPeso =
    "Tu último peso registrado en la báscula. El gráfico traza tu evolución y tu meta (línea punteada).";
  const helpPerdida =
    "Diferencia entre tu primer y tu último peso. El % se calcula sobre tu peso inicial.";
  const helpRacha =
    "Días consecutivos con al menos un registro (peso o comida), contando hacia atrás desde hoy.";
  const helpIMC =
    "Índice de Masa Corporal = peso (kg) ÷ altura² (m). No es un porcentaje: <18.5 bajo, 18.5–24.9 normal, 25–29.9 sobrepeso, ≥30 obesidad. Edita tu altura en Perfil (en cm, ej. 170).";
  const helpPesoChart =
    "Evolución de tu peso registrado. La línea punteada es tu meta. Registra peso desde la pestaña Peso o el botón de abajo.";
  const helpAlimChart =
    "Heurística según tus registros de comida: ~12–14 h sin comer sostiene cetosis 🔥; ≥16 h activa autofagia 🌀. Los 🔴 marcan alimentos no KETO que pueden sacarte de cetosis. Es orientativo, no médico.";
  const helpHidraChart =
    "Objetivo diario de agua = promedio entre 35 ml × tu peso y (talla cm − 100) × 30. Cumplir ≥80% ayuda a mantener cetosis y evitar retención. Regístralo en 💧.";

  if (loading) {
    return (
      <Box>
        <LinearProgress sx={{ borderRadius: 4 }} />
        <Typography mt={2} color="text.secondary" textAlign="center">
          Cargando tu progreso…
        </Typography>
      </Box>
    );
  }

  if (error) {
    return <EmptyState emoji="📡" title="Sin conexión" description={error} actionLabel="Reintentar" onAction={reload} />;
  }

  // Serie para la gráfica + progreso hacia el objetivo
  const series = buildWeightSeries(weights);
  let goalPct: number | null = null;
  if (
    metrics.pesoInicial != null &&
    metrics.pesoActual != null &&
    metrics.pesoObjetivo != null &&
    metrics.pesoInicial !== metrics.pesoObjetivo
  ) {
    const done = metrics.pesoInicial - metrics.pesoActual;
    const total = metrics.pesoInicial - metrics.pesoObjetivo;
    goalPct = Math.max(0, Math.min(100, Math.round((done / total) * 100)));
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* ---------- Hero KetoFlow ---------- */}
      <Card
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #064e3b 0%, #059669 55%, #10b981 100%)",
          color: "#fff",
          borderRadius: "20px",
        }}
      >
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <Box component="img" src="/keto/logo.svg" alt="" sx={{ width: 28, height: 28 }} />
            <Typography variant="subtitle1" fontWeight={800} letterSpacing={0.5}>
              Keto<span style={{ color: "#6ee7b7" }}>Flow</span>
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={800} lineHeight={1.25}>
            Tu progreso comienza hoy.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.92, mt: 0.5 }}>
            Registra, aprende, comparte tus logros y sigue avanzando.
          </Typography>
          <Typography
            variant="caption"
            component="p"
            sx={{ opacity: 0.8, mt: 1, fontStyle: "italic", display: "block" }}
          >
            "No se trata de hacerlo perfecto. Se trata de no dejar de avanzar."
          </Typography>
          <Box display="flex" gap={0.75} flexWrap="wrap" mt={1.5}>
            {["Registra tu progreso", "Celebra tus logros", "Comparte el camino"].map((chip) => (
              <Chip
                key={chip}
                label={chip}
                size="small"
                sx={{
                  color: "#fff",
                  borderColor: "rgba(255,255,255,.45)",
                  fontSize: 11,
                }}
                variant="outlined"
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* ---------- Banner: activar notificaciones ---------- */}
      {push.supported && !push.subscribed && push.permission === "default" && (
        <Card
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "AMSnowGray.main",
            bgcolor: "AMUltraLightBlue.main",
          }}
        >
          <CardContent sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5, "&:last-child": { pb: 2 } }}>
            <NotificationsActive color="primary" />
            <Box flex={1} minWidth={0}>
              <Typography variant="body2" fontWeight={700}>
                No te pierdas nada
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Comentarios de la comunidad y avisos de tu coach, directo a tu celular
              </Typography>
              {pushMsg && (
                <Typography
                  variant="caption"
                  display="block"
                  color={pushMsgOk ? "primary" : "error"}
                >
                  {pushMsg}
                </Typography>
              )}
            </Box>
            <Button
              size="small"
              variant="contained"
              disabled={push.busy}
              onClick={async () => {
                const ok = await push.enable();
                if (ok) {
                  setPushMsg("¡Listo! Activadas 🔔");
                  setPushMsgOk(true);
                } else {
                  setPushMsg("No se pudo activar. Revisa permisos del navegador.");
                  setPushMsgOk(false);
                }
              }}
            >
              Activar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Saludo */}      <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
        <Avatar src={userInfo.photoURL || undefined} sx={{ width: 44, height: 44, bgcolor: "primary.main" }}>
          {userInfo.userName?.charAt(0)?.toUpperCase() || "?"}
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
            Hola, {userInfo.userName?.split(" ")[0] || "crack"} 👋
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Este es tu progreso keto
          </Typography>
        </Box>
      </Box>

      {/* Mensaje motivacional automático */}
      <Card elevation={0} sx={{ bgcolor: "AMUltraLightBlue.main", border: "1px solid", borderColor: "AMSnowGray.main" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1} mb={1}>
            <Typography variant="subtitle2" fontWeight={700}>
              Mensaje de hoy
            </Typography>
            <SourceBadge source="auto" />
          </Box>
          <Typography variant="body2">{motivation.texto}</Typography>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <Grid container spacing={1.5}>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<MonitorWeight fontSize="small" />}
            label="Peso actual"
            value={metrics.pesoActual != null ? `${metrics.pesoActual} kg` : "—"}
            hint={metrics.fechaUltimoRegistro ? new Date(metrics.fechaUltimoRegistro).toLocaleDateString("es-MX") : "sin registros"}
            help={helpPeso}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<TrendingDown fontSize="small" />}
            label="Perdida total"
            accentColor="#0d9488"
            value={
              metrics.perdidaTotalKg != null && metrics.perdidaTotalKg > 0
                ? `−${metrics.perdidaTotalKg} kg`
                : metrics.perdidaTotalKg === 0
                  ? "0 kg"
                  : "—"
            }
            hint={metrics.perdidaPorcentaje ? `${metrics.perdidaPorcentaje}% desde el inicio` : undefined}
            help={helpPerdida}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<LocalFireDepartment fontSize="small" />}
            label="Racha"
            accentColor="#f97316"
            value={`${metrics.rachaDias} ${metrics.rachaDias === 1 ? "día" : "días"}`}
            hint="registrando seguido"
            help={helpRacha}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<Speed fontSize="small" />}
            label="IMC"
            accentColor="#8b5cf6"
            value={metrics.imc != null ? String(metrics.imc) : "—"}
            hint={
              normalizeAlturaCm(prefs.alturaCm)
                ? `altura ${normalizeAlturaCm(prefs.alturaCm)} cm`
                : "configura tu altura"
            }
            help={helpIMC}
          />
        </Grid>
      </Grid>

      {/* Progreso hacia la meta */}
      {goalPct != null && (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main" }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Flag fontSize="small" color="primary" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Progreso hacia tu meta ({metrics.pesoObjetivo} kg)
                </Typography>
              </Box>
              <Chip size="small" color="primary" label={`${goalPct}%`} />
            </Box>
            <LinearProgress variant="determinate" value={goalPct} sx={{ height: 10, borderRadius: 5 }} />
          </CardContent>
        </Card>
      )}

      {/* Métricas en carrusel: peso / alimentación / hidratación */}
      <MetricsCarousel
        tabs={[
          {
            id: "peso",
            label: "Peso",
            content: (
              <Box>
                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Evolución de peso
                  </Typography>
                  <MetricHelp>{helpPesoChart}</MetricHelp>
                </Box>
                <WeightChart weights={weights} targetWeight={prefs.pesoObjetivoKg} />
                <Box textAlign="center" mt={1}>
                  <Button component={Link} href="/peso" size="small">
                    Registrar peso
                  </Button>
                </Box>
              </Box>
            ),
          },
          {
            id: "alimentacion",
            label: "Alimentación",
            content: (
              <Box>
                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Ayunos y cetosis
                  </Typography>
                  <MetricHelp>{helpAlimChart}</MetricHelp>
                </Box>
                <NutritionChart stats={nutritionStats} />
              </Box>
            ),
          },
          {
            id: "hidratacion",
            label: "Hidratación",
            content: (
              <Box>
                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Cumplimiento de agua
                  </Typography>
                  <MetricHelp>{helpHidraChart}</MetricHelp>
                </Box>
                <HydrationChart
                  days={hydration.days}
                  objetivoMl={hydration.objetivoMl}
                  cumplimiento7d={hydration.cumplimiento7d}
                />
              </Box>
            ),
          },
        ]}
      />

      {/* Ponerme al día (import comidas+agua, sin pesos) */}
      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "primary.main", cursor: "pointer" }}
        onClick={() => setOpenImport(true)}
      >
        <CardContent sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5, "&:last-child": { pb: 2 } }}>
          <Button
            variant="contained"
            startIcon={<UploadFile />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setOpenImport(true);
            }}
          >
            Ponerme al día
          </Button>
          <Box flex={1} minWidth={0}>
            <Typography variant="caption" color="text.secondary">
              Importa comidas y agua de días atrasados
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Acceso a Bases de Keto */}
      <Card
        elevation={0}
        component={Link}
        href="/bases"
        sx={{
          border: "1px solid",
          borderColor: "AMSnowGray.main",
          textDecoration: "none",
          cursor: "pointer",
          transition: "box-shadow .2s",
          "&:hover": { boxShadow: 4 },
        }}
      >
        <CardContent sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5, "&:last-child": { pb: 2 } }}>
          <Typography fontSize={28}>📚</Typography>
          <Box flex={1} minWidth={0}>
            <Typography fontWeight={700}>Aprende lo básico</Typography>
            <Typography variant="caption" color="text.secondary">
              Entiende la ciencia detrás de tus resultados
            </Typography>
          </Box>
          <Typography color="primary" fontWeight={800}>
            →
          </Typography>
        </CardContent>
      </Card>

      {/* Recomendación automática */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1} mb={1}>
            <Typography variant="subtitle2" fontWeight={700}>
              Recomendación
            </Typography>
            <SourceBadge source="auto" />
          </Box>
          <Typography variant="body2">{recommendation.texto}</Typography>
        </CardContent>
      </Card>

      {/* Logros recientes */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={achievements.length ? 1 : 0}>
            <Typography variant="subtitle2" fontWeight={700}>
              Logros obtenidos
            </Typography>
            <Button component={Link} href="/logros" size="small">
              Ver todos
            </Button>
          </Box>
          {achievements.length === 0 ? (
            <EmptyState
              emoji="🌱"
              title="Aún no tienes logros"
              description="Registra tu peso o tus comidas y empezarás a desbloquearlos."
            />
          ) : (
            <Box display="flex" gap={1} flexWrap="wrap">
              {achievements.slice(0, 4).map((a) => (
                <Chip key={a.id} label={`${a.emoji} ${a.titulo}`} variant="outlined" />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Diálogo: Ponerme al día */}
      <UserImportDialog
        open={openImport}
        onClose={() => setOpenImport(false)}
        onImported={reload}
      />
    </Box>
  );
}
