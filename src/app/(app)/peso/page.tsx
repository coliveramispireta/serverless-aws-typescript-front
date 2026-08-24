"use client";
import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
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
import { Add, Delete, PhotoCamera } from "@mui/icons-material";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";

import EmptyState from "@/components/ui/emptystate";
import SectionHeader from "@/components/ui/sectionheader";
import WeightChart from "@/components/ui/weightchart";
import useUserData from "@/hooks/useuserdata";
import {
  createWeight,
  deleteWeight,
  requestEvidenceUploadUrl,
} from "@/services/keto/weights.service";
import { WeightEntry } from "@/model/keto.models";
import { getProfilePrefs } from "@/lib/profileprefs";
import { getUserInfo } from "@/services/xstorage.cross.service";

interface WeightFormModel {
  pesoKg: number | "";
  nota: string;
}

/**
 * Registro de peso con evidencia fotográfica opcional y evolución.
 * La foto se adjunta al endpoint /weights/{id}/evidence del backend.
 */
export default function PesoPage() {
  const userInfo = getUserInfo();
  const prefs = getProfilePrefs();
  const { weights, loading, error, reload } = useUserData();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  // Archivo seleccionado + vista previa local (dataURL)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<WeightFormModel>({
    defaultValues: { pesoKg: "", nota: "" },
  });

  const ordered = useMemo(
    () =>
      [...weights].sort(
        (a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
      ),
    [weights]
  );

  const onFileSelected = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) {
      setSelectedFile(null);
      setPhotoPreview(null);
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  /** Sube la evidencia con la URL prefirmada; no bloquea el registro del peso */
  const uploadEvidence = async (weightId: string, file: File): Promise<void> => {
    const { uploadUrl } = await requestEvidenceUploadUrl(weightId, file.name, file.type);
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
  };

  const onSubmit = async (data: WeightFormModel) => {
    setSaving(true);
    setSaveError(null);
    setSaveWarning(null);
    try {
      const created = await createWeight({
        userId: "",
        fechaHora: new Date().toISOString(),
        pesoKg: Number(data.pesoKg),
        nota: data.nota.trim() || undefined,
      });

      // Evidencia fotográfica opcional
      if (selectedFile && created?.id) {
        try {
          await uploadEvidence(created.id, selectedFile);
        } catch (uploadErr) {
          console.error("evidence upload:", uploadErr);
          setSaveWarning(
            "El peso se registró, pero la foto no pudo subirse. Puedes intentarlo de nuevo más tarde."
          );
        }
      }

      reset({ pesoKg: "", nota: "" });
      setSelectedFile(null);
      setPhotoPreview(null);
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
      await deleteWeight(id);
      reload();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && weights.length === 0) {
    return <LinearProgress sx={{ borderRadius: 4 }} />;
  }

  return (
    <Box>
      <SectionHeader
        title="Mi peso"
        subtitle="Pésate a la misma hora, en ayunas, para comparar mejor"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSaveError(null);
              setSaveWarning(null);
              setOpen(true);
            }}
            size="small"
          >
            Registrar
          </Button>
        }
      />

      {/* Gráfica siempre visible */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main", mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <WeightChart weights={weights} targetWeight={prefs.pesoObjetivoKg} />
        </CardContent>
      </Card>

      {error ? (
        <EmptyState emoji="📡" title="Sin conexión" description={error} actionLabel="Reintentar" onAction={reload} />
      ) : ordered.length === 0 ? (
        <EmptyState
          emoji="⚖️"
          title="Aún no registras tu peso"
          description='Toca "Registrar" para añadir tu primer peso y, si quieres, una foto de la báscula como evidencia.'
          actionLabel="Registrar peso"
          onAction={() => setOpen(true)}
        />
      ) : (
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="subtitle2" fontWeight={700}>
            Historial
          </Typography>
          {ordered.map((w) => (
            <Card key={w.id} elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main" }}>
              <CardContent sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography fontSize={26}>⚖️</Typography>
                <Box flex={1} minWidth={0}>
                  <Typography fontWeight={700}>{w.pesoKg} kg</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(w.fechaHora).format("DD/MM/YYYY HH:mm")}
                    {w.evidenciaFotoUrl ? " · 📸 con evidencia" : ""}
                  </Typography>
                  {w.nota && (
                    <Typography variant="caption" display="block" color="text.secondary" noWrap>
                      {w.nota}
                    </Typography>
                  )}
                </Box>
                {w.evidenciaFotoUrl && (
                  <Box
                    component="img"
                    src={w.evidenciaFotoUrl}
                    alt={`Evidencia ${w.pesoKg} kg`}
                    sx={{
                      width: 48,
                      height: 48,
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "AMSnowGray.main",
                      cursor: "pointer",
                    }}
                    onClick={() => window.open(w.evidenciaFotoUrl, "_blank")}
                  />
                )}
                <IconButton
                  size="small"
                  color="error"
                  disabled={deletingId === w.id}
                  onClick={() => handleDelete(w.id)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* ---------- Diálogo registrar peso ---------- */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={800}>Registrar peso</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="pesoKg"
                  control={control}
                  rules={{
                    required: "Ingresa tu peso",
                    validate: (v) => (Number(v) > 0 ? true : "Debe ser mayor a 0"),
                  }}
                  render={({ field, fieldState }) => (
                    <MuiTextField
                      {...field}
                      label="Peso (kg)"
                      type="number"
                      fullWidth
                      inputProps={{ min: 20, max: 400, step: 0.1 }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message ?? (userInfo.email ? "" : "")}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" component="label" startIcon={<PhotoCamera />} fullWidth>
                  Adjuntar foto de evidencia (opcional)
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => onFileSelected(e.target.files?.[0])}
                  />
                </Button>
                {photoPreview && (
                  <Box mt={1.5} textAlign="center">
                    <Box
                      component="img"
                      src={photoPreview}
                      alt="Evidencia seleccionada"
                      sx={{ maxHeight: 180, borderRadius: 3, border: "1px solid", borderColor: "AMSnowGray.main" }}
                    />
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="nota"
                  control={control}
                  render={({ field }) => (
                    <MuiTextField {...field} label="Nota (opcional)" fullWidth multiline minRows={2} />
                  )}
                />
              </Grid>
            </Grid>
            {saveError && (
              <Typography variant="caption" color="error" mt={2} display="block">
                ⚠️ {saveError}
              </Typography>
            )}
            {saveWarning && (
              <Typography variant="caption" color="warning.dark" mt={1} display="block">
                ⚠️ {saveWarning}
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
