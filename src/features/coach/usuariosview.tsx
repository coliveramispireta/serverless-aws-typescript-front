"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

import EmptyState from "@/components/ui/emptystate";
import { listCoachUsers, CoachUserSummary } from "@/services/keto/coach.service";

/**
 * Lista de usuarios del grupo con su resumen de progreso.
 */
export default function CoachUsuariosView() {
  const [users, setUsers] = useState<CoachUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = () => {
    setLoading(true);
    setError(null);
    listCoachUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar la lista de usuarios. El servicio aún no está disponible.");
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.nombre?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [users, query]);

  if (loading) return <LinearProgress sx={{ borderRadius: 4 }} />;

  return (
    <Box>
      <MuiTextField
        placeholder="Buscar por nombre o correo…"
        fullWidth
        size="small"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      {error ? (
        <EmptyState emoji="📡" title="Sin conexión" description={error} actionLabel="Reintentar" onAction={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          emoji="👥"
          title={users.length === 0 ? "Aún no hay usuarios en el grupo" : "Sin resultados"}
          description={
            users.length === 0
              ? "Cuando tus pacientes se registren y se activen, aparecerán aquí."
              : undefined
          }
          actionLabel={users.length === 0 ? "Reintentar" : undefined}
          onAction={users.length === 0 ? load : undefined}
        />
      ) : (
        <Box display="flex" flexDirection="column" gap={1.5}>
          {filtered.map((u) => {
            const perdida = u.perdidaTotalKg ?? 0;
            const alerta = u.diasSinRegistrar != null && u.diasSinRegistrar > 3;
            return (
              <Card key={u.userId} elevation={0} sx={{ border: "1px solid", borderColor: alerta ? "AMRedAlert.main" : "AMSnowGray.main" }}>
                <CardContent sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5, "&:last-child": { pb: 2 } }}>
                  <Avatar src={u.fotoUrl || undefined} sx={{ bgcolor: "primary.main" }}>
                    {u.nombre?.charAt(0)?.toUpperCase() || "?"}
                  </Avatar>
                  <Box flex={1} minWidth={0}>
                    <Typography fontWeight={700} noWrap>
                      {u.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      {u.email}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    {u.pesoActualKg != null && (
                      <Typography variant="body2" fontWeight={700}>
                        {u.pesoActualKg} kg
                      </Typography>
                    )}
                    <Chip
                      size="small"
                      label={perdida > 0 ? `−${perdida} kg` : `${perdida} kg`}
                      color={perdida > 0 ? "success" : "default"}
                      sx={{ mt: 0.5 }}
                    />
                    {alerta && (
                      <Typography variant="caption" color="error" display="block">
                        ⚠️ {u.diasSinRegistrar} días sin registrar
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
