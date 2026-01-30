"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Tab,
  Tabs,
  TextField,
  Typography,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  EmojiEvents,
  TrendingDown,
  Person,
  AttachMoney,
  AccountBalance,
  Calculate,
  FitnessCenter,
  CalendarToday,
  DateRange,
  Flag,
} from "@mui/icons-material";
import { createMember } from "@/services/bets/createmember.service";
import { listMembers } from "@/services/bets/listmembers.service";
import { getUserInfo } from "@/services/xstorage.cross.service";

interface ParticipanteUI {
  nombre: string;
  nombreCompleto: string;
  pesoInicial: number;
  pesoActual: number;
  pesoIdeal: number;
  avatar: string;
  progreso: string;
}

// Simulación de función getUserInfo


export const Fitness = () => {
  const [tab, setTab] = useState(0);
  const [tipoApuesta, setTipoApuesta] = useState("semanal");
  const [participanteSeleccionado, setParticipanteSeleccionado] = useState("");
  const [montoApuesta, setMontoApuesta] = useState("");
  const [participantes, setParticipantes] = useState<ParticipanteUI[]>([]);
  const userinfo = getUserInfo();

  useEffect(() => {
    listMembers().then((data) => {
      const normalized = data.map((p: any) => ({
        ...p,
        nombre: p.nombreCompleto,
        pesoInicial: p.pesoActual, // inicial = actual al inicio
        avatar: "/img/avatar/avatar_men.jpg",
        progreso: "/progreso1.png",
      }));
      setParticipantes(normalized);
    });
  }, []);

  // Estados del formulario de inscripción
  const [formData, setFormData] = useState({
    email: userinfo.email,
    nombreCompleto: "",
    edad: "",
    pesoActual: "",
    sexo: "",
    talla: "",
    anchoMuneca: "",
    pesoIdeal: "",
  });

  const [estructuraOsea, setEstructuraOsea] = useState("");
  const [todosLosCamposLlenos, setTodosLosCamposLlenos] = useState(false);
  const [pesoIdealCalculado, setPesoIdealCalculado] = useState(false);

  // Verificar si todos los campos necesarios están llenos
  useEffect(() => {
    const camposLlenos =
      formData.nombreCompleto &&
      formData.edad &&
      formData.pesoActual &&
      formData.sexo &&
      formData.talla &&
      formData.anchoMuneca;
    setTodosLosCamposLlenos(!!camposLlenos);
  }, [formData]);

  // Determinar estructura ósea según ancho de muñeca
  useEffect(() => {
    if (formData.anchoMuneca && formData.sexo) {
      const ancho = parseFloat(formData.anchoMuneca);
      let estructura = "";

      if (ancho < 15) estructura = "pequeña";
      else if (ancho >= 15 && ancho <= 17) estructura = "mediana";
      else estructura = "grande";

      setEstructuraOsea(estructura);
    }
  }, [formData.anchoMuneca, formData.sexo]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field !== "pesoIdeal") {
      setPesoIdealCalculado(false);
    }
  };

  const calcularPesoIdeal = () => {
    const talla = parseFloat(formData.talla);
    let pesoIdeal = 0;

    if (formData.sexo === "masculino") {
      pesoIdeal = talla - 100 - (talla - 150) / 8;
    } else if (formData.sexo === "femenino") {
      pesoIdeal = talla - 100 - (talla - 150) / 4;
    }

    // Ajustar según estructura ósea
    if (estructuraOsea === "pequeña") {
      pesoIdeal = pesoIdeal * 0.9; // -10%
    } else if (estructuraOsea === "grande") {
      pesoIdeal = pesoIdeal * 1.1; // +10%
    }

    setFormData((prev) => ({ ...prev, pesoIdeal: pesoIdeal.toFixed(1) }));
    setPesoIdealCalculado(true);
  };

  const handleInscripcion = async () => {
    try {
      const body = {
        ...formData,
        pesoInicial: formData.pesoActual,
      };
      await createMember(body);
      alert("¡Inscripción exitosa! Bienvenido al reto WFC");
    } catch (error) {
      console.error("Error en inscripción:", error);
      alert("Error al registrar la inscripción");
    }
  };

  // const participantes = [
  //   {
  //     nombre: "Diego Vicente",
  //     pesoInicial: 102,
  //     pesoActual: 96,
  //     pesoIdeal: 75,
  //     avatar: "/img/avatar/diego.jpeg",
  //     progreso: "/progreso4.png",
  //   },
  //   {
  //     nombre: "Sergio Moran",
  //     pesoInicial: 88,
  //     pesoActual: 83,
  //     pesoIdeal: 70,
  //     avatar: "/img/avatar/avatar_men.jpg",
  //     progreso: "/progreso3.png",
  //   },
  //   {
  //     nombre: "Carlos Olivera",
  //     pesoInicial: 99,
  //     pesoActual: 95,
  //     pesoIdeal: 73,
  //     avatar: "/img/avatar/carlos.jpeg",
  //     progreso: "/progreso1.png",
  //   },
  //   {
  //     nombre: "Pablo Pimentel",
  //     pesoInicial: 95,
  //     pesoActual: 92,
  //     pesoIdeal: 72,
  //     avatar: "/img/avatar/pablo.jpeg",
  //     progreso: "/progreso2.png",
  //   },
  // ];

  // Calcular porcentaje de progreso basado en peso ideal
  const participantesConProgreso = participantes
    .map((p) => {
      const pesoAPerder = Math.max(p.pesoInicial - p.pesoIdeal, 1);
      const pesoPerdido = p.pesoInicial - p.pesoActual;
      const porcentajeProgreso = ((pesoPerdido / pesoAPerder) * 100).toFixed(2);
      return {
        ...p,
        porcentajeProgreso: parseFloat(porcentajeProgreso),
        pesoPerdido,
        pesoAPerder,
      };
    })
    .sort((a, b) => b.porcentajeProgreso - a.porcentajeProgreso);

  // Fondos de apuestas por participante y tipo
  const fondosApuestas = {
    semanal: {
      "Diego Vicente": 50,
      "Sergio Moran": 30,
      "Carlos Olivera": 40,
      "Pablo Pimentel": 20,
    },
    mensual: {
      "Diego Vicente": 80,
      "Sergio Moran": 60,
      "Carlos Olivera": 70,
      "Pablo Pimentel": 50,
    },
    final: {
      "Diego Vicente": 150,
      "Sergio Moran": 120,
      "Carlos Olivera": 130,
      "Pablo Pimentel": 100,
    },
  };

  const costoPorInscripcion = 200;
  const pozoPremioInscripciones = participantes.length * costoPorInscripcion;

  const fondoActual = fondosApuestas[tipoApuesta as keyof typeof fondosApuestas];
  const totalFondoApuestas = Object.values(fondoActual).reduce((sum, val) => sum + val, 0);

  const handleRealizarApuesta = () => {
    if (!participanteSeleccionado || !montoApuesta) {
      alert("Por favor completa todos los campos");
      return;
    }
    console.log({
      participante: participanteSeleccionado,
      monto: montoApuesta,
      tipo: tipoApuesta,
    });
    alert(
      `¡Apuesta registrada! S/. ${montoApuesta} a ${participanteSeleccionado} - ${tipoApuesta}`
    );
    setParticipanteSeleccionado("");
    setMontoApuesta("");
  };

  const textFieldStyles = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(255,255,255,0.05)",
    borderRadius: 2,
    "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
    "&:hover fieldset": { borderColor: "#ffd700" },
    "&.Mui-focused fieldset": { borderColor: "#ffd700" },
    "&.Mui-disabled fieldset": {
     // borderColor: "rgba(255,215,0,0.4)",
    },
  },

  /* LABEL */
  "& .MuiInputLabel-root": {
    color: "#aaa",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#ffd700",
  },
  "& .MuiInputLabel-root.Mui-disabled": {
    color: "#ffd700",
    opacity: 0.7,
  },

  /* INPUT */
  "& input": { color: "white" },
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "#d9c55b",
    opacity: 0.6,
  },
};


  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
        color: "white",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            mb: 5,
          }}
        >
          <EmojiEvents sx={{ fontSize: 40, color: "#ffd700" }} />
          <Typography
            variant="h3"
            fontWeight="800"
            sx={{
              background: "linear-gradient(45deg, #1767fc 30%, #7dad98 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 1,
            }}
          >
            WFC · RETO DE PESO
          </Typography>
        </Box>

        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: "rgba(255,255,255,0.05)",
            borderRadius: 4,
            mb: 4,
            backdropFilter: "blur(10px)",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            centered
            sx={{
              "& .MuiTab-root": {
                color: "#aaa",
                fontWeight: 600,
                fontSize: "1rem",
                py: 2,
                minHeight: 64,
              },
              "& .Mui-selected": {
                color: "#ffd700 !important",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#ffd700",
                height: 3,
              },
            }}
          >
            <Tab icon={<Person />} iconPosition="start" label="Inscripción" />
            <Tab icon={<EmojiEvents />} iconPosition="start" label="Ranking" />
            <Tab icon={<AttachMoney />} iconPosition="start" label="Apuestas" />
          </Tabs>
        </Paper>

        {/* Tab de Inscripción */}
        {tab === 0 && (
          <Grid container spacing={3}>
            {/* Datos Personales */}
            <Grid item xs={12} md={7}>
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
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Person sx={{ fontSize: 32, color: "#ffd700" }} />
                    <Box>
                      <Typography variant="h5" fontWeight="700" color="#ffd700">
                        Datos Personales
                      </Typography>
                      <Typography variant="body2" color="#aaa">
                        Completa tu información para comenzar
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" flexDirection="column" gap={3}>
                    <TextField
                      label="Correo electrónico"
                      variant="outlined"
                      fullWidth
                      disabled
                      value={formData.email}
                      sx={textFieldStyles}
                    />

                    <TextField
                      label="Nombres completos"
                      variant="outlined"
                      fullWidth
                      value={formData.nombreCompleto}
                      onChange={(e) => handleInputChange("nombreCompleto", e.target.value)}
                      sx={textFieldStyles}
                    />

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          label="Edad"
                          type="number"
                          variant="outlined"
                          fullWidth
                          value={formData.edad}
                          onChange={(e) => handleInputChange("edad", e.target.value)}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Typography color="#aaa">años</Typography>
                              </InputAdornment>
                            ),
                          }}
                          sx={textFieldStyles}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth sx={textFieldStyles}>
                          <InputLabel sx={{ color: "#aaa" }}>Sexo</InputLabel>
                          <Select
                            value={formData.sexo}
                            onChange={(e) => handleInputChange("sexo", e.target.value)}
                            label="Sexo"
                            sx={{ color: "white" }}
                          >
                            <MenuItem value="masculino">Masculino</MenuItem>
                            <MenuItem value="femenino">Femenino</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          label="Peso actual"
                          type="number"
                          variant="outlined"
                          fullWidth
                          value={formData.pesoActual}
                          onChange={(e) => handleInputChange("pesoActual", e.target.value)}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Typography color="#aaa">kg</Typography>
                              </InputAdornment>
                            ),
                          }}
                          sx={textFieldStyles}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Talla"
                          type="number"
                          variant="outlined"
                          fullWidth
                          value={formData.talla}
                          onChange={(e) => handleInputChange("talla", e.target.value)}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Typography color="#aaa">cm</Typography>
                              </InputAdornment>
                            ),
                          }}
                          sx={textFieldStyles}
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      label="Ancho de muñeca"
                      type="number"
                      variant="outlined"
                      fullWidth
                      value={formData.anchoMuneca}
                      onChange={(e) => handleInputChange("anchoMuneca", e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography color="#aaa">cm</Typography>
                          </InputAdornment>
                        ),
                      }}
                      helperText="Mide la circunferencia de tu muñeca en su parte más delgada"
                      sx={{
                        ...textFieldStyles,
                        "& .MuiFormHelperText-root": { color: "#888" },
                      }}
                    />

                    {estructuraOsea && (
                      <Alert
                        severity="info"
                        sx={{
                          bgcolor: "rgba(33,150,243,0.1)",
                          color: "#64b5f6",
                          border: "1px solid rgba(33,150,243,0.3)",
                        }}
                      >
                        Estructura ósea detectada:{" "}
                        <strong style={{ textTransform: "capitalize" }}>{estructuraOsea}</strong>
                      </Alert>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Cálculo de Peso Ideal */}
            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  bgcolor: "rgba(255,215,0,0.05)",
                  borderRadius: 4,
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255,215,0,0.3)",
                  boxShadow: "0 8px 32px rgba(255,215,0,0.2)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <FitnessCenter sx={{ fontSize: 32, color: "#ffd700" }} />
                    <Box>
                      <Typography variant="h5" fontWeight="700" color="#ffd700">
                        Peso Ideal
                      </Typography>
                      <Typography variant="body2" color="#aaa">
                        Calculado científicamente
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" flexDirection="column" gap={3}>
                    <Alert
                      severity="info"
                      sx={{
                        bgcolor: "rgba(23,103,252,0.1)",
                        color: "#64b5f6",
                        border: "1px solid rgba(23,103,252,0.3)",
                      }}
                    >
                      <Typography variant="body2" fontWeight="600" mb={0.5}>
                        💰 Costo de inscripción
                      </Typography>
                      <Typography variant="h6" color="#ffd700">
                        S/. {costoPorInscripcion}
                      </Typography>
                    </Alert>

                    <Button
                      variant="contained"
                      size="large"
                      disabled={!todosLosCamposLlenos}
                      onClick={calcularPesoIdeal}
                      startIcon={<Calculate />}
                      sx={{
                        background: todosLosCamposLlenos
                          ? "linear-gradient(45deg, #ff6b35 30%, #f7931e 90%)"
                          : "rgba(255,255,255,0.1)",
                        borderRadius: 3,
                        fontWeight: "bold",
                        py: 1.5,
                        fontSize: "1rem",
                        boxShadow: todosLosCamposLlenos
                          ? "0 4px 20px rgba(255,107,53,0.3)"
                          : "none",
                        "&:hover": {
                          background: todosLosCamposLlenos
                            ? "linear-gradient(45deg, #ff8c42 30%, #ffa53e 90%)"
                            : "rgba(255,255,255,0.1)",
                        },
                        "&.Mui-disabled": {
                          color: "rgba(255,255,255,0.3)",
                        },
                      }}
                    >
                      Calcular Peso Ideal
                    </Button>

                    {formData.pesoIdeal && (
                      <Box
                        sx={{
                          bgcolor: "rgba(255,215,0,0.1)",
                          borderRadius: 3,
                          p: 3,
                          textAlign: "center",
                          border: "2px solid #ffd700",
                        }}
                      >
                        <Typography variant="body2" color="#aaa" mb={1}>
                          Tu peso ideal es
                        </Typography>
                        <Typography variant="h2" fontWeight="900" color="#ffd700" mb={1}>
                          {formData.pesoIdeal}
                          <Typography component="span" variant="h5" color="#aaa" ml={1}>
                            kg
                          </Typography>
                        </Typography>
                        {formData.pesoActual && (
                          <Typography variant="body2" color="#aaa">
                            Peso a perder:{" "}
                            <strong style={{ color: "#ff6b35" }}>
                              {(
                                parseFloat(formData.pesoActual) - parseFloat(formData.pesoIdeal)
                              ).toFixed(1)}{" "}
                              kg
                            </strong>
                          </Typography>
                        )}
                      </Box>
                    )}

                    <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

                    <Box>
                      <Typography variant="subtitle2" color="#ffd700" mb={2} fontWeight="700">
                        📊 Información del cálculo
                      </Typography>
                      <Box component="ul" sx={{ color: "#aaa", pl: 2, m: 0 }}>
                        <li style={{ marginBottom: "8px" }}>Fórmula científica validada</li>
                        <li style={{ marginBottom: "8px" }}>Ajustado por estructura ósea</li>
                        <li style={{ marginBottom: "8px" }}>Personalizado según tu sexo</li>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      size="large"
                      disabled={!pesoIdealCalculado}
                      onClick={handleInscripcion}
                      sx={{
                        background: pesoIdealCalculado
                          ? "linear-gradient(45deg, #1767fc 30%, #7dad98 90%)"
                          : "rgba(255,255,255,0.1)",
                        borderRadius: 3,
                        fontWeight: "bold",
                        py: 1.5,
                        fontSize: "1.1rem",
                        boxShadow: pesoIdealCalculado ? "0 4px 20px rgba(23,103,252,0.3)" : "none",
                        "&:hover": {
                          background: pesoIdealCalculado
                            ? "linear-gradient(45deg, #2b7aff 30%, #8fc0a9 90%)"
                            : "rgba(255,255,255,0.1)",
                          boxShadow: "0 6px 25px rgba(23,103,252,0.4)",
                        },
                        "&.Mui-disabled": {
                          color: "rgba(255,255,255,0.3)",
                        },
                      }}
                    >
                      CONFIRMAR INSCRIPCIÓN
                    </Button>

                    {!pesoIdealCalculado && todosLosCamposLlenos && (
                      <Alert
                        severity="warning"
                        sx={{
                          bgcolor: "rgba(255,152,0,0.1)",
                          color: "#ffb74d",
                          border: "1px solid rgba(255,152,0,0.3)",
                        }}
                      >
                        Calcula tu peso ideal antes de inscribirte
                      </Alert>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tab de Ranking */}
        {tab === 1 && (
          <>
            {/* Pozo Total */}
            <Box
              sx={{
                bgcolor: "rgba(255,215,0,0.1)",
                borderRadius: 3,
                p: 3,
                mb: 3,
                border: "2px solid #ffd700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <AccountBalance sx={{ fontSize: 40, color: "#ffd700" }} />
              <Box textAlign="center">
                <Typography variant="body2" color="#aaa">
                  Pozo del premio (Inscripciones)
                </Typography>
                <Typography variant="h3" fontWeight="800" color="#ffd700">
                  S/. {pozoPremioInscripciones.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="#aaa">
                  {participantes.length} participantes × S/. {costoPorInscripcion}
                </Typography>
              </Box>
            </Box>

            <Paper
              sx={{
                bgcolor: "rgba(255,255,255,0.05)",
                borderRadius: 4,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: "rgba(255,215,0,0.1)",
                    }}
                  >
                    <TableCell sx={{ color: "#ffd700", fontWeight: 700 }}>#</TableCell>
                    <TableCell sx={{ color: "#ffd700", fontWeight: 700 }}>Participante</TableCell>
                    <TableCell sx={{ color: "#ffd700", fontWeight: 700 }}>Peso inicial</TableCell>
                    <TableCell sx={{ color: "#ffd700", fontWeight: 700 }}>Peso actual</TableCell>
                    <TableCell sx={{ color: "#ffd700", fontWeight: 700 }}>Peso ideal</TableCell>
                    <TableCell sx={{ color: "#ffd700", fontWeight: 700 }}>
                      Progreso al ideal
                    </TableCell>
                    <TableCell sx={{ color: "#ffd700", fontWeight: 700 }}>Galería</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {participantesConProgreso.map((p, i) => (
                    <TableRow
                      key={i}
                      sx={{
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.05)",
                        },
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <TableCell>
                        {i === 0 && <EmojiEvents sx={{ color: "#ffd700", fontSize: 28 }} />}
                        {i === 1 && <EmojiEvents sx={{ color: "#c0c0c0", fontSize: 28 }} />}
                        {i === 2 && <EmojiEvents sx={{ color: "#cd7f32", fontSize: 28 }} />}
                        {i > 2 && (
                          <Typography color="#aaa" fontWeight="bold">
                            {i + 1}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            src={p.avatar}
                            sx={{
                              width: 50,
                              height: 50,
                              border: i === 0 ? "3px solid #ffd700" : "none",
                            }}
                          />
                          <Typography fontWeight="700" fontSize="1.1rem" color="#fff">
                            {p.nombre}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography color="#aaa">{p.pesoInicial} kg</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="600" color="#fff">
                          {p.pesoActual} kg
                        </Typography>
                        <Typography variant="caption" color="#4caf50">
                          -{p.pesoPerdido.toFixed(1)} kg
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="600" color="#ffd700">
                          {p.pesoIdeal} kg
                        </Typography>
                        <Typography variant="caption" color="#aaa">
                          Faltan {(p.pesoActual - p.pesoIdeal).toFixed(1)} kg
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Chip
                            icon={<TrendingDown />}
                            label={`${p.porcentajeProgreso}%`}
                            sx={{
                              bgcolor: i === 0 ? "rgba(127,255,0,0.2)" : "rgba(255,215,0,0.2)",
                              color: i === 0 ? "#7fff00" : "#ffd700",
                              fontWeight: "bold",
                              border: `1px solid ${i === 0 ? "#7fff00" : "#ffd700"}`,
                            }}
                          />
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(p.porcentajeProgreso, 100)}
                            sx={{
                              mt: 1,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: "rgba(255,255,255,0.1)",
                              "& .MuiLinearProgress-bar": {
                                background:
                                  i === 0
                                    ? "linear-gradient(90deg, #7fff00, #32cd32)"
                                    : "linear-gradient(90deg, #ffd700, #ff6b35)",
                                borderRadius: 3,
                              },
                            }}
                          />
                          <Typography variant="caption" color="#aaa" mt={0.5}>
                            {p.pesoPerdido.toFixed(1)} / {p.pesoAPerder.toFixed(1)} kg
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Avatar
                          src={p.progreso}
                          variant="rounded"
                          sx={{
                            width: 80,
                            height: 60,
                            borderRadius: 2,
                            border: "2px solid rgba(255,255,255,0.2)",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </>
        )}

        {/* Tab de Apuestas */}
        {tab === 2 && (
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
                    <ToggleButton value="semanal">
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
                    Apuesta <span style={{ textTransform: "capitalize" }}>{tipoApuesta}</span> por
                    el ganador
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
                        {participantesConProgreso.map((p, i) => (
                          <MenuItem key={i} value={p.nombre}>
                            {p.nombre} - {p.porcentajeProgreso}% progreso
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label="Monto de apuesta"
                      type="number"
                      variant="outlined"
                      fullWidth
                      value={montoApuesta}
                      onChange={(e) => setMontoApuesta(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography color="#4caf50">S/.</Typography>
                          </InputAdornment>
                        ),
                      }}
                      sx={textFieldStyles}
                    />

                    {participanteSeleccionado && montoApuesta && (
                      <Alert
                        severity="info"
                        sx={{
                          bgcolor: "rgba(33,150,243,0.1)",
                          color: "#64b5f6",
                          border: "1px solid rgba(33,150,243,0.3)",
                        }}
                      >
                        Tu apuesta irá al fondo de <strong>{participanteSeleccionado}</strong>. Si
                        gana, el fondo se reparte proporcionalmente entre los apostadores.
                      </Alert>
                    )}

                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleRealizarApuesta}
                      disabled={!participanteSeleccionado || !montoApuesta}
                      sx={{
                        background:
                          participanteSeleccionado && montoApuesta
                            ? "linear-gradient(45deg, #4caf50 30%, #81c784 90%)"
                            : "rgba(255,255,255,0.1)",
                        borderRadius: 3,
                        fontWeight: "bold",
                        py: 1.5,
                        fontSize: "1.1rem",
                        boxShadow:
                          participanteSeleccionado && montoApuesta
                            ? "0 4px 20px rgba(76,175,80,0.3)"
                            : "none",
                        "&:hover": {
                          background:
                            participanteSeleccionado && montoApuesta
                              ? "linear-gradient(45deg, #66bb6a 30%, #a5d6a7 90%)"
                              : "rgba(255,255,255,0.1)",
                          boxShadow: "0 6px 25px rgba(76,175,80,0.4)",
                        },
                        "&.Mui-disabled": {
                          color: "rgba(255,255,255,0.3)",
                        },
                      }}
                    >
                      CONFIRMAR APUESTA
                    </Button>
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
                    {participantes.map((p, i) => {
                      const fondoParticipante = fondoActual[p.nombre as keyof typeof fondoActual];
                      const porcentajeFondo = (fondoParticipante / totalFondoApuestas) * 100;

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
                              S/. {fondoParticipante} ({porcentajeFondo.toFixed(1)}
                              %)
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
                      Si un participante gana, su fondo se distribuye proporcionalmente entre
                      quienes apostaron por él
                    </li>
                    <li>Puedes apostar a múltiples participantes en diferentes tipos de apuesta</li>
                    <li>
                      Ejemplo: Si el fondo de Carlos es S/. 100 y tú apostaste S/. 20 (20%),
                      recibirás S/. 100 si gana
                    </li>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};
