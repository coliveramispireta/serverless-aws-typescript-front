"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Typography,
} from "@mui/material";
import { CheckCircleOutline, ErrorOutline, Storefront } from "@mui/icons-material";
import { listFoods, seedFoods } from "@/services/keto/foods.service";
import { FoodCategory, FoodItem } from "@/model/keto.models";

const CATEGORY_LABELS: Record<FoodCategory, string> = {
  proteina: "Proteínas",
  lacteo: "Lácteos y huevos",
  grasa: "Grasas",
  verdura: "Verduras",
  fruto_seco: "Frutos secos",
  semilla: "Semillas",
  otro: "Otros",
};

const CATEGORY_ORDER: FoodCategory[] = [
  "proteina",
  "lacteo",
  "grasa",
  "verdura",
  "fruto_seco",
  "semilla",
  "otro",
];

type SeedState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; inserted: number }
  | { status: "already" }
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
      if (res.inserted > 0) {
        setSeed({ status: "success", inserted: res.inserted });
      } else {
        setSeed({ status: "already" });
      }
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
          </Box>

          {seed.status === "success" && (
            <Alert severity="success" icon={<CheckCircleOutline />} sx={{ mt: 2 }}>
              Se insertaron {seed.inserted} alimento{seed.inserted !== 1 ? "s" : ""} al catálogo.
            </Alert>
          )}
          {seed.status === "already" && (
            <Alert severity="info" sx={{ mt: 2 }}>
              El catálogo ya estaba poblado. No se insertaron duplicados.
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
                      label={`${f.nombre} (${unidadLabel(f)})`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}