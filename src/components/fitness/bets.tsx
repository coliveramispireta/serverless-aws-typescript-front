"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Typography,
  Avatar,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from "@mui/material";
import {
  AttachMoney,
  CalendarToday,
  DateRange,
  Flag,
  QrCode2,
  Warning,
  CheckCircle,
} from "@mui/icons-material";
import useFitnessHook from "./usefitnesshook";

export const Bets = (
{ 
    participantesConProgreso,
    fondoActual,
    totalFondoApuestas,
    tipoApuesta,
    setTipoApuesta,
    participanteSeleccionado,
    setParticipanteSeleccionado,
    textFieldStyles,
    participantes,
    montosDisponibles,
    handleMontoClick,
    modalOpen,
    handleCloseModal,
    montoSeleccionado,
    pagoData,
    handleRegistrarPago,
    handlePagoInputChange
} : any
) => {

  return (
    <>
      <Grid container spacing={3}>
        {/* Selector de tipo de apuesta */}
        <Grid item xs={12}>
          <Card
            sx={{
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: 4,
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="700" mb={2} sx={{ color: "#ffd700" }}>
                🎯 Selecciona el tipo de apuesta
              </Typography>
              <ToggleButtonGroup
                value={tipoApuesta}
                exclusive
                onChange={(_, newValue) => {
                  if (newValue) setTipoApuesta(newValue);
                }}
                fullWidth
                sx={{
                  "& .MuiToggleButton-root": {
                    color: "#aaa",
                    borderColor: "rgba(255,255,255,0.2)",
                    py: 2,
                    "&.Mui-selected": {
                      bgcolor: "rgba(255,215,0,0.2)",
                      color: "#ffd700",
                      borderColor: "#ffd700",
                      "&:hover": {
                        bgcolor: "rgba(255,215,0,0.3)",
                      },
                    },
                  },
                }}
              >
                <ToggleButton disabled value="semanal">
                  <CalendarToday sx={{ mr: 1 }} />
                  Semanal
                </ToggleButton>
                <ToggleButton value="mensual">
                  <DateRange sx={{ mr: 1 }} />
                  Mensual
                </ToggleButton>
                <ToggleButton value="final">
                  <Flag sx={{ mr: 1 }} />
                  Final
                </ToggleButton>
              </ToggleButtonGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* Card del Pozo por Tipo */}
        <Grid item xs={12}>
          <Card
            sx={{
              bgcolor: "rgba(76,175,80,0.1)",
              borderRadius: 4,
              border: "2px solid #4caf50",
              boxShadow: "0 8px 32px rgba(76,175,80,0.3)",
            }}
          >
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <AttachMoney sx={{ fontSize: 60, color: "#4caf50", mb: 2 }} />
              <Typography variant="h6" color="#aaa" mb={1}>
                Fondo acumulado - Apuesta{" "}
                <span style={{ textTransform: "capitalize" }}>{tipoApuesta}</span>
              </Typography>
              <Typography variant="h2" fontWeight="900" color="#4caf50">
                S/. {totalFondoApuestas.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="#aaa" mt={2}>
                Apuestas individuales por participante
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Formulario de Apuesta */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: 4,
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="700" mb={1} sx={{ color: "#ffd700" }}>
                Realizar apuesta
              </Typography>
              <Typography variant="body2" color="#aaa" mb={4}>
                Apuesta <span style={{ textTransform: "capitalize" }}>{tipoApuesta}</span> por el
                ganador
              </Typography>

              <Box display="flex" flexDirection="column" gap={3}>
                <FormControl fullWidth sx={textFieldStyles}>
                  <InputLabel sx={{ color: "#aaa" }}>Selecciona un participante</InputLabel>
                  <Select
                    value={participanteSeleccionado}
                    onChange={(e) => setParticipanteSeleccionado(e.target.value)}
                    label="Selecciona un participante"
                    sx={{ color: "white" }}
                  >
                    {participantesConProgreso.map((p: any, i:any) => (
                      <MenuItem key={i} value={p.nombre}>
                        {p.nombre} - {p.porcentajeProgreso}% progreso
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Botones de montos fijos */}
                <Box>
                  <Typography variant="subtitle2" color="#ffd700" mb={2} fontWeight="700">
                    💰 Selecciona el monto de tu apuesta
                  </Typography>
                  <Grid container spacing={2}>
                    {montosDisponibles.map((monto: any) => (
                      <Grid item xs={2.4} key={monto}>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => handleMontoClick(monto)}
                          disabled={!participanteSeleccionado}
                          sx={{
                            py: 0.5,
                            px: 0.5,
                            borderRadius: 3,
                            borderColor: "rgba(76,175,80,0.5)",
                            color: "#4caf50",
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                            "&:hover": {
                              borderColor: "#4caf50",
                              bgcolor: "rgba(76,175,80,0.1)",
                            },
                            "&.Mui-disabled": {
                              borderColor: "rgba(255,255,255,0.1)",
                              color: "rgba(255,255,255,0.3)",
                            },
                          }}
                        >
                          S/.{monto}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {participanteSeleccionado && (
                  <Alert
                    severity="info"
                    sx={{
                      bgcolor: "rgba(33,150,243,0.1)",
                      color: "#64b5f6",
                      border: "1px solid rgba(33,150,243,0.3)",
                    }}
                  >
                    Selecciona un monto y procede con el pago vía Yape. El fondo de{" "}
                    <strong>{participanteSeleccionado}</strong> se distribuirá proporcionalmente
                    entre los apostadores si gana.
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Fondos por Participante */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: 4,
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="700" mb={3} sx={{ color: "#ffd700" }}>
                Fondos individuales
              </Typography>

              <Box display="flex" flexDirection="column" gap={2}>
                {participantes.map((p:any, i:any) => {
                  const fondoParticipante = fondoActual[p.nombre as keyof typeof fondoActual] || 0;
                  const porcentajeFondo =
                    totalFondoApuestas > 0 ? (fondoParticipante / totalFondoApuestas) * 100 : 0;

                  return (
                    <Box key={i}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar src={p.avatar} sx={{ width: 32, height: 32 }} />
                          <Typography fontWeight="600" color="#fff">
                            {p.nombre}
                          </Typography>
                        </Box>
                        <Typography fontWeight="700" color="#4caf50">
                          S/. {fondoParticipante} ({porcentajeFondo.toFixed(1)}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={porcentajeFondo}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "rgba(255,255,255,0.1)",
                          "& .MuiLinearProgress-bar": {
                            background: "linear-gradient(90deg, #4caf50, #81c784)",
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Reglas de Apuestas */}
        <Grid item xs={12}>
          <Card
            sx={{
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: 4,
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="700" mb={2} sx={{ color: "#ffd700" }}>
                📋 Reglas del sistema de apuestas
              </Typography>
              <Box component="ul" sx={{ color: "#aaa", pl: 2 }}>
                <li>Cada participante tiene su propio fondo de apuestas independiente</li>
                <li>
                  <strong>Apuesta Semanal:</strong> Se declara ganador cada semana
                </li>
                <li>
                  <strong>Apuesta Mensual:</strong> Se declara ganador cada mes
                </li>
                <li>
                  <strong>Apuesta Final:</strong> Se declara ganador al finalizar el reto
                </li>
                <li>El ganador se determina por el mayor % de progreso hacia su peso ideal</li>
                <li>
                  Si un participante gana, su fondo se distribuye proporcionalmente entre quienes
                  apostaron por él
                </li>
                <li>Puedes apostar a múltiples participantes en diferentes tipos de apuesta</li>

              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal de Pago */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#1a1a2e",
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "rgba(76,175,80,0.1)",
            borderBottom: "1px solid rgba(76,175,80,0.3)",
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <QrCode2 sx={{ fontSize: 32, color: "#4caf50" }} />
            <Box>
              <Typography variant="h6" fontWeight="700" color="#4caf50">
                Realizar pago - S/. {montoSeleccionado}
              </Typography>
              <Typography variant="body2" color="#aaa">
                Apuesta {tipoApuesta} por {participanteSeleccionado}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ py: 4 }}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* QR Code */}
{/* QR Code */}
<Box
  sx={{
    display: "flex",
    justifyContent: "center", // ✅ centrado horizontal
    mt: 2,
  }}
>
  <Box
    sx={{
      width: "100%",
      maxWidth: 350 ,        // controla tamaño del QR
      bgcolor: "white",
      borderRadius: 3,
      overflow: "hidden",
      p: 0,                // pequeño margen interno (opcional)
    }}
  >
    <Box
      component="img"
      src="/bets/QR.png"
      alt="QR Yape"
      sx={{
        width: "100%",     // 🔥 ocupa todo el ancho
        height: "auto",    // 🔥 NO cuadrado
        display: "block",  // evita espacios raros
      }}
    />
  </Box>
</Box>



            {/* Warning Principal */}
            <Alert
              severity="warning"
              icon={<Warning />}
              sx={{
                bgcolor: "rgba(255,152,0,0.1)",
                color: "#ffb74d",
                border: "2px solid rgba(255,152,0,0.5)",
              }}
            >
              <Typography variant="body2" fontWeight="700" mb={0.5}>
                ⚠️ IMPORTANTE
              </Typography>
              El monto del yapeo debe ser exactamente <strong>S/. {montoSeleccionado}</strong>. De
              lo contrario, el pago será invalidado automáticamente.
            </Alert>

            {/* Campos del formulario */}
            <TextField
              label="Nombre del titular del yapeo"
              variant="outlined"
              fullWidth
              value={pagoData.nombreTitular}
              onChange={(e) => handlePagoInputChange("nombreTitular", e.target.value)}
              sx={textFieldStyles}
            />

            <TextField
              label="Fecha y hora de la operación"
              type="datetime-local"
              variant="outlined"
              fullWidth
              value={pagoData.fechaHora}
              onChange={(e) => handlePagoInputChange("fechaHora", e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={textFieldStyles}
            />

            <TextField
              label="Número de operación"
              variant="outlined"
              fullWidth
              value={pagoData.numeroOperacion}
              onChange={(e) => handlePagoInputChange("numeroOperacion", e.target.value)}
              placeholder="Ejemplo: 123456789"
              sx={textFieldStyles}
            />

            {/* Warning Secundario */}
            <Alert
              severity="error"
              icon={<Warning />}
              sx={{
                bgcolor: "rgba(244,67,54,0.1)",
                color: "#ef5350",
                border: "1px solid rgba(244,67,54,0.3)",
              }}
            >
              <Typography variant="body2" fontWeight="700" mb={0.5}>
                🚨 Verificación de datos
              </Typography>
              Los datos ingresados deben coincidir exactamente con los del voucher de Yape. Cualquier
              discrepancia invalidará el pago.
            </Alert>

            {/* Estado del pago */}
            <Box
              sx={{
                bgcolor: "rgba(255,215,0,0.1)",
                border: "1px solid rgba(255,215,0,0.3)",
                borderRadius: 2,
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Chip
                label="PENDIENTE"
                size="small"
                sx={{
                  bgcolor: "rgba(255,152,0,0.2)",
                  color: "#ffb74d",
                  fontWeight: "bold",
                }}
              />
              <Typography variant="body2" color="#aaa">
                Tu pago quedará en estado pendiente hasta ser validado por el administrador
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <Button
            onClick={handleCloseModal}
            sx={{
              color: "#aaa",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.05)",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRegistrarPago}
            variant="contained"
            startIcon={<CheckCircle />}
            sx={{
              background: "linear-gradient(45deg, #4caf50 30%, #81c784 90%)",
              fontWeight: "bold",
              px: 4,
              "&:hover": {
                background: "linear-gradient(45deg, #66bb6a 30%, #a5d6a7 90%)",
              },
            }}
          >
            Registrar Pago
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};