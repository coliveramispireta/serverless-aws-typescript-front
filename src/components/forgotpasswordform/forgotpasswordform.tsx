"use client";

import { useState, useRef } from "react";
import { Box, Button, Container, Typography, Alert, Divider } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import ReCAPTCHA from "react-google-recaptcha";
import { AMFormControl, AMFormLabel, AMTextField } from "../styledcomponents";
import { useRouter } from "next/navigation";
import { handleResetPassword, handleConfirmResetPassword } from "@/services/auth.service";

const SITE_KEY = "6LfN7lUrAAAAAJbfWhc547oEXClBvE5aEW_TY6NW"; // Tu clave pública de reCAPTCHA

interface ForgotPasswordFormModel {
  email: string;
  recaptchaToken: string;
  code?: string;
  newPassword?: string;
}

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const router = useRouter();
  const [step, setStep] = useState(1);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<ForgotPasswordFormModel>({
    mode: "onChange",
    defaultValues: {
      email: "",
      recaptchaToken: "",
      code: "",
      newPassword: "",
    },
  });

  const onSubmitStep1 = async (data: ForgotPasswordFormModel) => {
    setError("");
    if (!recaptchaVerified) {
      setError("Por favor, verifica que no eres un robot.");
      return;
    }

    try {
      await handleResetPassword(data.email);
      setSuccess(true);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Error al enviar el correo de recuperación.");
    }
  };

  const onSubmitStep2 = async (data: ForgotPasswordFormModel) => {
    setError("");
    try {
      await handleConfirmResetPassword(data.email, data.code!, data.newPassword!);
      setSuccess(true);
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Error al confirmar la nueva contraseña.");
    }
  };

  const handleCaptchaChange = (token: string | null) => {
    if (token) {
      setValue("recaptchaToken", token);
      setRecaptchaVerified(true);
    } else {
      setRecaptchaVerified(false);
    }
  };

  const determinaValidez = (fieldName: keyof ForgotPasswordFormModel) => {
    return errors[fieldName] ? 2 : dirtyFields[fieldName] ? 1 : 0;
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        height="auto"
        gap={3}
        pt={10}
        pb={5}
      >
        <Typography variant="h4" textAlign="center" fontWeight={600} color="#0d1a28">
          Olvidé mi contraseña
        </Typography>

        {step === 1 && (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              Ingresa tu correo. Si el correo está registrado, recibirás un mensaje con las
              instrucciones para restablecer tu acceso.
            </Alert>

            <form onSubmit={handleSubmit(onSubmitStep1)}>
              <Box display="flex" flexDirection="column" gap={2}>
                <AMFormControl fullWidth>
                  <AMFormLabel>Correo electrónico</AMFormLabel>
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: "Campo Requerido",
                      pattern: {
                        value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                        message: "Ingrese un correo válido",
                      },
                    }}
                    render={({ field }) => (
                      <AMTextField
                        id="txt_email_forgotpassword"
                        valuestatus={determinaValidez("email")}
                        color="AMLightBlue"
                        {...field}
                        variant="outlined"
                      />
                    )}
                  />
                  <span className="error-message">{errors.email?.message}</span>
                </AMFormControl>

                {/* reCAPTCHA */}
                <Box mt={2} mb={2} display="flex" justifyContent="center">
                  <ReCAPTCHA sitekey={SITE_KEY} onChange={handleCaptchaChange} ref={recaptchaRef} />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!recaptchaVerified}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Enviar correo de recuperación
                </Button>
                {error && <Alert severity="error">{error}</Alert>}
                {success && (
                  <Alert severity="success">
                    Correo de recuperación enviado correctamente. Revisa tu bandeja de entrada.
                  </Alert>
                )}
              </Box>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              Ingresa el código que recibiste en tu correo y tu nueva contraseña.
            </Alert>

            <form onSubmit={handleSubmit(onSubmitStep2)}>
              <Box display="flex" flexDirection="column" gap={2}>
                <input
                  type="text"
                  name="fake-email"
                  autoComplete="username"
                  style={{ display: "none" }}
                  tabIndex={-1}
                />

                <AMFormControl fullWidth>
                  <AMFormLabel>Código de verificación</AMFormLabel>
                  <Controller
                    name="code"
                    control={control}
                    rules={{ required: "Campo Requerido" }}
                    render={({ field }) => (
                      <AMTextField
                        valuestatus={determinaValidez("code")}
                        color="AMLightBlue"
                        {...field}
                        variant="outlined"
                        autoComplete="off"
                      />
                    )}
                  />
                  <span className="error-message">{errors.code?.message}</span>
                </AMFormControl>

                <AMFormControl fullWidth>
                  <AMFormLabel>Nueva contraseña</AMFormLabel>
                  <Controller
                    name="newPassword"
                    control={control}
                    rules={{
                      required: "Campo Requerido",
                      minLength: { value: 6, message: "Mínimo 6 caracteres" },
                    }}
                    render={({ field }) => (
                      <AMTextField
                        type="password"
                        valuestatus={determinaValidez("newPassword")}
                        color="AMLightBlue"
                        {...field}
                        variant="outlined"
                      />
                    )}
                  />
                  <span className="error-message">{errors.newPassword?.message}</span>
                </AMFormControl>

                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                  Confirmar nueva contraseña
                </Button>

                {error && <Alert severity="error">{error}</Alert>}
              </Box>
            </form>
          </>
        )}

        <Divider sx={{ my: 1 }} />
        <Button variant="outlined" onClick={() => router.push("/login")}>
          Volver al login
        </Button>
      </Box>
    </Container>
  );
}
