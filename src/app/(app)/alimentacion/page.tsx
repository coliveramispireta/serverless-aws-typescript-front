"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
  LinearProgress,
  Tab,
  Tabs,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";
import { Add, Delete, WaterDrop } from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";

import EmptyState from "@/components/ui/emptystate";
import SectionHeader from "@/components/ui/sectionheader";
import useUserData from "@/hooks/useuserdata";
import { createMealBlock, deleteMeal } from "@/services/keto/meals.service";
import { listFoods } from "@/services/keto/foods.service";
import {
  listLiquids,
  createLiquid,
  deleteLiquid,
} from "@/services/keto/liquids.service";
import { MealEntry, FoodItem, LiquidEntry } from "@/model/keto.models";

// ─── Constantes ───────────────────────────────────────────────

const COMIDAS: { value: NonNullable<MealEntry["comida"]>; label: string; emoji: string }[] = [
  { value: "desayuno", label: "Desayuno", emoji: "🌅" },
  { value: "almuerzo", label: "Almuerzo", emoji: "☀️" },
  { value: "cena", label: "Cena", emoji: "🌙" },
  { value: "snack", label: "Snack", emoji: "🥜" },
];

const QUICK_LIQUIDS = [250, 500, 750, 1000];

// ─── Tipos ────────────────────────────────────────────────────

interface MealAlimento {
  foodId: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  equivalenciaGramos?: number;
}

// ─── Componente ───────────────────────────────────────────────

export default function AlimentacionPage() {
  const { meals, loading, error, reload } = useUserData();
  const [tab, setTab] = useState(0);

  // ─── Estado: Comidas ───
  const [openMeal, setOpenMeal] = useState(false);
  const [savingMeal, setSavingMeal] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [comida, setComida] = useState<NonNullable<MealEntry["comida"]>>("desayuno");
  const [fechaHora, setFechaHora] = useState<Dayjs>(dayjs());
  const [alimentos, setAlimentos] = useState<MealAlimento[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ─── Estado: Catálogo ───
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [foodsLoaded, setFoodsLoaded] = useState(false);

  // ─── Estado: Líquidos ───
  const [liquids, setLiquids] = useState<LiquidEntry[]>([]);
  const [liquidsLoading, setLiquidsLoading] = useState(false);
  const [addingLiquid, setAddingLiquid] = useState(false);

  // Cargar catálogo al abrir modal de comida
  useEffect(() => {
    if (openMeal && !foodsLoaded) {
      listFoods()
        .then((data) => {
          setFoods(Array.isArray(data) ? data : []);
          setFoodsLoaded(true);
        })
        .catch(() => setFoods([]));
    }
  }, [openMeal, foodsLoaded]);

  // Catálogo ordenado: keto primero (alfabético) y "no KETO" al final
  const sortedFoods = useMemo(() => {
    const keto: FoodItem[] = [];
    const nonKeto: FoodItem[] = [];
    for (const f of foods) {
      (f.categoria === "no_keto" ? nonKeto : keto).push(f);
    }
    const byName = (a: FoodItem, b: FoodItem) => a.nombre.localeCompare(b.nombre, "es");
    return [...keto.sort(byName), ...nonKeto.sort(byName)];
  }, [foods]);

  // Cargar líquidos al cambiar a pestaña 1
  const loadLiquids = useCallback(() => {
    if (tab !== 1) return;
    setLiquidsLoading(true);
    const hoy = dayjs().format("YYYY-MM-DD");
    listLiquids(hoy)
      .then((data) => setLiquids(Array.isArray(data) ? data : []))
      .catch(() => setLiquids([]))
      .finally(() => setLiquidsLoading(false));
  }, [tab]);

  useEffect(loadLiquids, [loadLiquids]);

  // ─── Comidas: agrupar por día ───
  const groups = useMemo(() => {
    const map = new Map<string, MealEntry[]>();
    for (const meal of meals) {
      const label = dayjs(meal.fechaHora).format("dddd DD [de] MMMM");
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(meal);
    }
    return Array.from(map.entries()).sort((a, b) =>
      dayjs(b[1][0].fechaHora).valueOf() - dayjs(a[1][0].fechaHora).valueOf(),
    );
  }, [meals]);

  // ─── Comidas: totales ───
  const totalGramos = useMemo(
    () => alimentos.reduce((sum, a) => {
      if (a.unidad === "und" && a.equivalenciaGramos) {
        return sum + Math.round(a.cantidad * a.equivalenciaGramos);
      }
      return sum + Math.round(a.cantidad);
    }, 0),
    [alimentos],
  );

  // ─── Líquidos: total del día ───
  const totalMl = useMemo(
    () => liquids.reduce((sum, l) => sum + l.cantidadMl, 0),
    [liquids],
  );

  // ─── Handlers: Comidas ───
  const addAlimento = () => {
    setAlimentos((prev) => [
      ...prev,
      { foodId: "", nombre: "", cantidad: 0, unidad: "g" },
    ]);
  };

  const updateAlimento = (index: number, food: FoodItem | null) => {
    if (!food) return;
    setAlimentos((prev) =>
      prev.map((a, i) =>
        i === index
          ? { ...a, foodId: food.foodId, nombre: food.nombre, unidad: food.unidad, equivalenciaGramos: food.equivalenciaGramos }
          : a,
      ),
    );
  };

  const updateCantidad = (index: number, cantidad: number) => {
    setAlimentos((prev) =>
      prev.map((a, i) => (i === index ? { ...a, cantidad } : a)),
    );
  };

  const removeAlimento = (index: number) => {
    setAlimentos((prev) => prev.filter((_, i) => i !== index));
  };

  const canSaveMeal =
    alimentos.length > 0 &&
    alimentos.every((a) => a.foodId && a.cantidad > 0);

  const handleSaveMeal = async () => {
    setSavingMeal(true);
    setSaveError(null);
    try {
      await createMealBlock({
        fechaHora: fechaHora.toISOString(),
        comida,
        alimentos: alimentos.map((a) => ({
          foodId: a.foodId,
          cantidad: a.cantidad,
        })),
      });
      // Reset
      setAlimentos([]);
      setComida("desayuno");
      setFechaHora(dayjs());
      setOpenMeal(false);
      reload();
    } catch (err) {
      console.error(err);
      setSaveError("No se pudo guardar la comida. Intenta más tarde.");
    } finally {
      setSavingMeal(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteMeal(id);
      reload();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Handlers: Líquidos ───
  const handleAddLiquid = async (ml: number) => {
    setAddingLiquid(true);
    try {
      await createLiquid(ml);
      loadLiquids();
    } catch (err) {
      console.error(err);
    } finally {
      setAddingLiquid(false);
    }
  };

  const handleDeleteLiquid = async (id: string) => {
    try {
      await deleteLiquid(id);
      loadLiquids();
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Render ─────────────────────────────────────────────────

  if (loading && meals.length === 0) {
    return <LinearProgress sx={{ borderRadius: 4 }} />;
  }

  return (
    <Box>
      <SectionHeader
        title="Mi alimentación"
        subtitle="Registra lo que comes y bebes para llevar el control keto"
      />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, "& .MuiTab-root": { minHeight: 44, fontSize: 13 } }}
      >
        <Tab label="🍽️ Comidas" />
        <Tab
          label={
            <Box display="flex" alignItems="center" gap={0.5}>
              💧 Líquidos
              {totalMl > 0 && (
                <Chip
                  label={`${totalMl} ml`}
                  size="small"
                  color="info"
                  sx={{ height: 20, fontSize: "0.65rem" }}
                />
              )}
            </Box>
          }
        />
      </Tabs>

      {/* ─── Pestaña: Comidas ─── */}
      {tab === 0 && (
        <>
          {error ? (
            <EmptyState
              emoji="📡"
              title="Sin conexión"
              description={error}
              actionLabel="Reintentar"
              onAction={reload}
            />
          ) : groups.length === 0 ? (
            <EmptyState
              emoji="🍽️"
              title="Aún no registras alimentos"
              description='Toca "+" para registrar tu primera comida.'
              actionLabel="Agregar comida"
              onAction={() => setOpenMeal(true)}
            />
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {groups.map(([dia, items]) => (
                <Box key={dia}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    textTransform="capitalize"
                    mb={1}
                  >
                    {dia}
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {items.map((meal) => {
                      const comidaInfo = COMIDAS.find((c) => c.value === meal.comida);
                      return (
                        <Card
                          key={meal.id}
                          elevation={0}
                          sx={{ border: "1px solid", borderColor: "AMSnowGray.main" }}
                        >
                          <CardContent
                            sx={{
                              p: 1.5,
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              "&:last-child": { pb: 1.5 },
                            }}
                          >
                            <Typography fontSize={26}>
                              {comidaInfo?.emoji ?? "🍴"}
                            </Typography>
                            <Box flex={1} minWidth={0}>
                              <Typography fontWeight={700} noWrap>
                                {meal.alimento}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {meal.gramos} g · {dayjs(meal.fechaHora).format("HH:mm")}
                                {comidaInfo ? ` · ${comidaInfo.label.toLowerCase()}` : ""}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={deletingId === meal.id}
                              onClick={() => handleDeleteMeal(meal.id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          <Fab
            color="primary"
            aria-label="Nueva comida"
            sx={{ position: "fixed", bottom: 80, right: 20, zIndex: 1100 }}
            onClick={() => setOpenMeal(true)}
          >
            <Add />
          </Fab>
        </>
      )}

      {/* ─── Pestaña: Líquidos ─── */}
      {tab === 1 && (
        <Box>
          {/* Resumen del día */}
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "info.main",
              mb: 2,
              textAlign: "center",
              py: 3,
            }}
          >
            <WaterDrop sx={{ fontSize: 40, color: "info.main", mb: 0.5 }} />
            <Typography variant="h4" fontWeight={800} color="info.main">
              {totalMl} ml
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de hoy · {liquids.length} registro{liquids.length !== 1 ? "s" : ""}
            </Typography>
          </Card>

          {/* Botones de acceso rápido */}
          <Typography variant="caption" color="text.secondary" mb={1} display="block">
            Registro rápido:
          </Typography>
          <Box display="flex" gap={1} mb={2} flexWrap="wrap">
            {QUICK_LIQUIDS.map((ml) => (
              <Button
                key={ml}
                variant="outlined"
                size="small"
                disabled={addingLiquid}
                onClick={() => handleAddLiquid(ml)}
              >
                {ml >= 1000 ? `${ml / 1000} L` : `${ml} ml`}
              </Button>
            ))}
          </Box>

          {/* Lista de registros */}
          {liquidsLoading ? (
            <LinearProgress sx={{ borderRadius: 4 }} />
          ) : liquids.length === 0 ? (
            <EmptyState
              emoji="💧"
              title="Sin registros de hidratación"
              description="Usa los botones de arriba para registrar cuánto has bebido hoy."
            />
          ) : (
            <Box display="flex" flexDirection="column" gap={1}>
              {[...liquids]
                .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime())
                .map((l) => (
                  <Card
                    key={l.id}
                    elevation={0}
                    sx={{ border: "1px solid", borderColor: "AMSnowGray.main" }}
                  >
                    <CardContent
                      sx={{
                        p: 1.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        "&:last-child": { pb: 1.5 },
                      }}
                    >
                      <WaterDrop sx={{ color: "info.main" }} />
                      <Box flex={1}>
                        <Typography fontWeight={700}>{l.cantidadMl} ml</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(l.fechaHora).format("HH:mm")}
                          {l.nota ? ` · ${l.nota}` : ""}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteLiquid(l.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </CardContent>
                  </Card>
                ))}
            </Box>
          )}
        </Box>
      )}

      {/* ─── Modal: Nueva comida ─── */}
      <Dialog open={openMeal} onClose={() => setOpenMeal(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={800}>Nueva comida</DialogTitle>
        <DialogContent>
          {/* Tipo de comida */}
          <Typography variant="caption" color="text.secondary">
            Tipo
          </Typography>
          <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5} mb={2}>
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

          {/* Fecha y hora */}
          <Box mb={2}>
            <DateTimePicker
              label="Fecha y hora"
              value={fechaHora}
              onChange={(v) => setFechaHora(v ?? dayjs())}
              ampm={false}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </Box>

          {/* Lista de alimentos */}
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            Alimentos
          </Typography>
          <Box mt={0.5} mb={1}>
            {alimentos.map((item, index) => (
              <Box key={index} display="flex" gap={1} alignItems="center" mb={1}>
                <Autocomplete
                  options={sortedFoods}
                  getOptionLabel={(o) => o.nombre}
                  isOptionEqualToValue={(o, v) => o.foodId === v.foodId}
                  value={foods.find((f) => f.foodId === item.foodId) ?? null}
                  onChange={(_, newValue) => updateAlimento(index, newValue)}
                  size="small"
                  sx={{ flex: 2 }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.foodId}>
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
                    </li>
                  )}
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
              </Box>
            ))}
            <Button
              startIcon={<Add />}
              onClick={addAlimento}
              size="small"
              sx={{ mt: 0.5 }}
            >
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

          {saveError && (
            <Typography variant="caption" color="error" mt={2} display="block">
              ⚠️ {saveError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setOpenMeal(false);
              setAlimentos([]);
              setSaveError(null);
            }}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!canSaveMeal || savingMeal}
            onClick={handleSaveMeal}
          >
            {savingMeal ? "Guardando..." : "Guardar comida"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
