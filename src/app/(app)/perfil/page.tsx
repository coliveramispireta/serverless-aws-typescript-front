"use client";
import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";
import { School, Logout } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";

import SectionHeader from "@/components/ui/sectionheader";
import { buildLocalUserProfile, getProfilePrefs, saveProfilePrefs, ProfilePrefs } from "@/lib/profileprefs";
import { isCoachEmail } from "@/lib/auth/roles";
import { getProfile, updateProfile } from "@/services/keto/profile.service";
import { cleanData } from "@/services/xstorage.cross.service";

/**
 * Perfil personal: datos de sesión + preferencias (altura y peso objetivo)
 * que alimentan las métricas automáticas del dashboard.
 * Se sincroniza con el backend (/profile) con respaldo en localStorage.
 */
export default function PerfilPage() {
  const router = useRouter();
  const profile = buildLocalUserProfile();
  const [prefs, setPrefs] = useState<ProfilePrefs>(getProfilePrefs());
  const [saved, setSaved] = useState(false);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const coach = isCoachEmail(profile.email);

  // Cargar perfil desde el backend (si está disponible)
  useEffect(() => {
    getProfile()
      .then((p) => {
        setPrefs((prev) => ({
          ...prev,
          alturaCm: p.alturaCm ?? prev.alturaCm,
          pesoObjetivoKg: p.pesoObjetivoKg ?? prev.pesoObjetivoKg,
        }));
      })
      .catch(() => {
        // Sin conexión: se conservan las preferencias locales
      });
  }, []);

  const handleChange = (field: keyof ProfilePrefs, value: string) => {
    const num = value === "" ? undefined : Number(value);
    setPrefs((prev) => ({ ...prev, [field]: num }));
    setSaved(false);
  };

  const handleSave = async () => {
    // Respaldo local inmediato
    saveProfilePrefs(prefs);
    try {
      await updateProfile({ alturaCm: prefs.alturaCm, pesoObjetivoKg: prefs.pesoObjetivoKg });
      setSaved(true);
      setSaveNote(null);
    } catch {
      setSaved(true);
      setSaveNote("Guardado localmente (el servicio aún no responde).");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // limpiar sesión local aunque falle el remoto
    }
    cleanData();
    router.push("/login");
  };

  return (
    <Box>
      <SectionHeader title="Mi perfil" />

      {/* Datos de sesión */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main", mb: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar src={profile.fotoUrl || undefined} sx={{ width: 64, height: 64, bgcolor: "primary.main", fontSize: 28 }}>
              {profile.nombre?.charAt(0)?.toUpperCase() || "?"}
            </Avatar>
            <Box minWidth={0}>
              <Typography variant="h6" fontWeight={800} noWrap>
                {profile.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {profile.email}
              </Typography>
              {coach && (
                <Chip
                  icon={<School />}
                  label="Coach"
                  color="secondary"
                  size="small"
                  sx={{ mt: 0.5, fontWeight: 700 }}
                />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Preferencias para métricas */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main", mb: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
            Mis datos para las métricas
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            Se usan para calcular tu IMC y tu progreso hacia la meta.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <MuiTextField
                label="Altura (cm)"
                type="number"
                fullWidth
                inputProps={{ min: 100, max: 230 }}
                value={prefs.alturaCm ?? ""}
                onChange={(e) => handleChange("alturaCm", e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <MuiTextField
                label="Peso objetivo (kg)"
                type="number"
                fullWidth
                inputProps={{ min: 30, max: 300, step: 0.1 }}
                value={prefs.pesoObjetivoKg ?? ""}
                onChange={(e) => handleChange("pesoObjetivoKg", e.target.value)}
              />
            </Grid>
          </Grid>
          <Button variant="contained" onClick={handleSave} sx={{ mt: 2 }} fullWidth>
            {saved ? "✓ Guardado" : "Guardar"}
          </Button>
          {saveNote && (
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
              {saveNote}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 2 }} />

      <Button
        variant="outlined"
        color="error"
        startIcon={<Logout />}
        onClick={handleLogout}
        fullWidth
      >
        Cerrar sesión
      </Button>
    </Box>
  );
}
