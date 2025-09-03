import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import emailjs from "@emailjs/browser";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

export default function ContactSection({ id }: { id: string }) {
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPhone = (phone: string) => /^\d{9,}$/.test(phone);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValidEmail(form.email)) {
      alert("Correo inválido");
      return;
    }

    const serviceID = "service_3pt4jzw";
    const templateID = "template_c6nla1k";
    const publicKey = "5El7Ssgrb4ofsI-Cy";

    emailjs.send(serviceID, templateID, { ...form } as Record<string, unknown>, publicKey).then(
      () => {
        setSnackbarOpen(true);
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          company: "",
          message: "",
        });
      },
      (error) => {
        alert("Error al enviar el mensaje, intenta de nuevo.");
        console.error(error);
      }
    );
  };

  return (
    <Box id={id} sx={{ width: "100%", py: 8, px: { xs: 2, md: 10 }, bgcolor: "#fff" }}>
      <Grid container spacing={4} alignItems="stretch">
        {/* FORMULARIO */}
        <Grid item xs={12} md={6}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              bgcolor: "white",
              p: 4,
              borderRadius: 3,
              boxShadow: 3,
              height: "100%",
            }}
          >
            <Typography variant="h5" fontWeight="bold" color="#16a34a" textAlign="center">
              Contacto
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="firstName"
                  label="Nombres"
                  fullWidth
                  required
                  value={form.firstName}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="lastName"
                  label="Apellidos"
                  fullWidth
                  required
                  value={form.lastName}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <TextField
              name="email"
              label="Correo electrónico"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={handleChange}
              InputProps={{
                endAdornment: isValidEmail(form.email) ? (
                  <InputAdornment position="end">
                    <CheckCircleIcon sx={{ color: "#22c55e" }} />
                  </InputAdornment>
                ) : null,
              }}
            />

            <TextField
              name="phone"
              label="Celular"
              fullWidth
              required
              value={form.phone}
              onChange={handleChange}
              InputProps={{
                endAdornment: isValidPhone(form.phone) ? (
                  <InputAdornment position="end">
                    <CheckCircleIcon sx={{ color: "#22c55e" }} />
                  </InputAdornment>
                ) : null,
              }}
            />

            <TextField
              name="company"
              label="Empresa o nombre del proyecto"
              fullWidth
              value={form.company}
              onChange={handleChange}
            />

            <TextField
              name="message"
              label="Cuéntanos de tu proyecto..."
              multiline
              rows={4}
              fullWidth
              required
              value={form.message}
              onChange={handleChange}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                bgcolor: "#22c55e",
                color: "white",
                fontWeight: "bold",
                "&:hover": {
                  bgcolor: "#16a34a",
                },
              }}
            >
              Enviar mensaje
            </Button>
          </Box>
        </Grid>

        {/* TEXTO LATERAL */}
        <Grid item xs={12} md={6} display="flex" alignItems="center">
          <Box sx={{ px: 4, mb: 6 }}>
            <Typography
              sx={{
                fontSize: {
                  xs: "1.1rem", // móviles
                  sm: "1.1rem", // tablets pequeñas
                  md: "1.3rem", // pantallas medianas en adelante
                  lg: "1.5rem",
                },
              }}
              variant="h4"
              fontWeight="bold"
              gutterBottom
            >
              ¡Demo Serverless AWS!
            </Typography>
            <Typography
              sx={{
                fontSize: {
                  xs: "1rem", // móviles
                  sm: "1rem", // tablets pequeñas
                  md: "1.2rem", // pantallas medianas en adelante
                  lg: "1.4rem",
                },
              }}
              variant="h5"
              fontWeight="medium"
              color="#16a34a"
              gutterBottom
            >
              ¡Te presento mi proyecto challenge!
            </Typography>
            <Typography
              sx={{
                fontSize: {
                  xs: "1rem", // móviles
                  sm: "0.9rem", // tablets pequeñas
                  md: "1.0rem", // pantallas medianas en adelante
                  lg: "1.2rem",
                },
              }}
              variant="h6"
              color="text.secondary"
              mt={3}
            >
              Este proyecto es una aplicación fullstack que construí como parte de un reto
              profesional, combinando lo mejor del backend serverless y un frontend moderno:
            </Typography>
            <Typography
              sx={{
                fontSize: {
                  xs: "1rem", // móviles
                  sm: "0.9rem", // tablets pequeñas
                  md: "1.0rem", // pantallas medianas en adelante
                  lg: "1.2rem",
                },
              }}
              variant="h6"
              color="text.secondary"
              mt={0}
            >
              <span style={{ fontWeight: "bold" }}>Backend: </span> Desarrollado con Node.js y
              TypeScript, desplegado en AWS mediante Serverless Framework.
            </Typography>
            <Typography
              sx={{
                fontSize: {
                  xs: "1rem", // móviles
                  sm: "0.9rem", // tablets pequeñas
                  md: "1.0rem", // pantallas medianas en adelante
                  lg: "1.2rem",
                },
              }}
              variant="h6"
              color="text.secondary"
              mt={0}
            >
              Toda la infraestructura está automatizada con IaC.
            </Typography>
            <Typography
              sx={{
                fontSize: {
                  xs: "1rem", // móviles
                  sm: "0.9rem", // tablets pequeñas
                  md: "1.0rem", // pantallas medianas en adelante
                  lg: "1.2rem",
                },
              }}
              variant="h6"
              color="text.secondary"
              mt={0}
            >
              Incluye API Gateway y Lambdas con funcionalidad CRUD para manejar boletos, usando
              DynamoDB como base de datos.
            </Typography>
            <Typography
              sx={{
                fontSize: {
                  xs: "1rem", // móviles
                  sm: "0.9rem", // tablets pequeñas
                  md: "1.0rem", // pantallas medianas en adelante
                  lg: "1.2rem",
                },
              }}
              variant="h6"
              color="text.secondary"
              mt={0}
            >
              Amazon Cognito gestiona la autenticación y autorización de usuarios, permitiendo un
              flujo seguro de registro, inicio de sesión y recuperación de contraseñas, además de la
              validación automática mediante triggers en Lambda.
            </Typography>
            <Typography
              sx={{
                fontSize: {
                  xs: "1rem", // móviles
                  sm: "0.9rem", // tablets pequeñas
                  md: "1.0rem", // pantallas medianas en adelante
                  lg: "1.2rem",
                },
              }}
              variant="h6"
              color="text.secondary"
              mt={0}
            >
              Configuré un pipeline CI/CD para despliegues multi-stage (dev/prod).
            </Typography>
            <Typography
              sx={{
                fontSize: {
                  xs: "1rem", // móviles
                  sm: "0.9rem", // tablets pequeñas
                  md: "1.0rem", // pantallas medianas en adelante
                  lg: "1.2rem",
                },
              }}
              variant="h6"
              color="text.secondary"
              mt={0}
            >
              Todo el código está documentado y versionado en GitHub, explicando la arquitectura y
              la solución.
            </Typography>
            <Typography
              sx={{
                fontSize: {
                  xs: "1rem", // móviles
                  sm: "0.9rem", // tablets pequeñas
                  md: "1.0rem", // pantallas medianas en adelante
                  lg: "1.2rem",
                },
              }}
              variant="h6"
              color="text.secondary"
              mt={0}
            >
              <span style={{ fontWeight: "bold" }}>Frontend:</span> Construido con Next.js, React,
              TypeScript y MUI.
            </Typography>
            <Typography
              sx={{
                fontSize: {
                  xs: "1rem", // móviles
                  sm: "0.9rem", // tablets pequeñas
                  md: "1.0rem", // pantallas medianas en adelante
                  lg: "1.2rem",
                },
              }}
              variant="h6"
              color="text.secondary"
              mt={0}
            >
              Consume las Lambdas mediante Axios.
            </Typography>
            <Typography
              sx={{
                fontSize: {
                  xs: "1rem", // móviles
                  sm: "0.9rem", // tablets pequeñas
                  md: "1.0rem", // pantallas medianas en adelante
                  lg: "1.2rem",
                },
              }}
              variant="h6"
              color="text.secondary"
              mt={0}
            >
              Permite registrar, listar, actualizar y facturar boletos de manera visual e
              interactiva.
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: "1rem", // móviles
                  sm: "0.9rem", // tablets pequeñas
                  md: "1.0rem", // pantallas medianas en adelante
                  lg: "1.2rem",
                },
              }}
              variant="h5"
              fontWeight="medium"
              color="#16a34a"
              mt={3}
              gutterBottom
            >
              ¡Solución completa, escalable y moderna!
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          ¡Mensaje enviado correctamente!
        </Alert>
      </Snackbar>
    </Box>
  );
}
