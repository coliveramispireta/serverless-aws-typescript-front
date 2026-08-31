"use client";

import { useCallback, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";
import { Add, CalendarMonth, Remove, WaterDrop } from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";

const STEPS = [250, 500, 1000];
const MAX_PER_ROUND = 3000;

interface Props {
  /** Mililitros ya registrados en la ronda actual (los que ya están agendados hoy/este selector) */
  roundMl: number;
  saving: boolean;
  disabled?: boolean;
  onCreate: (ml: number, opts?: { fechaHora?: string; nota?: string }) => Promise<void> | void;
  onRemoveLast: () => Promise<void> | void;
  canRemoveLast?: boolean;
}

/**
 * Control de hidratación estilo "gota": botón − a la izquierda, gota en el centro,
 * botón + a la derecha. Cada + suma la unidad configurable (250/500/1000 ml) y
 * registra la entrada. Permite cambiar fecha/hora (para ponerse al día) y nota.
 */
export default function WaterIntakeControl({
  roundMl,
  saving,
  disabled,
  onCreate,
  onRemoveLast,
  canRemoveLast,
}: Props) {
  const [step, setStep] = useState(250);
  const [openPicker, setOpenPicker] = useState(false);
  const [fechaHora, setFechaHora] = useState<Dayjs>(dayjs());
  const [nota, setNota] = useState("");

  const atMax = roundMl + step > MAX_PER_ROUND;

  const buildOpts = () => {
    const isNow = dayjs(fechaHora).isSame(dayjs(), "minute");
    const opts: { fechaHora?: string; nota?: string } = { nota: nota || undefined };
    if (!isNow) opts.fechaHora = fechaHora.toISOString();
    return opts;
  };

  const handlePlus = useCallback(() => {
    onCreate(step, buildOpts());
  }, [onCreate, step, fechaHora, nota]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card
      elevation={0}
      sx={{ border: "1px solid", borderColor: "info.main", mb: 2 }}
    >
      <CardContent sx={{ textAlign: "center", py: 2.5 }}>
        {/* Selector de día/hora (para ponerse al día) */}
        <Box display="flex" justifyContent="center" mb={1}>
          <Button
            size="small"
            startIcon={<CalendarMonth fontSize="small" />}
            onClick={() => setOpenPicker(true)}
          >
            {dayjs(fechaHora).isSame(dayjs(), "day")
              ? "Hoy · registrar ahora"
              : `Registrar para ${fechaHora.format("DD/MM")} ${fechaHora.format("HH:mm")}`}
          </Button>
        </Box>

        {/* Gota +/− */}
        <Box display="flex" alignItems="center" justifyContent="center" gap={3}>
          <IconButton
            color="primary"
            size="large"
            disabled={!canRemoveLast || saving}
            onClick={onRemoveLast}
            aria-label="Quitar la última entrada"
            sx={{ border: "1px solid", borderColor: "divider", width: 48, height: 48 }}
          >
            <Remove />
          </IconButton>

          <Box textAlign="center">
            <WaterDrop sx={{ fontSize: 64, color: "info.main" }} />
            <Typography variant="h5" fontWeight={800} color="info.main">
              {roundMl} ml
            </Typography>
            <Typography variant="caption" color="text.secondary">
              en esta selección
            </Typography>
          </Box>

          <IconButton
            color="primary"
            size="large"
            disabled={atMax || saving || disabled}
            onClick={handlePlus}
            aria-label="Agregar agua"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              width: 48,
              height: 48,
              bgcolor: "info.main",
              color: "white",
              "&:hover": { bgcolor: "info.dark" },
            }}
          >
            <Add />
          </IconButton>
        </Box>

        {atMax && (
          <Typography variant="caption" color="warning.main" display="block" mt={1}>
            Máximo {MAX_PER_ROUND / 1000} L por ronda alcanzado.
          </Typography>
        )}

        {/* Selector de paso */}
        <Box mt={1.5} display="flex" justifyContent="center" gap={1} flexWrap="wrap">
          {STEPS.map((s) => (
            <Button
              key={s}
              size="small"
              variant={step === s ? "contained" : "outlined"}
              color="info"
              onClick={() => setStep(s)}
            >
              +{s >= 1000 ? `${s / 1000} L` : `${s} ml`}
            </Button>
          ))}
        </Box>
      </CardContent>

      {/* Modal para elegir fecha/hora y nota */}
      <Dialog open={openPicker} onClose={() => setOpenPicker(false)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={800}>Agregar agua</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Elige la fecha y hora. Al seleccionar un día anterior, el agua se registra
            en esa fecha (para ponerse al día).
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Fecha y hora"
              value={fechaHora}
              onChange={(v) => setFechaHora(v ?? dayjs())}
              ampm={false}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </LocalizationProvider>
          <MuiTextField
            label="Nota (opcional)"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            size="small"
            fullWidth
            inputProps={{ maxLength: 200 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenPicker(false)} color="inherit">
            Cerrar
          </Button>
          <Button
            variant="contained"
            color="info"
            onClick={() => {
              const capped = Math.min(step, MAX_PER_ROUND - roundMl);
              if (capped <= 0) return;
              onCreate(capped, buildOpts());
              setOpenPicker(false);
            }}
          >
            Agregar {step >= 1000 ? `${step / 1000} L` : `${step} ml`}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
