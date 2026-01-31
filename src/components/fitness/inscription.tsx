"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
} from "@mui/material";
import {
  Person,
  Calculate,
  FitnessCenter,
} from "@mui/icons-material";
import useFitnessHook from "./usefitnesshook";



export const Inscription = (
      { 
        textFieldStyles,
        formData,
        handleInputChange,
        calcularPesoIdeal,
        handleInscripcion,
        pesoIdealCalculado,
        costoPorInscripcion,
        estructuraOsea,
        todosLosCamposLlenos 
      } : any
) => {


  return (
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
 

        
  );
};
