"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  Grid,
  LinearProgress,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";

import EmptyState from "@/components/ui/emptystate";
import SectionHeader from "@/components/ui/sectionheader";
import SourceBadge from "@/components/ui/sourcebadge";
import AchievementCard from "@/components/ui/achievementcard";
import ShareAchievementDialog, { ShareableAchievement } from "@/components/ui/shareachievementdialog";
import useUserData from "@/hooks/useuserdata";
import {
  ACHIEVEMENT_RULES,
  AchievementContext,
  AchievementType,
} from "@/lib/engine/achievements";
import {
  computeHydrationStats,
  computeMetrics,
  computeNutritionStats,
  KetoMetrics,
} from "@/lib/engine/metrics";
import { getProfilePrefs } from "@/lib/profileprefs";
import { Achievement } from "@/model/keto.models";
import { listAchievements } from "@/services/keto/achievements.service";
import { getUserInfo } from "@/services/xstorage.cross.service";

/**
 * Mis logros: combina logros automáticos (evaluados por el motor del
 * frontend) con los otorgados por el coach. Cada tarjeta indica su origen
 * y muestra la barra de progreso + explicación aunque esté bloqueado.
 */
export default function LogrosPage() {
  const userInfo = getUserInfo();
  const prefs = getProfilePrefs();
  const { weights, meals, liquids, loading, error, reload } = useUserData();
  const [coachAchievements, setCoachAchievements] = useState<Achievement[]>([]);
  const [coachError, setCoachError] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<ShareableAchievement | null>(null);
  const [publishedCodes, setPublishedCodes] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"todos" | AchievementType>("todos");

  useEffect(() => {
    listAchievements()
      .then((data) => setCoachAchievements(Array.isArray(data) ? data.filter((a) => a.source === "coach") : []))
      .catch(() => setCoachError(true));
  }, []);

  // Métricas y contexto completo para evaluar reglas automáticas
  const metrics = useMemo(() => computeMetrics(weights, meals, prefs), [weights, meals, prefs]);
  const nutrition = useMemo(() => computeNutritionStats(meals), [meals]);
  const hydration = useMemo(
    () => computeHydrationStats(liquids, metrics.pesoActual, prefs.alturaCm),
    [liquids, metrics.pesoActual, prefs.alturaCm]
  );

  const context: AchievementContext = useMemo(
    () => ({ metrics, weights, meals, liquids, nutrition, hydration }),
    [metrics, weights, meals, liquids, nutrition, hydration]
  );

  const autoStatus = useMemo(() => {
    return ACHIEVEMENT_RULES.map((rule) => {
      const earned = rule.cond(context);
      const progreso = rule.progreso ? rule.progreso(context) : null;
      return { ...rule, earned, progreso };
    });
  }, [context]);

  const visibleAuto =
    tab === "todos" ? autoStatus : autoStatus.filter((a) => a.tipo === tab);

  const totalUnlocked =
    autoStatus.filter((a) => a.earned).length + coachAchievements.length;

  const openShare = (achievement: ShareableAchievement) => {
    setShareTarget({ ...achievement, nombre: userInfo.userName });
    setShareOpen(true);
  };

  const handlePublished = (codigo: string) => {
    setPublishedCodes((prev) => new Set(prev).add(codigo));
  };

  const closeShare = () => {
    setShareOpen(false);
    setShareTarget(null);
  };

  if (loading) {
    return <LinearProgress sx={{ borderRadius: 4 }} />;
  }

  if (error) {
    return (
      <EmptyState emoji="📡" title="Sin conexión" description={error} actionLabel="Reintentar" onAction={reload} />
    );
  }

  const TABS: { value: "todos" | AchievementType; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "peso", label: "⚖️ Peso" },
    { value: "hidratacion", label: "💧 Agua" },
    { value: "alimentacion", label: "🍽️ Keto" },
    { value: "consistencia", label: "📅 Constancia" },
  ];

  return (
    <Box>
      <SectionHeader
        title="Mis logros"
        subtitle={`${totalUnlocked} ${totalUnlocked === 1 ? "logro obtenido" : "logros obtenidos"} 🎉`}
      />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, "& .MuiTab-root": { textTransform: "none", minHeight: 40 } }}
      >
        {TABS.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} />
        ))}
      </Tabs>

      {/* Logros automáticos */}
      <Grid container spacing={1.5}>
        {visibleAuto.map((a) => (
          <Grid item xs={12} sm={6} key={a.codigo}>
            <AchievementCard
              emoji={a.emoji}
              titulo={a.titulo}
              descripcion={a.descripcion}
              explicacion={a.explicacion}
              tipo={a.tipo}
              earned={a.earned}
              progreso={a.progreso}
              published={publishedCodes.has(a.codigo)}
              sourceBadge={<SourceBadge source="auto" />}
              onShare={(s) =>
                openShare({
                  codigo: a.codigo,
                  titulo: a.titulo,
                  descripcion: a.descripcion,
                  emoji: a.emoji,
                  progreso: a.progreso,
                })
              }
            />
          </Grid>
        ))}
      </Grid>

      {/* Logros del coach */}
      <Box mt={4}>
        <SectionHeader title="Otorgados por tu coach" subtitle={coachError ? "Disponibles cuando el servicio esté activo" : undefined} />
        {!coachError && coachAchievements.length > 0 ? (
          <Grid container spacing={1.5}>
            {coachAchievements.map((a) => (
              <Grid item xs={12} sm={6} key={a.id}>
                <AchievementCard
                  emoji={a.emoji}
                  titulo={a.titulo}
                  descripcion={a.descripcion}
                  earned
                  published={publishedCodes.has(a.codigo)}
                  sourceBadge={<SourceBadge source="coach" />}
                  onShare={(s) =>
                    openShare({
                      codigo: a.codigo,
                      titulo: a.titulo,
                      descripcion: a.descripcion,
                      emoji: a.emoji,
                    })
                  }
                />
              </Grid>
            ))}
          </Grid>
        ) : !coachError ? (
          <EmptyState
            emoji="🎁"
            title="Sin logros personalizados todavía"
            description="Tu coach puede otorgarte logros especiales por tus avances."
          />
        ) : null}
      </Box>

      {/* Diálogo de compartir logro */}
      <ShareAchievementDialog
        open={shareOpen}
        achievement={shareTarget}
        alreadyPublished={shareTarget ? publishedCodes.has(shareTarget.codigo) : false}
        onClose={closeShare}
        onPublished={handlePublished}
      />

      {/* El usuario comparte desde aquí; identidad para el feed */}
      <Box mt={4} textAlign="center">
        <Typography variant="caption" color="text.secondary">
          Compartiendo como <strong>{userInfo.userName}</strong> · tus logros aparecen en la comunidad
        </Typography>
      </Box>
    </Box>
  );
}
