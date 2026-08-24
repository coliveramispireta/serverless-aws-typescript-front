"use client";
import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Typography,
} from "@mui/material";

import EmptyState from "@/components/ui/emptystate";
import { listPosts } from "@/services/keto/community.service";
import { listAchievements } from "@/services/keto/achievements.service";
import { Post, Achievement } from "@/model/keto.models";

/**
 * Actividad del grupo: últimas publicaciones y logros recientes
 * para que el coach siga de cerca a su comunidad.
 */
export default function CoachActividadView() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([listPosts(), listAchievements()])
      .then(([postsResult, achResult]) => {
        if (postsResult.status === "fulfilled") {
          const data = postsResult.value;
          setPosts(Array.isArray(data) ? data : []);
        } else {
          setPosts(null);
        }
        if (achResult.status === "fulfilled") {
          const data = achResult.value;
          setAchievements(Array.isArray(data) ? data : []);
        } else {
          setAchievements(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LinearProgress sx={{ borderRadius: 4 }} />;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* Publicaciones recientes */}
      <Box>
        <Typography variant="subtitle2" fontWeight={700} mb={1}>
          Publicaciones del grupo
        </Typography>
        {posts === null ? (
          <EmptyState emoji="📡" title="Servicio no disponible" description="/posts aún no está activo." />
        ) : posts.length === 0 ? (
          <EmptyState emoji="📝" title="Sin publicaciones todavía" />
        ) : (
          posts.slice(0, 10).map((p) => (
            <Card key={p.id} elevation={0} sx={{ border: p.logroId ? "2px solid" : "1px solid", borderColor: p.logroId ? "secondary.main" : "AMSnowGray.main", mb: 1 }}>
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Avatar src={p.autorFotoUrl || undefined} sx={{ width: 28, height: 28, bgcolor: "AMTeal.main", fontSize: 13 }}>
                    {p.autorNombre?.charAt(0)?.toUpperCase() || "?"}
                  </Avatar>
                  <Typography variant="caption" fontWeight={700}>{p.autorNombre}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    · {new Date(p.fechaCreacion).toLocaleDateString("es-MX")}
                  </Typography>
                  {p.logroId && <Chip size="small" color="secondary" label="🏅 Logro" />}
                </Box>
                <Typography variant="body2">{p.texto}</Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Logros recientes */}
      <Box>
        <Typography variant="subtitle2" fontWeight={700} mb={1}>
          Logros otorgados / compartidos
        </Typography>
        {achievements === null ? (
          <EmptyState emoji="📡" title="Servicio no disponible" description="/achievements aún no está activo." />
        ) : achievements.length === 0 ? (
          <EmptyState emoji="🏅" title="Sin actividad de logros" />
        ) : (
          achievements.slice(0, 10).map((a) => (
            <Box key={a.id} display="flex" alignItems="center" gap={1.5} py={1} borderBottom="1px solid" borderColor="AMUltraLightGray.main">
              <Typography fontSize={22}>{a.emoji}</Typography>
              <Box flex={1}>
                <Typography variant="body2" fontWeight={700}>{a.titulo}</Typography>
                <Typography variant="caption" color="text.secondary">{a.descripcion}</Typography>
              </Box>
              <Chip size="small" label={a.source === "coach" ? "Coach 👤" : "Auto ⚙️"} variant="outlined" />
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
