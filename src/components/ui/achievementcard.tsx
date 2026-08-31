"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import { Info, Share } from "@mui/icons-material";
import { AchievementType } from "@/lib/engine/achievements";
import { ShareableAchievement } from "./shareachievementdialog";

interface Props {
  emoji: string;
  titulo: string;
  descripcion: string;
  explicacion?: string;
  tipo?: AchievementType;
  earned: boolean;
  progreso?: { actual: number; meta: number } | null;
  published?: boolean;
  sourceBadge?: React.ReactNode;
  onShare: (a: ShareableAchievement) => void;
}

const TIPO_CHIP_LABEL: Record<AchievementType, string> = {
  peso: "⚖️ Peso",
  hidratacion: "💧 Agua",
  alimentacion: "🍽️ Alimentación",
  consistencia: "📅 Constancia",
  general: "✨ General",
};

export default function AchievementCard({
  emoji,
  titulo,
  descripcion,
  explicacion,
  tipo,
  earned,
  progreso,
  published,
  sourceBadge,
  onShare,
}: Props) {
  const pct =
    progreso && progreso.meta > 0
      ? Math.min(100, Math.round((progreso.actual / progreso.meta) * 100))
      : null;

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: earned ? "primary.main" : "AMSnowGray.main",
        bgcolor: earned ? "AMUltraLightBlue.main" : "background.paper",
        opacity: earned ? 1 : 0.85,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", flexDirection: "column", flex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
          <Typography fontSize={30}>{emoji}</Typography>
          {tipo && TIPO_CHIP_LABEL[tipo] ? (
            <Chip
              size="small"
              label={TIPO_CHIP_LABEL[tipo]}
              variant="outlined"
              sx={{ fontSize: "0.6rem", height: 18 }}
            />
          ) : (
            sourceBadge
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={0.5} mt={1}>
          <Typography fontWeight={800}>{titulo}</Typography>
          {explicacion && (
            <Tooltip title={explicacion} arrow>
              <Info
                sx={{ fontSize: 15, color: "text.secondary", cursor: "help", flexShrink: 0 }}
              />
            </Tooltip>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary">
          {descripcion}
        </Typography>

        {/* Barra de progreso (visible también si está bloqueado, para motivar) */}
        {pct !== null && (
          <Box mt={1.5}>
            <Box display="flex" justifyContent="space-between" mb={0.3}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Progreso
              </Typography>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                {progreso!.actual} / {progreso!.meta}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}

        <Box mt="auto" pt={1.5} display="flex" alignItems="center" gap={1}>
          {earned ? (
            <>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Share />}
                onClick={() => onShare({ codigo: titulo, titulo, descripcion, emoji })}
              >
                Compartir
              </Button>
              {published && (
                <Chip size="small" color="success" variant="outlined" label="✓ En el muro" />
              )}
            </>
          ) : (
            <Chip size="small" label="Bloqueado 🔒" variant="outlined" />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
