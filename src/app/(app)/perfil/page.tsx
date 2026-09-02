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
  FormControlLabel,
  Grid,
  Switch,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";
import { School, Logout, NotificationsActive } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";

import SectionHeader from "@/components/ui/sectionheader";
import usePush from "@/hooks/usepush";
import dayjs from "dayjs";
import { buildLocalUserProfile, getProfilePrefs, saveProfilePrefs, ProfilePrefs } from "@/lib/profileprefs";
import { isCoachEmail } from "@/lib/auth/roles";
import { normalizeAlturaCm } from "@/lib/engine/metrics";
import { getProfile, updateProfile } from "@/services/keto/profile.service";
import { listRecommendations, markRecommendationRead } from "@/services/keto/engagement.service";
import type { Recommendation } from "@/model/keto.models";
import { cleanData, getUserInfo } from "@/services/xstorage.cross.service";

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
  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const coach = isCoachEmail(profile.email);
  const push = usePush();
  const [testResult, setTestResult] = useState<string | null>(null);

  // Recomendaciones del coach (historial personalizado)
  const userInfo = getUserInfo();
  const [myRecs, setMyRecs] = useState<Recommendation[]>([]);
  useEffect(() => {
    if (!userInfo.id) return;
    let active = true;
    listRecommendations()
      .then((recs) => {
        if (active) {
          const mine = Array.isArray(recs)
            ? recs.filter((r) => r.destinatarioUserId === userInfo.id)
            : [];
          setMyRecs(mine);
        }
      })
      .catch(() => {
        // Sin servicio: se omite la sección
      });
    return () => {
      active = false;
    };
  }, [userInfo.id]);

  const markProfileRead = async (id: string) => {
    try {
      await markRecommendationRead(id, true);
      setMyRecs((prev) => prev.map((r) => (r.id === id ? { ...r, leida: true } : r)));
    } catch {
      // silencioso
    }
  };

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
    if (saving) return;
    // Normaliza la altura (admite cm o metros: 1.70 → 170) antes de guardar
    const alturaCm = normalizeAlturaCm(prefs.alturaCm);
    const converted =
      prefs.alturaCm != null && alturaCm != null && prefs.alturaCm !== alturaCm;
    const next: ProfilePrefs = { ...prefs, alturaCm };
    setPrefs(next);
    setSaving(true);
    try {
      await updateProfile({ alturaCm, pesoObjetivoKg: prefs.pesoObjetivoKg });
      // Solo se persiste en localStorage cuando el backend guardó OK:
      // así no queda un valor que "parece guardado" pero el coach no tiene.
      saveProfilePrefs(next);
      setSaved(true);
      setSaveNote(
        converted ? "Guardado. Convertimos tu altura a centímetros (ej. 170)." : null
      );
    } catch {
      setSaved(false);
      setSaveNote(
        converted
          ? "⚠️ No se guardó: convertimos tu altura a cm, pero el servicio no respondió. Vuelve a intentarlo."
          : "⚠️ No se guardó: el servicio no respondió. Vuelve a intentarlo."
      );
    } finally {
      setSaving(false);
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
                inputProps={{ min: 100, max: 230, step: 1 }}
                helperText="En centímetros (ej. 170), no metros"
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
          <Button variant="contained" onClick={handleSave} sx={{ mt: 2 }} fullWidth disabled={saving}>
            {saving ? "Guardando…" : saved ? "✓ Guardado" : "Guardar"}
          </Button>
          {saveNote && (
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
              {saveNote}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Notificaciones push */}
      {push.supported && (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main", mb: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <NotificationsActive color={push.subscribed ? "primary" : "disabled"} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Notificaciones
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {push.subscribed
                      ? "Activas: comentarios y avisos de tu coach"
                      : "Desactivadas: te perderás avisos del grupo"}
                  </Typography>
                </Box>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={push.subscribed}
                    disabled={push.busy}
                    onChange={(_, checked) => (checked ? push.enable() : push.disable())}
                  />
                }
                label=""
              />
            </Box>
            {!push.subscribed && push.permission === "denied" && (
              <Typography variant="caption" color="error" display="block" mt={1}>
                Los permisos están bloqueados en el navegador. Actívalos desde la configuración
                del sitio (ícono 🔒 junto a la dirección).
              </Typography>
            )}
            {push.subscribed && (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  fullWidth
                  disabled={push.busy}
                  onClick={async () => {
                    const ok = await push.test();
                    setTestResult(
                      ok
                        ? "✅ Enviada — revisa tu celular (revisa también notificaciones silenciadas)"
                        : "❌ No se pudo enviar. Revisa claves VAPID en SSM y consola del backend."
                    );
                  }}
                  sx={{ mt: 2 }}
                >
                  🧪 Probar notificación
                </Button>
                {testResult && (
                  <Typography variant="caption" display="block" textAlign="center" mt={1}>
                    {testResult}
                  </Typography>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recomendaciones de tu coach */}
      {myRecs.length > 0 && (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main", mb: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              🧑‍⚕️ Recomendaciones de tu coach
            </Typography>
            {[...myRecs]
              .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))
              .map((r) => (
                <Box
                  key={r.id}
                  py={1}
                  borderBottom="1px solid"
                  borderColor="AMUltraLightGray.main"
                  sx={{ "&:last-child": { borderBottom: "none" } }}
                >
                  <Typography variant="body2">{r.texto}</Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(r.fechaCreacion).format("DD/MM/YYYY")}
                    </Typography>
                    {r.leida ? (
                      <Typography variant="caption" color="text.disabled">
                        ✓ Leída
                      </Typography>
                    ) : (
                      <Button size="small" color="primary" onClick={() => markProfileRead(r.id)}>
                        Marcar como leída
                      </Button>
                    )}
                  </Box>
                </Box>
              ))}
          </CardContent>
        </Card>
      )}

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
