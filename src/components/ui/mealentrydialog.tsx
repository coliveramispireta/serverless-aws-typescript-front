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
import { Add, Delete, Remove, Search, Star, StarBorder } from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";

import { FoodItem, FoodCategory } from "@/model/keto.models";
import {
  getFavoriteFoodIds,
  getRecentFoodIds,
  markFoodUsed,
  addToFavorites,
  removeFromFavorites,
} from "@/lib/engine/foodPrefs";
import { CATEGORY_ORDER, CAT_INFO, foodEmoji } from "@/lib/engine/categories";
import {
  defaultServing,
  adjustCantidad,
  stepFor,
  servingMin,
  servingMax,
} from "@/lib/engine/servings";

type MealType = "desayuno" | "almuerzo" | "cena" | "snack";

interface MealAlimento {
  foodId: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  equivalenciaGramos?: number;
  emoji?: string;
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
  const [search, setSearch] = useState("");
  const [openSearchCombo, setOpenSearchCombo] = useState(false);

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setComida("desayuno");
      setFechaHora(dayjs());
      setNota("");
      setAlimentos([]);
      setCatFilter("");
      setSearch("");
      setOpenSearchCombo(false);
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

  const filteredByCat = catFilter
    ? sortedFoods.filter((f) => f.categoria === catFilter)
    : sortedFoods;

  // Buscador de texto: filtra la grilla por nombre (ignora categoría activa si hay texto)
  const filteredFoods = search.trim()
    ? sortedFoods.filter((f) => f.nombre.toLowerCase().includes(search.trim().toLowerCase()))
    : filteredByCat;

  // Categorías presentes en el catálogo, respetando el orden definido
  const categories: FoodItem["categoria"][] = CATEGORY_ORDER.filter(
    (c) => !catFilter || c === catFilter,
  ).filter((c) => foods.some((f) => f.categoria === c));

  const addAlimentoFromFood = (food: FoodItem) => {
    markFoodUsed(food);
    const unidad = food.unidad ?? "g";
    setAlimentos((prev) => [
      ...prev,
      {
        foodId: food.foodId,
        nombre: food.nombre,
        cantidad: defaultServing(unidad),
        unidad,
        equivalenciaGramos: food.equivalenciaGramos,
        emoji: food.emoji,
      },
    ]);
  };

  const updateAlimento = (index: number, food: FoodItem | null) => {
    if (!food) return;
    markFoodUsed(food);
    const unidad = food.unidad ?? "g";
    setAlimentos((prev) =>
      prev.map((a, i) =>
        i === index
          ? {
              ...a,
              foodId: food.foodId,
              nombre: food.nombre,
              unidad,
              equivalenciaGramos: food.equivalenciaGramos,
              emoji: food.emoji,
            }
          : a,
      ),
    );
  };

  const ajustarCantidad = (index: number, delta: number) => {
    setAlimentos((prev) =>
      prev.map((a, i) =>
        i === index
          ? { ...a, cantidad: adjustCantidad(a.unidad as "g" | "und" | "ml", a.cantidad, delta) }
          : a,
      ),
    );
  };

  const removeAlimento = (index: number) => {
    setAlimentos((prev) => prev.filter((_, i) => i !== index));
  };

  const canSave = alimentos.length > 0 && alimentos.every((a) => a.foodId && a.cantidad > 0);

  const gramosDe = (a: MealAlimento): number => {
    if (a.unidad === "und" && a.equivalenciaGramos) {
      return Math.round(a.cantidad * a.equivalenciaGramos);
    }
    return Math.round(a.cantidad);
  };
  const totalGramos = alimentos.reduce((sum, a) => sum + gramosDe(a), 0);

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

        {/* Favoritos y recientes (acceso rápido, 1 clic) */}
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
                      label={`${f.emoji ? f.emoji + " " : ""}${f.nombre}`}
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
                      label={`${f.emoji ? f.emoji + " " : ""}${f.nombre}`}
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

        {/* Selección visual por categoría + buscador */}
        <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>
          Toca un alimento para agregarlo
        </Typography>

        {/* Chips de categoría */}
        {categories.length > 0 && (
          <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5} mb={1}>
            <Chip
              label="😀 Todos"
              size="small"
              clickable
              variant={!catFilter && !search ? "filled" : "outlined"}
              color={!catFilter && !search ? "primary" : "default"}
              onClick={() => {
                setCatFilter("");
                setSearch("");
              }}
            />
            {categories.map((c) => {
              const cat = c as string;
              const info = CAT_INFO[c as FoodCategory];
              const active = catFilter === cat && !search;
              return (
                <Chip
                  key={cat}
                  label={`${info.emoji} ${info.label}`}
                  size="small"
                  clickable
                  variant={active ? "filled" : "outlined"}
                  color={active ? "primary" : cat === "no_keto" ? "error" : "default"}
                  onClick={() => {
                    setSearch("");
                    setCatFilter(catFilter === cat ? "" : cat);
                  }}
                />
              );
            })}
          </Box>
        )}

        {/* Buscador de texto */}
        <MuiTextField
          placeholder="Buscar otro alimento…"
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <Search fontSize="small" sx={{ mr: 1, color: "text.secondary" }} /> }}
          sx={{ mb: 1 }}
        />

        {/* Grilla de alimentos */}
        {filteredFoods.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1,
              maxHeight: 300,
              overflowY: "auto",
              mb: 1.5,
            }}
          >
            {filteredFoods.map((f) => {
              const isFav = favorites.some((x) => x.foodId === f.foodId);
              const isNoKeto = f.categoria === "no_keto";
              return (
                <Box
                  key={f.foodId}
                  onClick={() => addAlimentoFromFood(f)}
                  sx={{
                    border: "1px solid",
                    borderColor: isNoKeto ? "error.light" : "AMSnowGray.main",
                    borderRadius: 3,
                    p: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    cursor: "pointer",
                    position: "relative",
                    "&:active": { bgcolor: "grey.100" },
                  }}
                >
                  <Box sx={{ fontSize: 34, lineHeight: 1.1 }}>{foodEmoji(f.emoji, f.categoria)}</Box>
                  <Typography variant="caption" lineHeight={1.15} mt={0.5} fontWeight={600}>
                    {f.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {f.unidad === "und" && f.equivalenciaGramos
                      ? `1 und ≈ ${f.equivalenciaGramos} g`
                      : f.unidad}
                  </Typography>
                  <IconButton
                    component="span"
                    aria-label={isFav ? `Quitar ${f.nombre} de favoritos` : `Agregar ${f.nombre} a favoritos`}
                    onClick={(e) => {
                      e.stopPropagation();
                      isFav ? removeFromFavorites(f.foodId) : addToFavorites(f);
                    }}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      p: 0.75,
                      bgcolor: isFav ? "rgba(255, 193, 7, 0.12)" : "background.paper",
                      border: "1px solid",
                      borderColor: "AMSnowGray.main",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    {isFav ? (
                      <Star sx={{ color: "warning.main" }} />
                    ) : (
                      <StarBorder sx={{ color: "text.secondary" }} />
                    )}
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
            No hay alimentos para esta búsqueda.
          </Typography>
        )}

        {/* Botón secundario: Autocomplete para búsqueda libre */}
        <Button
          startIcon={<Search />}
          size="small"
          sx={{ mb: 1.5 }}
          onClick={() => setOpenSearchCombo((v) => !v)}
        >
          {openSearchCombo ? "Ocultar búsqueda" : "Buscar otro…"}
        </Button>
        {openSearchCombo && (
          <Autocomplete
            options={sortedFoods}
            getOptionLabel={(o) => o.nombre}
            isOptionEqualToValue={(o, v) => o.foodId === v.foodId}
            onChange={(_, newValue) => {
              if (newValue) {
                addAlimentoFromFood(newValue);
                setOpenSearchCombo(false);
              }
            }}
            size="small"
            sx={{ mb: 1.5 }}
            renderOption={(props, option) => {
              const isFav = favorites.some((f) => f.foodId === option.foodId);
              return (
                <li {...props} key={option.foodId}>
                  <Box component="span" sx={{ flex: 1, ml: 0.5 }}>
                    {option.emoji ? option.emoji + " " : ""}
                    {option.nombre}
                    {option.categoria === "no_keto" && (
                      <Typography component="span" variant="caption" color="error" fontWeight={700} sx={{ ml: 1 }}>
                        (no KETO)
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    component="span"
                    onClick={(e) => {
                      e.stopPropagation();
                      isFav
                        ? removeFromFavorites(option.foodId)
                        : addToFavorites(option);
                    }}
                  >
                    {isFav ? (
                      <Star fontSize="small" sx={{ color: "warning.main" }} />
                    ) : (
                      <StarBorder fontSize="small" />
                    )}
                  </IconButton>
                </li>
              );
            }}
            renderInput={(params) => (
              <MuiTextField {...params} placeholder="Buscar alimento por nombre…" />
            )}
          />
        )}

        {/* Lista de alimentos agregados con botones +/− */}
        {alimentos.length > 0 && (
          <Box mb={1.5}>
            <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
              Tu comida
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {alimentos.map((item, index) => {
                const unidad = item.unidad as "g" | "und" | "ml";
                const step = stepFor(unidad);
                const minHit = item.cantidad <= servingMin(unidad);
                const maxHit = item.cantidad >= servingMax(unidad);
                return (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      border: "1px solid",
                      borderColor: "AMSnowGray.main",
                      borderRadius: 3,
                      p: 0.75,
                      pr: 1,
                    }}
                  >
                    <Box sx={{ fontSize: 26 }}>{foodEmoji(item.emoji)}</Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {item.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.unidad}
                        {item.unidad === "und" && item.equivalenciaGramos
                          ? ` · ≈ ${Math.round(item.cantidad * item.equivalenciaGramos)} g`
                          : ""}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0}>
                      <IconButton
                        size="small"
                        sx={{ p: 0.75 }}
                        onClick={() => ajustarCantidad(index, -step)}
                        disabled={minHit}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        sx={{ minWidth: 40, textAlign: "center" }}
                      >
                        {item.cantidad}
                      </Typography>
                      <IconButton
                        size="small"
                        sx={{ p: 0.75 }}
                        onClick={() => ajustarCantidad(index, step)}
                        disabled={maxHit}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => removeAlimento(index)}
                      color="error"
                      aria-label={`Quitar ${item.nombre}`}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              Toque +/− para ajustar. Total {totalGramos} g.
            </Typography>
          </Box>
        )}

        {/* Resumen */}
        {alimentos.length > 0 && (
          <Box display="flex" justifyContent="space-between" sx={{ bgcolor: "grey.50", p: 1.5, borderRadius: 1 }}>
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
