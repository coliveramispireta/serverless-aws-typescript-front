"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";

import EmptyState from "@/components/ui/emptystate";
import SectionHeader from "@/components/ui/sectionheader";
import SourceBadge from "@/components/ui/sourcebadge";
import { listRecipes } from "@/services/keto/recipes.service";
import { Recipe } from "@/model/keto.models";

/**
 * Recetas keto del programa. La mayoría las publica el coach;
 * el badge indica el origen del contenido.
 */
export default function RecetasPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Recipe | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    listRecipes()
      .then((data) => setRecipes(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setError("No se pudo conectar con el servidor para traer las recetas.");
        setRecipes([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Ordenar: coach primero, luego por fecha
  const ordered = useMemo(
    () =>
      [...recipes].sort((a, b) => {
        if (a.source !== b.source) return a.source === "coach" ? -1 : 1;
        return (b.fechaCreacion ?? "").localeCompare(a.fechaCreacion ?? "");
      }),
    [recipes]
  );

  if (loading) return <LinearProgress sx={{ borderRadius: 4 }} />;

  return (
    <Box>
      <SectionHeader title="Recetas keto" subtitle="Ideas ricas y bajas en carbohidratos" />

      {error ? (
        <EmptyState emoji="📡" title="Sin conexión" description={error} actionLabel="Reintentar" onAction={load} />
      ) : ordered.length === 0 ? (
        <EmptyState
          emoji="🥑"
          title="Aún no hay recetas"
          description="Tu coach estará publicando recetas keto aquí muy pronto."
          actionLabel="Reintentar"
          onAction={load}
        />
      ) : (
        <Grid container spacing={1.5}>
          {ordered.map((recipe) => (
            <Grid item xs={12} sm={6} key={recipe.id}>
              <Card
                elevation={0}
                onClick={() => setSelected(recipe)}
                sx={{
                  border: "1px solid",
                  borderColor: recipe.source === "coach" ? "secondary.main" : "AMSnowGray.main",
                  cursor: "pointer",
                  height: "100%",
                  transition: "box-shadow .2s",
                  "&:hover": { boxShadow: 4 },
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                    <Typography fontWeight={800}>{recipe.titulo}</Typography>
                    <SourceBadge source={recipe.source} />
                  </Box>
                  {recipe.descripcion && (
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                      {recipe.descripcion.length > 90 ? `${recipe.descripcion.slice(0, 90)}…` : recipe.descripcion}
                    </Typography>
                  )}
                  <Box display="flex" gap={0.5} mt={1.5} flexWrap="wrap">
                    {recipe.minutosPreparacion != null && (
                      <Chip size="small" variant="outlined" label={`⏱️ ${recipe.minutosPreparacion} min`} />
                    )}
                    {recipe.carbohidratosNetosPorPorcion != null && (
                      <Chip size="small" variant="outlined" label={`🥬 ${recipe.carbohidratosNetosPorPorcion} g netos`} />
                    )}
                    {recipe.porciones != null && (
                      <Chip size="small" variant="outlined" label={`🍽️ ${recipe.porciones}`} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ---------- Detalle ---------- */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        {selected && (
          <>
            <DialogTitle fontWeight={800} display="flex" justifyContent="space-between" alignItems="center" gap={1}>
              <span>{selected.titulo}</span>
              <SourceBadge source={selected.source} />
            </DialogTitle>
            <DialogContent dividers>
              {selected.descripcion && <Typography variant="body2" mb={2}>{selected.descripcion}</Typography>}

              <Typography variant="subtitle2" fontWeight={700} mb={1}>Ingredientes</Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                {(selected.ingredientes ?? []).map((ing, i) => (
                  <Typography key={i} component="li" variant="body2">{ing}</Typography>
                ))}
              </Box>

              {(selected.pasos?.length ?? 0) > 0 && (
                <>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>Preparación</Typography>
                  <Box component="ol" sx={{ pl: 4 }}>
                    {selected.pasos!.map((paso, i) => (
                      <Typography key={i} component="li" variant="body2">{paso}</Typography>
                    ))}
                  </Box>
                </>
              )}

              <Button
                fullWidth
                variant="outlined"
                onClick={() => setSelected(null)}
                sx={{ mt: 3 }}
              >
                Cerrar
              </Button>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
