"use client";
import { useMemo, useState } from "react";
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
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { Controller, useForm } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";

import EmptyState from "@/components/ui/emptystate";
import SectionHeader from "@/components/ui/sectionheader";
import useUserData from "@/hooks/useuserdata";
import { createMeal, deleteMeal } from "@/services/keto/meals.service";
import { MealEntry } from "@/model/keto.models";

interface MealFormModel {
  alimento: string;
  gramos: number | "";
  comida: MealEntry["comida"];
  fechaHora: Dayjs;
}

const COMIDAS: { value: NonNullable<MealEntry["comida"]>; label: string; emoji: string }[] = [
  { value: "desayuno", label: "Desayuno", emoji: "🌅" },
  { value: "almuerzo", label: "Almuerzo", emoji: "☀️" },
  { value: "cena", label: "Cena", emoji: "🌙" },
  { value: "snack", label: "Snack", emoji: "🥜" },
];

/**
 * Registro de alimentación: alimento, gramos y fecha/hora.
 * Los datos se envían al endpoint /meals del backend.
 */
export default function AlimentacionPage() {
  const { meals, loading, error, reload } = useUserData();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<MealFormModel>({
    defaultValues: {
      alimento: "",
      gramos: "",
      comida: "desayuno",
      fechaHora: dayjs(),
    },
  });

  const onSubmit = async (data: MealFormModel) => {
    setSaving(true);
    setSaveError(null);
    try {
      await createMeal({
        userId: "",
        alimento: data.alimento.trim(),
        gramos: Number(data.gramos),
        comida: data.comida,
        fechaHora: data.fechaHora.toISOString(),
      });
      reset({ alimento: "", gramos: "", comida: data.comida, fechaHora: dayjs() });
      setOpen(false);
      reload();
    } catch (err) {
      console.error(err);
      setSaveError(
        "No se pudo guardar el registro (el servidor aún no tiene este servicio activo). Intenta más tarde."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
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

  // Agrupar por día (más reciente primero)
  const groups = useMemo(() => {
    const map = new Map<string, MealEntry[]>();
    for (const meal of meals) {
      const label = dayjs(meal.fechaHora).format("dddd DD [de] MMMM");
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(meal);
    }
    return Array.from(map.entries()).sort((a, b) =>
      dayjs(b[1][0].fechaHora).valueOf() - dayjs(a[1][0].fechaHora).valueOf()
    );
  }, [meals]);

  if (loading && meals.length === 0) {
    return <LinearProgress sx={{ borderRadius: 4 }} />;
  }

  return (
    <Box>
      <SectionHeader
        title="Mi alimentación"
        subtitle="Registra lo que comes para llevar el control keto"
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} size="small">
            Agregar
          </Button>
        }
      />

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
          description='Toca "Agregar" para registrar tu primera comida con sus gramos y hora.'
          actionLabel="Agregar comida"
          onAction={() => setOpen(true)}
        />
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {groups.map(([dia, items]) => (
            <Box key={dia}>
              <Typography variant="subtitle2" fontWeight={700} textTransform="capitalize" mb={1}>
                {dia}
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {items.map((meal) => {
                  const comidaInfo = COMIDAS.find((c) => c.value === meal.comida);
                  return (
                    <Card key={meal.id} elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main" }}>
                      <CardContent sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1.5, "&:last-child": { pb: 1.5 } }}>
                        <Typography fontSize={26}>{comidaInfo?.emoji ?? "🍴"}</Typography>
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
                          onClick={() => handleDelete(meal.id)}
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

      {/* ---------- Diálogo para agregar registro ---------- */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={800}>Nueva comida</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="alimento"
                  control={control}
                  rules={{ required: "Escribe el alimento" }}
                  render={({ field, fieldState }) => (
                    <MuiTextField
                      {...field}
                      label="Alimento"
                      placeholder="Ej: Aguacate, pollo, brócoli…"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="gramos"
                  control={control}
                  rules={{
                    required: "Requerido",
                    validate: (v) => (Number(v) > 0 ? true : "Debe ser mayor a 0"),
                  }}
                  render={({ field, fieldState }) => (
                    <MuiTextField
                      {...field}
                      label="Gramos"
                      type="number"
                      fullWidth
                      inputProps={{ min: 1, step: 1 }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="comida"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Typography variant="caption" color="text.secondary">Tipo</Typography>
                      <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                        {COMIDAS.map((c) => (
                          <Chip
                            key={c.value}
                            label={`${c.emoji} ${c.label}`}
                            clickable
                            color={field.value === c.value ? "primary" : "default"}
                            variant={field.value === c.value ? "filled" : "outlined"}
                            onClick={() => field.onChange(c.value)}
                            size="small"
                          />
                        ))}
                      </Box>
                    </>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="fechaHora"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      label="Fecha y hora"
                      value={field.value}
                      onChange={(v) => field.onChange(v ?? dayjs())}
                      ampm={false}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  )}
                />
              </Grid>
            </Grid>
            {saveError && (
              <Typography variant="caption" color="error" mt={2} display="block">
                ⚠️ {saveError}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpen(false)} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
