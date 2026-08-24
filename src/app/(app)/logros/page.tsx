"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";
import { Share } from "@mui/icons-material";

import EmptyState from "@/components/ui/emptystate";
import SectionHeader from "@/components/ui/sectionheader";
import SourceBadge from "@/components/ui/sourcebadge";
import useUserData from "@/hooks/useuserdata";
import { ACHIEVEMENT_RULES } from "@/lib/engine/achievements";
import { computeMetrics } from "@/lib/engine/metrics";
import { getProfilePrefs } from "@/lib/profileprefs";
import { Achievement } from "@/model/keto.models";
import { listAchievements, shareAchievement } from "@/services/keto/achievements.service";
import { getUserInfo } from "@/services/xstorage.cross.service";

/**
 * Mis logros: combina logros automáticos (evaluados por el motor del
 * frontend) con los otorgados por el coach. Cada tarjeta indica su origen.
 */
export default function LogrosPage() {
  const userInfo = getUserInfo();
  const prefs = getProfilePrefs();
  const { weights, meals, loading, error, reload } = useUserData();
  const [coachAchievements, setCoachAchievements] = useState<Achievement[]>([]);
  const [coachError, setCoachError] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  useEffect(() => {
    listAchievements()
      .then((data) => setCoachAchievements(Array.isArray(data) ? data.filter((a) => a.source === "coach") : []))
      .catch(() => setCoachError(true));
  }, []);

  // Métricas y estado de cada regla automática
  const metrics = useMemo(() => computeMetrics(weights, meals, prefs), [weights, meals, prefs]);

  const autoStatus = useMemo(() => {
    return ACHIEVEMENT_RULES.map((rule) => {
      const earned = rule.cond(metrics, weights, meals);
      return { ...rule, earned };
    });
  }, [metrics, weights, meals]);

  const totalUnlocked =
    autoStatus.filter((a) => a.earned).length + coachAchievements.length;

  const handleShare = async (achievement: { id: string; codigo?: string; titulo: string }) => {
    setSharingId(achievement.id);
    setShareMessage(null);
    try {
      await shareAchievement(achievement.id, `¡Logré "${achievement.titulo}" en mi camino keto! 🎉`);
      setShareMessage(`Compartiste "${achievement.titulo}" con la comunidad.`);
    } catch (err) {
      console.error(err);
      setShareMessage("No se pudo compartir ahora (servicio no disponible aún).");
    } finally {
      setSharingId(null);
    }
  };

  if (loading) {
    return <LinearProgress sx={{ borderRadius: 4 }} />;
  }

  if (error) {
    return (
      <EmptyState emoji="📡" title="Sin conexión" description={error} actionLabel="Reintentar" onAction={reload} />
    );
  }

  return (
    <Box>
      <SectionHeader
        title="Mis logros"
        subtitle={`${totalUnlocked} ${totalUnlocked === 1 ? "logro obtenido" : "logros obtenidos"} 🎉`}
      />

      {/* Logros automáticos */}
      <Grid container spacing={1.5}>
        {autoStatus.map((a) => (
          <Grid item xs={12} sm={6} key={a.codigo}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: a.earned ? "primary.main" : "AMSnowGray.main",
                bgcolor: a.earned ? "AMUltraLightBlue.main" : "background.paper",
                opacity: a.earned ? 1 : 0.65,
                height: "100%",
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Typography fontSize={30}>{a.emoji}</Typography>
                  <SourceBadge source="auto" />
                </Box>
                <Typography fontWeight={800} mt={1}>
                  {a.titulo}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {a.descripcion}
                </Typography>
                <Box mt={1.5}>
                  {a.earned ? (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Share />}
                      disabled={sharingId === a.codigo}
                      onClick={() => handleShare({ id: a.codigo, codigo: a.codigo, titulo: a.titulo })}
                    >
                      Compartir
                    </Button>
                  ) : (
                    <Chip size="small" label="Bloqueado 🔒" variant="outlined" />
                  )}
                </Box>
              </CardContent>
            </Card>
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
                <Card elevation={0} sx={{ border: "2px solid", borderColor: "secondary.main", height: "100%" }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                      <Typography fontSize={30}>{a.emoji}</Typography>
                      <SourceBadge source="coach" />
                    </Box>
                    <Typography fontWeight={800} mt={1}>
                      {a.titulo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {a.descripcion}
                    </Typography>
                    <Box mt={1.5}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        startIcon={<Share />}
                        disabled={sharingId === a.id}
                        onClick={() => handleShare(a)}
                      >
                        Compartir
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
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

      {shareMessage && (
        <Typography variant="caption" color="primary" display="block" textAlign="center" mt={3}>
          {shareMessage}
        </Typography>
      )}

      {/* El usuario comparte desde aquí; identidad para el feed */}
      <Box mt={4} textAlign="center">
        <Typography variant="caption" color="text.secondary">
          Compartiendo como <strong>{userInfo.userName}</strong> · tus logros aparecen en la comunidad
        </Typography>
      </Box>
    </Box>
  );
}
