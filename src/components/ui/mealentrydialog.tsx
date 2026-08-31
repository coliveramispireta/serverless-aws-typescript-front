"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";
import { Add, Delete, Star, StarBorder } from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";

import { FoodItem } from "@/model/keto.models";
import {
  getFavoriteFoodIds,
  getRecentFoodIds,
  markFoodUsed,
  addToFavorites,
  removeFromFavorites,
} from "@/lib/engine/foodPrefs";

type MealType = "desayuno" | "almuerzo" | "cena" | "snack";

interface MealAlimento {
  foodId: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  equivalenciaGramos?: number;
}

const COMIDAS: { value: MealType; label: string; emoji: string }[] = [
  { value: "desayuno", label: "Desayuno", emoji: "🌅" },
  { value: "almuerzo", label: "Almuerzo", emoji: "☀️" },
  { value: "cena", label: "Cena", emoji: "🌙" },
  { value: "snack", label: "Snack", emoji: "🥜" },
];

interface Props {
  open: boolean;
  foods: FoodItem[];
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (payload: {
    fechaHora: string;
    comida: MealType;
    nota?: string;
    alimentos: Array<{ foodId: string; cantidad: number }>;
  }) => void;
}

export default function MealEntryDialog({
  open,
  foods,
  saving,
  error,
  onClose,
  onSave,
}: Props) {
  const [comida, setComida] = useState<MealType>("desayuno");
  const [fechaHora, setFechaHora] = useState<Dayjs>(dayjs());
  const [nota, setNota] = useState("");
  const [alimentos, setAlimentos] = useState<MealAlimento[]>([]);
  const [catFilter, setCatFilter] = useState<string>("");

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setComida("desayuno");
      setFechaHora(dayjs());
      setNota("");
      setAlimentos([]);
      setCatFilter("");
    }
  }, [open]);

  // Catálogo ordenado: keto primero + "no KETO" al final
  const sortedFoods = useMemo(() => {
    const keto: FoodItem[] = [];
    const nonKeto: FoodItem[] = [];
    for (const f of foods) {
      (f.categoria === "no_keto" ? nonKeto : keto).push(f);
    }
    const byName = (a: FoodItem, b: FoodItem) => a.nombre.localeCompare(b.nombre, "es");
    return [...keto.sort(byName), ...nonKeto.sort(byName)];
  }, [foods]);

  // Recientes y favoritos
  const recentIds = useMemo(() => getRecentFoodIds(), [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const favIds = useMemo(() => getFavoriteFoodIds(), [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const recents = recentIds
    .map((id) => foods.find((f) => f.foodId === id))
    .filter((f): f is FoodItem => Boolean(f));
  const favorites = favIds
    .map((id) => foods.find((f) => f.foodId === id))
    .filter((f): f is FoodItem => Boolean(f));

  const filteredFoods = catFilter
    ? sortedFoods.filter((f) => f.categoria === catFilter)
    : sortedFoods;

  const categories: FoodItem["categoria"][] = Array.from(
    new Set(
      foods
        .map((f) => f.categoria)
        .filter((c): c is Exclude<FoodItem["categoria"], undefined> => Boolean(c))
    )
  );

  const addAlimentoFromFood = (food: FoodItem) => {
    markFoodUsed(food);
    setAlimentos((prev) => [
      ...prev,
      {
        foodId: food.foodId,
        nombre: food.nombre,
        cantidad: 0,
        unidad: food.unidad,
        equivalenciaGramos: food.equivalenciaGramos,
      },
    ]);
  };

  const addEmptyAlimento = () => {
    setAlimentos((prev) => [...prev, { foodId: "", nombre: "", cantidad: 0, unidad: "g" }]);
  };

  const updateAlimento = (index: number, food: FoodItem | null) => {
    if (!food) return;
    markFoodUsed(food);
    setAlimentos((prev) =>
      prev.map((a, i) =>
        i === index
          ? {
              ...a,
              foodId: food.foodId,
              nombre: food.nombre,
              unidad: food.unidad,
              equivalenciaGramos: food.equivalenciaGramos,
            }
          : a,
      ),
    );
  };

  const updateCantidad = (index: number, cantidad: number) => {
    setAlimentos((prev) => prev.map((a, i) => (i === index ? { ...a, cantidad } : a)));
  };

  const removeAlimento = (index: number) => {
    setAlimentos((prev) => prev.filter((_, i) => i !== index));
  };

  const canSave =
    alimentos.length > 0 && alimentos.every((a) => a.foodId && a.cantidad > 0);

  const totalGramos = alimentos.reduce((sum, a) => {
    if (a.unidad === "und" && a.equivalenciaGramos) {
      return sum + Math.round(a.cantidad * a.equivalenciaGramos);
    }
    return sum + Math.round(a.cantidad);
  }, 0);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle fontWeight={800}>🍽️ Nueva comida</DialogTitle>
      <DialogContent>
        {/* Tipo de comida */}
        <Typography variant="caption" color="text.secondary">
          Tipo (puedes registrar la hora del resumen nocturno aquí)
        </Typography>
        <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5} mb={1.5}>
          {COMIDAS.map((c) => (
            <Chip
              key={c.value}
              label={`${c.emoji} ${c.label}`}
              clickable
              color={comida === c.value ? "primary" : "default"}
              variant={comida === c.value ? "filled" : "outlined"}
              onClick={() => setComida(c.value)}
              size="small"
            />
          ))}
        </Box>

        {/* Fecha y hora (para el resumen del día / ponerse al día) */}
        <Box mb={1.5}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Fecha y hora"
              value={fechaHora}
              onChange={(v) => setFechaHora(v ?? dayjs())}
              ampm={false}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </LocalizationProvider>
          <Typography variant="caption" color="text.secondary">
            Por defecto ahora. Si te pones al día por la noche, elige el día y la hora de
            cada comida.
          </Typography>
        </Box>

        {/* Nota */}
        <MuiTextField
          label="Nota (opcional)"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 1.5 }}
          inputProps={{ maxLength: 200 }}
        />

        {/* Favoritos y recientes */}
        {(favorites.length > 0 || recents.length > 0) && (
          <Box mb={1.5}>
            {favorites.length > 0 && (
              <>
                <Typography variant="caption" color="text.secondary" display="block">
                  ⭐ Favoritos (1 clic)
                </Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5} mb={1}>
                  {favorites.map((f) => (
                    <Chip
                      key={f.foodId}
                      label={f.nombre}
                      clickable
                      color="warning"
                      size="small"
                      onClick={() => addAlimentoFromFood(f)}
                    />
                  ))}
                </Box>
              </>
            )}
            {recents.length > 0 && (
              <>
                <Typography variant="caption" color="text.secondary" display="block">
                  🕓 Recientes
                </Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                  {recents.map((f) => (
                    <Chip
                      key={f.foodId}
                      label={f.nombre}
                      clickable
                      size="small"
                      variant="outlined"
                      onClick={() => addAlimentoFromFood(f)}
                    />
                  ))}
                </Box>
              </>
            )}
          </Box>
        )}

        {/* Filtro por categoría */}
        {categories.length > 0 && (
          <Box mb={1}>
            <Typography variant="caption" color="text.secondary" display="block">
              Filtrar por categoría
            </Typography>
            <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
              <Chip
                label="Todos"
                size="small"
                clickable
                color={!catFilter ? "primary" : "default"}
                onClick={() => setCatFilter("")}
              />
              {categories.map((c) => {
                const cat = c as string;
                return (
                  <Chip
                    key={cat}
                    label={cat.replace(/_/g, " ")}
                    size="small"
                    clickable
                    color={catFilter === cat ? "primary" : "default"}
                    onClick={() => setCatFilter(catFilter === cat ? "" : cat)}
                  />
                );
              })}
            </Box>
          </Box>
        )}

        {/* Lista de alimentos */}
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          Alimentos
        </Typography>
        <Box mt={0.5} mb={1}>
          {alimentos.map((item, index) => {
            const fav = favorites.some((f) => f.foodId === item.foodId);
            return (
              <Box key={index} display="flex" gap={1} alignItems="center" mb={1}>
                <Autocomplete
                  options={filteredFoods}
                  getOptionLabel={(o) => o.nombre}
                  isOptionEqualToValue={(o, v) => o.foodId === v.foodId}
                  value={foods.find((f) => f.foodId === item.foodId) ?? null}
                  onChange={(_, newValue) => updateAlimento(index, newValue)}
                  size="small"
                  sx={{ flex: 2 }}
                  renderOption={(props, option) => {
                    const isFav = favorites.some((f) => f.foodId === option.foodId);
                    return (
                      <li {...props} key={option.foodId}>
                        <IconButton
                          size="small"
                          component="span"
                          onClick={(e) => {
                            e.stopPropagation();
                            isFav ? removeFromFavorites(option.foodId) : addToFavorites(option);
                          }}
                        >
                          {isFav ? (
                            <Star fontSize="small" sx={{ color: "warning.main" }} />
                          ) : (
                            <StarBorder fontSize="small" />
                          )}
                        </IconButton>
                        <Box component="span" sx={{ flex: 1, ml: 0.5 }}>
                          {option.nombre}
                          {option.categoria === "no_keto" && (
                            <Typography
                              component="span"
                              variant="caption"
                              color="error"
                              fontWeight={700}
                              sx={{ ml: 1 }}
                            >
                              (no KETO)
                            </Typography>
                          )}
                        </Box>
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <MuiTextField {...params} placeholder="Buscar alimento..." />
                  )}
                />
                <MuiTextField
                  size="small"
                  type="number"
                  placeholder="Cant."
                  value={item.cantidad || ""}
                  onChange={(e) => updateCantidad(index, Number(e.target.value))}
                  inputProps={{ min: 0, step: 1 }}
                  sx={{ flex: 0.8 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 24 }}>
                  {item.unidad}
                </Typography>
                <IconButton size="small" color="error" onClick={() => removeAlimento(index)}>
                  <Delete fontSize="small" />
                </IconButton>
                {fav && <Star fontSize="small" sx={{ color: "warning.main" }} />}
              </Box>
            );
          })}
          <Button startIcon={<Add />} onClick={addEmptyAlimento} size="small" sx={{ mt: 0.5 }}>
            Agregar alimento
          </Button>
        </Box>

        {/* Resumen */}
        {alimentos.length > 0 && (
          <Box
            display="flex"
            justifyContent="space-between"
            sx={{ bgcolor: "grey.50", p: 1.5, borderRadius: 1 }}
          >
            <Typography variant="body2" color="text.secondary">
              {alimentos.length} alimento{alimentos.length !== 1 ? "s" : ""}
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {totalGramos} g totales
            </Typography>
          </Box>
        )}

        {error && (
          <Typography variant="caption" color="error" mt={2} display="block">
            ⚠️ {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={!canSave || saving}
          onClick={() =>
            onSave({
              fechaHora: fechaHora.toISOString(),
              comida,
              nota: nota.trim() || undefined,
              alimentos: alimentos.map((a) => ({ foodId: a.foodId, cantidad: a.cantidad })),
            })
          }
        >
          {saving ? "Guardando..." : "Guardar comida"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
