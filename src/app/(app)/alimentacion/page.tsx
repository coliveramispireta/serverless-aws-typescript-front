"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Fab,
  IconButton,
  LinearProgress,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { Add, Delete, UploadFile, WaterDrop } from "@mui/icons-material";
import dayjs from "dayjs";

import EmptyState from "@/components/ui/emptystate";
import SectionHeader from "@/components/ui/sectionheader";
import MealEntryDialog from "@/components/ui/mealentrydialog";
import WaterIntakeControl from "@/components/ui/waterintakecontrol";
import UserImportDialog from "@/components/ui/userimportdialog";
import useUserData from "@/hooks/useuserdata";
import { createMealBlock, deleteMeal } from "@/services/keto/meals.service";
import { listFoods } from "@/services/keto/foods.service";
import { listLiquids, createLiquid, deleteLiquid } from "@/services/keto/liquids.service";
import { MealEntry, FoodItem, LiquidEntry } from "@/model/keto.models";

type MealType = "desayuno" | "almuerzo" | "cena" | "snack";

// ─── Constantes ───────────────────────────────────────────────

const COMIDAS: { value: MealType; label: string; emoji: string }[] = [
  { value: "desayuno", label: "Desayuno", emoji: "🌅" },
  { value: "almuerzo", label: "Almuerzo", emoji: "☀️" },
  { value: "cena", label: "Cena", emoji: "🌙" },
  { value: "snack", label: "Snack", emoji: "🥜" },
];

// ─── Componente ───────────────────────────────────────────────

export default function AlimentacionPage() {
  const { meals, loading, error, reload } = useUserData();
  const [tab, setTab] = useState(0);

  // ─── Estado: Comidas ───
  const [openMeal, setOpenMeal] = useState(false);
  const [savingMeal, setSavingMeal] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ─── Estado: Catálogo ───
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [foodsLoaded, setFoodsLoaded] = useState(false);

  // ─── Estado: Líquidos ───
  const [liquids, setLiquids] = useState<LiquidEntry[]>([]);
  const [liquidsLoading, setLiquidsLoading] = useState(false);
  const [savingLiquid, setSavingLiquid] = useState(false);
  // Ronda actual del control gota (se reinicia al montar); sirve de tope visual de 3L
  const [roundMl, setRoundMl] = useState(0);

  // ─── Estado: Import / ponerse al día ───
  const [openImport, setOpenImport] = useState(false);

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

  // Cargar líquidos de HOY (filtro por día LOCAL en el cliente; el backend guarda UTC)
  const loadLiquids = useCallback(() => {
    if (tab !== 1) return;
    setLiquidsLoading(true);
    const hoy = dayjs();
    listLiquids()
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setLiquids(
          arr.filter((l) => {
            const d = dayjs(l.fechaHora);
            return d.isValid() && d.isSame(hoy, "day");
          })
        );
      })
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

  // ─── Líquidos: total del día ───
  const totalMl = useMemo(
    () => liquids.reduce((sum, l) => sum + l.cantidadMl, 0),
    [liquids],
  );

  // ─── Handlers: Comidas ───
  const handleSaveMeal = async (payload: {
    fechaHora: string;
    comida: MealType;
    nota?: string;
    alimentos: Array<{ foodId: string; cantidad: number }>;
  }) => {
    setSavingMeal(true);
    setSaveError(null);
    try {
      await createMealBlock({
        fechaHora: payload.fechaHora,
        comida: payload.comida,
        nota: payload.nota,
        alimentos: payload.alimentos,
      });
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
  const handleAddLiquid = async (
    ml: number,
    opts?: { fechaHora?: string; nota?: string },
  ) => {
    setSavingLiquid(true);
    try {
      await createLiquid(ml, opts);
      setRoundMl((r) => r + ml);
      loadLiquids();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingLiquid(false);
    }
  };

  const handleRemoveLastLiquid = async () => {
    if (liquids.length === 0) return;
    const last = [...liquids].sort(
      (a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime(),
    )[0];
    setSavingLiquid(true);
    try {
      await deleteLiquid(last.id);
      setRoundMl((r) => Math.max(0, r - last.cantidadMl));
      loadLiquids();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingLiquid(false);
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

      {/* Botón "Ponerme al día" (import comidas+agua, sin pesos) */}
      <Box display="flex" justifyContent="flex-start" mb={1}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<UploadFile />}
          onClick={() => setOpenImport(true)}
        >
          Ponerme al día (importar días atrasados)
        </Button>
      </Box>

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
              description='Toca "+" para registrar tu primera comida, o usa "Ponerme al día" para cargar días atrasados.'
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
                                {meal.nota ? ` · 📝 ${meal.nota}` : ""}
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
          {/* Control gota +/− */}
          <WaterIntakeControl
            roundMl={roundMl}
            saving={savingLiquid}
            onCreate={handleAddLiquid}
            onRemoveLast={handleRemoveLastLiquid}
            canRemoveLast={liquids.length > 0}
          />

          {/* Resumen del día */}
          <Card
            elevation={0}
            sx={{ border: "1px solid", borderColor: "info.main", mb: 2, textAlign: "center", py: 2 }}
          >
            <Typography variant="h5" fontWeight={800} color="info.main">
              {totalMl} ml
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de hoy · {liquids.length} registro{liquids.length !== 1 ? "s" : ""}
            </Typography>
          </Card>

          {/* Lista de registros de hoy */}
          <Typography variant="caption" color="text.secondary" mb={1} display="block">
            Registros de hoy
          </Typography>
          {liquidsLoading ? (
            <LinearProgress sx={{ borderRadius: 4 }} />
          ) : liquids.length === 0 ? (
            <EmptyState
              emoji="💧"
              title="Sin registros de hidratación hoy"
              description='Usa la gota de arriba: toca "+" para agregar agua. También puedes elegir fecha/hora pasada para ponerte al día.'
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
                        <Typography fontWeight={700}>
                          {l.cantidadMl >= 1000
                            ? `${l.cantidadMl / 1000} L`
                            : `${l.cantidadMl} ml`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(l.fechaHora).format("HH:mm")}
                          {l.nota ? ` · 📝 ${l.nota}` : ""}
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

      {/* ─── Diálogo: Nueva comida ─── */}
      <MealEntryDialog
        open={openMeal}
        foods={foods}
        saving={savingMeal}
        error={saveError}
        onClose={() => {
          setOpenMeal(false);
          setSaveError(null);
        }}
        onSave={handleSaveMeal}
      />

      {/* ─── Diálogo: Ponerme al día (import) ─── */}
      <UserImportDialog
        open={openImport}
        onClose={() => setOpenImport(false)}
        onImported={() => {
          reload();
          loadLiquids();
        }}
      />
    </Box>
  );
}
