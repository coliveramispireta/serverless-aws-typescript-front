"use client";
import { useEffect, useState } from "react";
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

import EmptyState from "@/components/ui/emptystate";
import WeightChart from "@/components/ui/weightchart";
import dayjs from "dayjs";
import { getUserProgress, listCoachUsers, UserProgress } from "@/services/keto/coach.service";
import { CoachUserSummary } from "@/services/keto/coach.service";

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
                  .slice(0, 10)
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
            (progress.comidas ?? []).length === 0 ? (
              <EmptyState emoji="🍽️" title="Sin registros de alimentación" />
            ) : (
              [...progress.comidas]
                .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime())
                .slice(0, 15)
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
            )
          )}

          {/* Evidencias */}
          {tab === 2 && (
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
          {tab === 3 && (
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
