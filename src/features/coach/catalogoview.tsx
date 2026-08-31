"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Add, CheckCircleOutline, ErrorOutline, Storefront } from "@mui/icons-material";
import { createFood, listFoods, seedFoods } from "@/services/keto/foods.service";
import { FoodCategory, FoodItem, FoodUnit } from "@/model/keto.models";

const CATEGORY_LABELS: Record<FoodCategory, string> = {
  proteina: "Proteínas",
  lacteo: "Lácteos y huevos",
  grasa: "Grasas",
  verdura: "Verduras",
  fruto_seco: "Frutos secos",
  semilla: "Semillas",
  otro: "Otros",
  no_keto: "Alimentos no KETO",
};

const CATEGORY_ORDER: FoodCategory[] = [
  "proteina",
  "lacteo",
  "grasa",
  "verdura",
  "fruto_seco",
  "semilla",
  "otro",
  "no_keto",
];

const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABELS) as FoodCategory[]).map((c) => ({
  value: c,
  label: CATEGORY_LABELS[c],
}));

type SeedState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; inserted: number; updatedEmojis?: number }
  | { status: "forbidden" }
  | { status: "error"; detail: string };

/**
 * Catálogo de alimentos: estado actual y acción para cargar el catálogo inicial.
 * El seed (POST /foods/seed) es idempotente: solo inserta los alimentos que aún
 * no existan por nombre, así que el botón se puede usar sin miedo a duplicar.
 */
export default function CoachCatalogoView() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [seed, setSeed] = useState<SeedState>({ status: "idle" });
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    nombre: string;
    unidad: FoodUnit;
    equivalenciaGramos: string;
    categoria: FoodCategory;
    emoji: string;
  }>({ nombre: "", unidad: "g", equivalenciaGramos: "", categoria: "proteina", emoji: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await listFoods();
      setFoods(Array.isArray(data) ? data : []);
    } catch {
      setLoadError("No se pudo listar el catálogo. Verifica la conexión.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSeed = useCallback(async () => {
    setSeed({ status: "loading" });
    try {
      const res = await seedFoods();
      setSeed({
        status: "success",
        inserted: res.inserted,
        updatedEmojis: res.updatedEmojis,
      });
      await load();
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setSeed({ status: "forbidden" });
      } else {
        setSeed({ status: "error", detail: "No se pudo sembrar el catálogo." });
      }
    }
  }, [load]);

  const openAdd = () => {
    setForm({ nombre: "", unidad: "g", equivalenciaGramos: "", categoria: "proteina", emoji: "" });
    setAddError(null);
    setAddOpen(true);
  };

  const handleAdd = useCallback(async () => {
    const nombre = form.nombre.trim();
    if (!nombre) {
      setAddError("Escribe el nombre del alimento.");
      return;
    }
    setSaving(true);
    setAddError(null);
    try {
      await createFood({
        nombre,
        unidad: form.unidad,
        equivalenciaGramos:
          form.unidad === "und" && form.equivalenciaGramos.trim()
            ? Number(form.equivalenciaGramos)
            : undefined,
        categoria: form.categoria,
        emoji: form.emoji.trim() || undefined,
      });
      setAddOpen(false);
      await load();
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setAddError("Tu correo no está autorizado como coach.");
      } else if (status === 400) {
        setAddError("Datos inválidos. Revisa nombre, unidad y categoría.");
      } else {
        setAddError("No se pudo agregar el alimento.");
      }
    } finally {
      setSaving(false);
    }
  }, [form, load]);

  const grouped = useMemo(() => {
    const map = new Map<FoodCategory, FoodItem[]>();
    for (const f of foods) {
      const cat = f.categoria ?? "otro";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(f);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => [c, map.get(c)!] as const);
  }, [foods]);

  const unidadLabel = (f: FoodItem): string =>
    f.unidad === "und" && f.equivalenciaGramos
      ? `1 und ≈ ${f.equivalenciaGramos} g`
      : f.unidad;

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Estado del catálogo */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Storefront sx={{ fontSize: 40, color: "primary.main" }} />
            <Box>
              <Typography fontWeight={800} variant="h6">
                Catálogo de alimentos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {loading
                  ? "Consultando estado..."
                  : foods.length === 0
                    ? "El catálogo está vacío."
                    : `${foods.length} alimento${foods.length !== 1 ? "s" : ""} en el catálogo.`}
              </Typography>
            </Box>
          </Box>

          {loading && <LinearProgress sx={{ borderRadius: 4, my: 1 }} />}

          {loadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loadError}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Si la tabla está vacía, carga el catálogo inicial con un clic. La
            operación es idempotente: inserta solo los alimentos que falten por nombre
            (no duplica).
          </Typography>

          <Box display="flex" flexWrap="wrap" gap={1}>
            <Button
              variant="contained"
              startIcon={<Storefront />}
              disabled={seed.status === "loading"}
              onClick={handleSeed}
            >
              {seed.status === "loading" ? "Cargando..." : "Cargar catálogo inicial"}
            </Button>
            <Button variant="outlined" startIcon={<Add />} onClick={openAdd}>
              Agregar alimento
            </Button>
          </Box>

          {seed.status === "success" && (
            <Alert severity="success" icon={<CheckCircleOutline />} sx={{ mt: 2 }}>
              {seed.inserted > 0
                ? `Se insertaron ${seed.inserted} alimento${seed.inserted !== 1 ? "s" : ""} al catálogo.`
                : "El catálogo ya estaba poblado. No se insertaron nuevos alimentos."}
              {seed.updatedEmojis
                ? ` Se completaron ${seed.updatedEmojis} emoji${seed.updatedEmojis !== 1 ? "s" : ""} de alimentos que no tenían.`
                : ""}
            </Alert>
          )}
          {seed.status === "forbidden" && (
            <Alert severity="warning" icon={<ErrorOutline />} sx={{ mt: 2 }}>
              Tu correo no está autorizado como coach (SSM <code>COACH_EMAILS</code> o
              grupo Cognito <code>coaches</code>).
            </Alert>
          )}
          {seed.status === "error" && (
            <Alert severity="error" icon={<ErrorOutline />} sx={{ mt: 2 }}>
              {seed.detail}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Listado agrupado */}
      {!loading && !loadError && foods.length > 0 && (
        <Box display="flex" flexDirection="column" gap={2}>
          {grouped.map(([cat, items]) => (
            <Card key={cat} elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" mb={1}>
                  {CATEGORY_LABELS[cat]} · {items.length}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {items.map((f) => (
                    <Chip
                      key={f.foodId}
                      label={`${f.emoji ? f.emoji + " " : ""}${f.nombre} (${unidadLabel(f)})`}
                      size="small"
                      variant="outlined"
                      color={cat === "no_keto" ? "error" : "default"}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Modal: Agregar alimento */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={800}>Agregar alimento al catálogo</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={1.5} mt={0.5}>
            <TextField
              label="Nombre"
              size="small"
              fullWidth
              value={form.nombre}
              onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
            />
            <TextField
              label="Emoji (opcional)"
              size="small"
              fullWidth
              placeholder="Ej: 🥩 🍗 🥦"
              value={form.emoji}
              onChange={(e) => setForm((p) => ({ ...p, emoji: e.target.value }))}
              helperText="Se muestra en la grilla visual al registrar comida."
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Unidad</InputLabel>
              <Select
                label="Unidad"
                value={form.unidad}
                onChange={(e) =>
                  setForm((p) => ({ ...p, unidad: e.target.value as FoodUnit }))
                }
              >
                <MenuItem value="g">g (gramos)</MenuItem>
                <MenuItem value="und">und (unidades)</MenuItem>
                <MenuItem value="ml">ml (mililitros)</MenuItem>
              </Select>
            </FormControl>
            {form.unidad === "und" && (
              <TextField
                label="Equivalencia por unidad (g)"
                type="number"
                size="small"
                fullWidth
                value={form.equivalenciaGramos}
                onChange={(e) => setForm((p) => ({ ...p, equivalenciaGramos: e.target.value }))}
              />
            )}
            <FormControl size="small" fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                label="Categoría"
                value={form.categoria}
                onChange={(e) =>
                  setForm((p) => ({ ...p, categoria: e.target.value as FoodCategory }))
                }
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {addError && (
              <Typography variant="caption" color="error">
                ⚠️ {addError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setAddOpen(false)}>
            Cancelar
          </Button>
          <Button variant="contained" disabled={saving || !form.nombre.trim()} onClick={handleAdd}>
            {saving ? "Guardando..." : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}