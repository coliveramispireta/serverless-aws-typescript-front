"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  TextField as MuiTextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";

import EmptyState from "@/components/ui/emptystate";
import SourceBadge from "@/components/ui/sourcebadge";
import {
  createRecipe,
  deleteRecipe,
  listRecipes,
} from "@/services/keto/recipes.service";
import { Recipe } from "@/model/keto.models";

interface RecipeForm {
  titulo: string;
  descripcion: string;
  ingredientes: string; // una por línea
  pasos: string; // un paso por línea
  minutosPreparacion: number | "";
  porciones: number | "";
  carbohidratosNetosPorPorcion: number | "";
}

/**
 * Administración de recetas del coach (crear, editar, eliminar).
 */
export default function CoachRecetasView() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [form, setForm] = useState<RecipeForm>({
    titulo: "",
    descripcion: "",
    ingredientes: "",
    pasos: "",
    minutosPreparacion: "",
    porciones: "",
    carbohidratosNetosPorPorcion: "",
  });

  const load = () => {
    setLoading(true);
    setError(null);
    listRecipes()
      .then((data) => setRecipes(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setError("No se pudieron cargar las recetas.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ titulo: "", descripcion: "", ingredientes: "", pasos: "", minutosPreparacion: "", porciones: "", carbohidratosNetosPorPorcion: "" });
    setDialogOpen(true);
  };

  const openEdit = (recipe: Recipe) => {
    setEditingId(recipe.id);
    setForm({
      titulo: recipe.titulo,
      descripcion: recipe.descripcion ?? "",
      ingredientes: (recipe.ingredientes ?? []).join("\n"),
      pasos: (recipe.pasos ?? []).join("\n"),
      minutosPreparacion: recipe.minutosPreparacion ?? "",
      porciones: recipe.porciones ?? "",
      carbohidratosNetosPorPorcion: recipe.carbohidratosNetosPorPorcion ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.titulo.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || undefined,
        ingredientes: form.ingredientes.split("\n").map((s) => s.trim()).filter(Boolean),
        pasos: form.pasos.split("\n").map((s) => s.trim()).filter(Boolean),
        minutosPreparacion: form.minutosPreparacion === "" ? undefined : Number(form.minutosPreparacion),
        porciones: form.porciones === "" ? undefined : Number(form.porciones),
        carbohidratosNetosPorPorcion:
          form.carbohidratosNetosPorPorcion === "" ? undefined : Number(form.carbohidratosNetosPorPorcion),
        source: "coach" as const,
      };
      if (editingId) {
        const { updateRecipe } = await import("@/services/keto/recipes.service");
        await updateRecipe(payload as Recipe);
      } else {
        await createRecipe(payload);
      }
      setDialogOpen(false);
      setSnack({ type: "success", msg: editingId ? "Receta actualizada ✅" : "Receta creada ✅" });
      load();
    } catch (err) {
      console.error(err);
      setSnack({ type: "error", msg: "No se pudo guardar. El servicio aún no está disponible." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRecipe(id);
      setSnack({ type: "success", msg: "Receta eliminada" });
      load();
    } catch (err) {
      console.error(err);
      setSnack({ type: "error", msg: "No se pudo eliminar." });
    }
  };

  if (loading) return <LinearProgress sx={{ borderRadius: 4 }} />;

  return (
    <Box>
      <Button variant="contained" color="secondary" startIcon={<Add />} onClick={openCreate} fullWidth>
        Nueva receta
      </Button>

      {error ? (
        <EmptyState emoji="📡" title="Sin conexión" description={error} actionLabel="Reintentar" onAction={load} />
      ) : recipes.length === 0 ? (
        <EmptyState
          emoji="📖"
          title="Aún no hay recetas"
          description="Crea la primera receta keto para tu grupo."
          actionLabel="Nueva receta"
          onAction={openCreate}
        />
      ) : (
        <Box mt={2} display="flex" flexDirection="column" gap={1.5}>
          {recipes.map((r) => (
            <Card key={r.id} elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main" }}>
              <CardContent sx={{ p: 2, display: "flex", gap: 1.5, alignItems: "center", "&:last-child": { pb: 2 } }}>
                <Box flex={1} minWidth={0}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography fontWeight={700} noWrap>
                      {r.titulo}
                    </Typography>
                    <SourceBadge source={r.source} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {(r.ingredientes?.length ?? 0)} ingredientes
                    {r.minutosPreparacion != null ? ` · ${r.minutosPreparacion} min` : ""}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => openEdit(r)}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDelete(r.id)}>
                  <Delete fontSize="small" />
                </IconButton>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* ---------- Diálogo crear/editar ---------- */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={800}>{editingId ? "Editar receta" : "Nueva receta"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} pt={0.5}>
            <Grid item xs={12}>
              <MuiTextField
                label="Título"
                fullWidth
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <MuiTextField
                label="Descripción"
                fullWidth
                multiline
                minRows={2}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <MuiTextField
                label="Ingredientes (uno por línea)"
                fullWidth
                multiline
                minRows={3}
                value={form.ingredientes}
                onChange={(e) => setForm({ ...form, ingredientes: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <MuiTextField
                label="Pasos (uno por línea)"
                fullWidth
                multiline
                minRows={3}
                value={form.pasos}
                onChange={(e) => setForm({ ...form, pasos: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <MuiTextField
                label="Minutos"
                type="number"
                fullWidth
                value={form.minutosPreparacion}
                onChange={(e) => setForm({ ...form, minutosPreparacion: e.target.value === "" ? "" : Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={4}>
              <MuiTextField
                label="Porciones"
                type="number"
                fullWidth
                value={form.porciones}
                onChange={(e) => setForm({ ...form, porciones: e.target.value === "" ? "" : Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={4}>
              <MuiTextField
                label="Carb. netos"
                type="number"
                fullWidth
                inputProps={{ step: 0.5 }}
                value={form.carbohidratosNetosPorPorcion}
                onChange={(e) =>
                  setForm({
                    ...form,
                    carbohidratosNetosPorPorcion: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" color="secondary" disabled={saving || !form.titulo.trim()} onClick={handleSave}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={3500}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack?.type ?? "info"}>{snack?.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
