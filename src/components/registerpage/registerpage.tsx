"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Button, Container, Typography, IconButton, Alert, Divider } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { AMFormControl, AMFormLabel, AMTextField, AMLinkButton } from "../styledcomponents";
import { createUser, verifySignupCode, resendVerificationCode } from "@/services/auth.service";

const SITE_KEY = "6LfN7lUrAAAAAJbfWhc547oEXClBvE5aEW_TY6NW"; // remplaza con tu clave pública de reCAPTCHA

// Fondo de los inputs: tono gris-azulado suave para contrastar con la tarjeta blanca
const FIELD_BG = "#edf2f9";
const fieldSx = {
  "& .MuiOutlinedInput-input": { backgroundColor: FIELD_BG },
  "& .MuiOutlinedInput-input:-webkit-autofill": {
    WebkitBoxShadow: `0 0 0 1000px ${FIELD_BG} inset`,
    WebkitTextFillColor: "#0d1a28",
  },
};

interface RegisterFormModel {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  recaptchaToken: string;
}

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  // ---- Paso 2: verificación por código ----
  const [step, setStep] = useState<"form" | "verify">("form");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const router = useRouter();

  // Entrada directa al paso de verificación (desde el login: /login/register?step=verify&email=…)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("step") === "verify") {
      const email = params.get("email") ?? "";
      if (email) {
        setVerifyEmail(email);
        setStep("verify");
      }
    }
  }, []);

  // Countdown para reenvío de código
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    watch,
    trigger,
    formState: { isDirty, isValid, errors, touchedFields, dirtyFields },
  } = useForm<RegisterFormModel>({
    mode: "onChange",
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      recaptchaToken: "",
    },
  });

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    recaptchaToken: "",
  } as RegisterFormModel);

  const onSubmit = async (data: RegisterFormModel) => {
    setError("");

    if (data.password !== data.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await createUser({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
      });
      setError("");
      // Paso 2: Cognito envió el código de verificación al correo
      setVerifyEmail(data.email);
      setVerifyPassword(data.password);
      setStep("verify");
    } catch (err: any) {
      setError(err.message || "Error al registrar");
    }
  };

  /** Paso 2: valida el código y entra a la app */
  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setVerifyError("");
    setResendMsg("");

    const password = verifyPassword || getValues("password") || "";
    if (verifyCode.trim().length < 6) {
      setVerifyError("Ingresa el código de 6 dígitos que enviamos a tu correo.");
      return;
    }
    if (!password) {
      setVerifyError("Ingresa tu contraseña para completar el acceso.");
      return;
    }

    try {
      setVerifyBusy(true);
      await verifySignupCode({ email: verifyEmail, password, code: verifyCode.trim() });
      router.push("/inicio");
    } catch (err: any) {
      setVerifyError(err?.message || "No se pudo verificar el código.");
    } finally {
      setVerifyBusy(false);
    }
  };

  const handleResendCode = async () => {
    setResendMsg("");
    try {
      const msg = await resendVerificationCode(verifyEmail);
      setResendMsg(msg);
      setCountdown(60);
    } catch (err: any) {
      setResendMsg(err?.message || "No se pudo reenviar el código.");
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    // Actualizar el estado formData con los nuevos valores
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleCaptchaChange = (token: string | null) => {
    if (token) {
      setValue("recaptchaToken", token);
      setRecaptchaVerified(true);
    } else {
      setRecaptchaVerified(false);
    }
  };

  const determinaValidez = (fieldName: keyof RegisterFormModel) => {
    return errors[fieldName] ? 2 : dirtyFields[fieldName] ? (touchedFields[fieldName] ? 1 : 0) : 0;
  };

  const [passwordValue, setPasswordValue] = useState("");
  const [allowVisibilityToggle, setAllowVisibilityToggle] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevLengthRef = useRef<number>(0);
  const prevValueRef = useRef<string>("");

  const [showPasswordTwo, setShowPasswordTwo] = useState(false);
  const [allowVisibilityToggleTwo, setAllowVisibilityToggleTwo] = useState(false);
  const inputRefTwo = useRef<HTMLInputElement>(null);
  const prevLengthRefTwo = useRef<number>(0);
  const prevValueRefTwo = useRef<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    const currentLength = value.length;
    const prevLength = prevLengthRef.current;
    const prevValue = prevValueRef.current;

    setPasswordValue(value);
    //console.log("passwordValue:", value, "len:", currentLength, "prevLen:", prevLength, "prevVal:", prevValue);

    const sameLengthButDifferent = currentLength === prevLength && value !== prevValue;
    //console.log("sameLengthButDifferent: ", sameLengthButDifferent)

    // Reiniciar si se vacía completamente
    if (currentLength === 0) {
      setAllowVisibilityToggle(false);
      //console.log(" Reinicio detectado: toggle desactivado y reiniciado");
    }

    // Activar solo si es un incremento limpio (de 0 → 1)
    else if (prevLength === 0 && currentLength === 1) {
      setAllowVisibilityToggle(true);
      //console.log(" Activando toggle (primer input manual detectado)");
    }
    // O activar  si es un incremento limpio (de 1 → 2)
    else if (prevLength === 1 && currentLength === 2) {
      setAllowVisibilityToggle(true);
      //console.log(" Activando toggle (primer input manual detectado)");
    }

    // Cualquier salto extraño (mayor a +1 o decremento) se considera sospechoso
    else if (
      currentLength - prevLength > 1 || // incremento mayor a 1
      currentLength < prevLength || // decremento
      sameLengthButDifferent // mismo tamaño, distinto valor
    ) {
      setAllowVisibilityToggle(false);
      //console.log(" Desactivando toggle (cambio sospechoso: pegado, reemplazo o decremento)");
    }

    prevLengthRef.current = currentLength;
    prevValueRef.current = value;
  };

  const handleChangeTwo = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    const currentLength = value.length;
    const prevLength = prevLengthRefTwo.current;
    const prevValue = prevValueRefTwo.current;

    setPasswordValue(value);
    //console.log("passwordValue:", value, "len:", currentLength, "prevLen:", prevLength, "prevVal:", prevValue);

    const sameLengthButDifferent = currentLength === prevLength && value !== prevValue;
    //console.log("sameLengthButDifferent: ", sameLengthButDifferent)

    // Reiniciar si se vacía completamente
    if (currentLength === 0) {
      setAllowVisibilityToggleTwo(false);
      //console.log(" Reinicio detectado: toggle desactivado y reiniciado");
    }

    // Activar solo si es un incremento limpio (de 0 → 1)
    else if (prevLength === 0 && currentLength === 1) {
      setAllowVisibilityToggleTwo(true);
      //console.log(" Activando toggle (primer input manual detectado)");
    }
    // O activar  si es un incremento limpio (de 1 → 2)
    else if (prevLength === 1 && currentLength === 2) {
      setAllowVisibilityToggleTwo(true);
      //console.log(" Activando toggle (primer input manual detectado)");
    }

    // Cualquier salto extraño (mayor a +1 o decremento) se considera sospechoso
    else if (
      currentLength - prevLength > 1 || // incremento mayor a 1
      currentLength < prevLength || // decremento
      sameLengthButDifferent // mismo tamaño, distinto valor
    ) {
      setAllowVisibilityToggleTwo(false);
      //console.log(" Desactivando toggle (cambio sospechoso: pegado, reemplazo o decremento)");
    }

    prevLengthRefTwo.current = currentLength;
    prevValueRefTwo.current = value;
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      const inputValue = inputRef.current?.value || "";
      prevLengthRef.current = inputValue.length; // inicia prevLength
      //console.log(" useEffect (on mount) inputValue:", inputValue, "length:", inputValue.length);

      if (inputValue.length === 0) {
        setAllowVisibilityToggle(false); // Aún sin escribir
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const inputValue = inputRefTwo.current?.value || "";
      prevLengthRefTwo.current = inputValue.length; // inicia prevLength
      //console.log(" useEffect (on mount) inputValue:", inputValue, "length:", inputValue.length);

      if (inputValue.length === 0) {
        setAllowVisibilityToggleTwo(false); // Aún sin escribir
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "password") {
        trigger("confirmPassword");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, trigger]);

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
          Crear cuenta
        </Typography>

        {/* ================= PASO 2: VERIFICACIÓN POR CÓDIGO ================= */}
        {step === "verify" && (
          <Box
            component="form"
            onSubmit={handleVerify}
            display="flex"
            flexDirection="column"
            gap={2}
          >
            <Alert severity="success">
              Te enviamos un código de verificación a <strong>{verifyEmail}</strong>. Revisa también
              tu carpeta de spam.
            </Alert>
            {verifyError && <Alert severity="error">{verifyError}</Alert>}
            {resendMsg && <Alert severity="info">{resendMsg}</Alert>}

            <AMFormControl fullWidth>
              <AMFormLabel>Código de verificación (6 dígitos)</AMFormLabel>
              <AMTextField
                id="txt_codigo_verificacion"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputProps={{ inputMode: "numeric", maxLength: 6, style: { letterSpacing: 8, textAlign: "center" } }}
                variant="outlined"
                fullWidth
                sx={fieldSx}
              />
            </AMFormControl>

            <AMFormControl fullWidth>
              <AMFormLabel>Contraseña</AMFormLabel>
              <AMTextField
                id="txt_contrasena_verificacion"
                type={showPassword ? "text" : "password"}
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                variant="outlined"
                fullWidth
                sx={fieldSx}
                autoComplete="current-password"
              />
              <span className="error-message">
                {verifyPassword ? "" : "Ingresa tu contraseña para completar el acceso"}
              </span>
            </AMFormControl>

            <Button fullWidth type="submit" variant="contained" disabled={verifyBusy}>
              {verifyBusy ? "Verificando…" : "Verificar mi cuenta"}
            </Button>

            <Button
              variant="outlined"
              disabled={countdown > 0}
              onClick={() => void handleResendCode()}
            >
              {countdown > 0 ? `Reenviar código (${countdown}s)` : "Reenviar código"}
            </Button>

            <Divider sx={{ my: 3 }} />
            <Button variant="text" onClick={() => setStep("form")}>
              Corregir mis datos
            </Button>
          </Box>
        )}

        {/* ================= PASO 1: FORMULARIO DE REGISTRO ================= */}
        {step === "form" && (
        <>
        {error && <Alert severity="error">{error}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" flexDirection="column" gap={2}>
            <AMFormControl fullWidth>
              <AMFormLabel>Nombre completo</AMFormLabel>
              <Controller
                name="displayName"
                control={control}
                rules={{
                  required: "Campo Requerido",
                }}
                render={({ field }) => {
                  return (
                    <AMTextField
                      id="txt_username_registroform"
                      valuestatus={determinaValidez("displayName")}
                      color={"AMLightBlue"}
                      sx={fieldSx}
                      {...field}
                      variant="outlined"
                    />
                  );
                }}
              />
              <span className="error-message">{errors.displayName?.message}</span>
            </AMFormControl>

            <AMFormControl fullWidth>
              <AMFormLabel>Correo electrónico</AMFormLabel>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Campo Requerido",
                  validate: {
                    matchPattern: (
                      v //match pattern indica que necesitamos que el campo cumpla el patron
                    ) =>
                      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(v) || //Este es un regex, que valida que metan un correo valido y luego usa el metodo .test, donde v es el valor de entrada del input
                      "Ingrese un correo válido", //Lo que dice es que en caso de que el testeo salga verdadero, entonces deja pasar, si no, muestra el error de introduce un correo valido
                  },
                }}
                render={({ field }) => {
                  return (
                    <AMTextField
                      id="txt_email_registroform"
                      valuestatus={determinaValidez("email")}
                      color={"AMLightBlue"}
                      sx={fieldSx}
                      {...field}
                      variant="outlined"
                    />
                  );
                }}
              />
              <span className="error-message">{errors.email?.message}</span>
            </AMFormControl>

            {/* input FAKE para evitsar el autofill */}
            <input
              type="text"
              name="fake-user"
              autoComplete="email"
              tabIndex={-1}
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
            />

            <AMFormControl fullWidth>
              <AMFormLabel>Contraseña</AMFormLabel>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: "Campo Requerido",
                  validate: {
                    noSpaces: (v) => !/\s/.test(v) || "La contraseña no debe contener espacios",
                    matchPattern: (v) =>
                      /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(v) || //Este es un regex, que valida que metan un correo valido y luego usa el metodo .test, donde v es el valor de entrada del input
                      "La contraseña debe incluir al menos 8 caractéres, una letra mayúscula y un caracter especial", //Lo que dice es que en caso de que el testeo salga verdadero, entonces deja pasar, si no, muestra el error de introduce un correo valido
                  },
                }}
                render={({ field }) => {
                  return (
                    <div style={{ position: "relative", width: "100%" }}>
                      <AMTextField
                        inputRef={inputRef}
                        id="txt_contrasena_loginform"
                        type={showPassword ? "text" : "password"}
                        valuestatus={determinaValidez("password")}
                        color="AMLightBlue"
                        sx={fieldSx}
                        {...field}
                        variant="outlined"
                        tabIndex={2}
                        autoComplete="new-password"
                        onChange={(e) => {
                          field.onChange(e); // Para react-hook-form
                          handleChange(e); // Nuestra lógica de visibilidad
                        }}
                        fullWidth
                      />
                      <IconButton
                        aria-label="toggle password visibility"
                        onMouseDown={() => setShowPassword(true)}
                        onMouseUp={() => setShowPassword(false)}
                        onMouseLeave={() => setShowPassword(false)}
                        disabled={!allowVisibilityToggle}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          backgroundColor: "transparent",
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </div>
                  );
                }}
              />
              <span className="error-message">{errors.password?.message}</span>
            </AMFormControl>

            <AMFormControl fullWidth>
              <AMFormLabel>Confirmar contraseña</AMFormLabel>
              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  required: "Confirma tu contraseña",
                  validate: (value) =>
                    value === watch("password") || "Las contraseñas no coinciden",
                }}
                render={({ field }) => {
                  return (
                    <div style={{ position: "relative", width: "100%" }}>
                      <AMTextField
                        inputRef={inputRefTwo}
                        id="txt_contrasena_loginform"
                        type={showPasswordTwo ? "text" : "password"}
                        valuestatus={determinaValidez("confirmPassword")}
                        color="AMLightBlue"
                        sx={fieldSx}
                        {...field}
                        variant="outlined"
                        tabIndex={2}
                        autoComplete="new-password"
                        onChange={(e) => {
                          field.onChange(e); // Para react-hook-form
                          handleChangeTwo(e); // Nuestra lógica de visibilidad
                        }}
                        fullWidth
                      />
                      <IconButton
                        aria-label="toggle password visibility"
                        onMouseDown={() => setShowPasswordTwo(true)}
                        onMouseUp={() => setShowPasswordTwo(false)}
                        onMouseLeave={() => setShowPasswordTwo(false)}
                        disabled={!allowVisibilityToggleTwo}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          backgroundColor: "transparent",
                        }}
                      >
                        {showPasswordTwo ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </div>
                  );
                }}
              />
              <span className="error-message">{errors.confirmPassword?.message}</span>
            </AMFormControl>

            {/* reCAPTCHA */}
            <Box mt={2} mb={2} display="flex" justifyContent="center">
              <ReCAPTCHA ref={recaptchaRef} sitekey={SITE_KEY} onChange={handleCaptchaChange} />
            </Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={!isValid || !recaptchaVerified}
            >
              Registrar cuenta
            </Button>

            <Divider sx={{ my: 3 }} />

            <Button variant="outlined" onClick={() => router.push("/login")}>
              Volver al login
            </Button>
          </Box>
        </form>
        </>
        )}
      </Box>
    </Container>
  );
}
