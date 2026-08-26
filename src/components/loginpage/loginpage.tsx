"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { useRouter } from "next/navigation";

import { loginWithEmail, loginWithGoogle, resendVerificationCode } from "@/services/auth.service";
import GoogleLoginButton from "../buttongoogle/buttongoogle";
import InstallAppButton from "../ui/installappbutton";
import PushPromptCard from "@/components/ui/pushpromptcard";
import { getUserInfo } from "@/services/xstorage.cross.service";
import Link from "next/link";

// Modelo del formulario
export class LoginFormModel {
  username: string = "";
  password: string = "";
}

/**
 * Login KetoFlow: mobile-first, tarjeta centrada con inputs grandes.
 * La lógica de autenticación no cambia (Cognito email/password + Google).
 */
export default function LoginPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  // Errores del callback de Google (?googleError=…)
  const [googleAlert, setGoogleAlert] = useState<{ msg: string; needRegister: boolean } | null>(null);
  // Correo no verificado en login normal → ofrecer reenvío de código
  const [notConfirmedEmail, setNotConfirmedEmail] = useState("");
  const [resendInfo, setResendInfo] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [allowVisibilityToggle, setAllowVisibilityToggle] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevLengthRef = useRef<number>(0);
  const prevValueRef = useRef<string>("");
  const router = useRouter();
  const userInfo = getUserInfo();
  const model = new LoginFormModel();

  // Redirect del interceptor al expirar la sesión (/login?expired=1)
  // y errores del callback de Google (/login?googleError=…)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setSessionExpired(params.get("expired") === "1");

    const googleError = params.get("googleError");
    if (googleError === "GOOGLE_NO_EXISTE") {
      setGoogleAlert({
        msg: "Tu cuenta de Google aún no existe en KetoFlow. Primero crea tu cuenta con correo y contraseña.",
        needRegister: true,
      });
      sessionStorage.removeItem("kf-google-attempt");
    } else if (googleError) {
      setGoogleAlert({
        msg: "No se pudo completar el acceso con Google. Inténtalo de nuevo.",
        needRegister: false,
      });
      sessionStorage.removeItem("kf-google-attempt");
    } else {
      // Red de seguridad: el hosted UI falló SIN devolver ?error=… a /dashboard.
      // Si hay una marca de intento reciente (<5 min), avisar igualmente.
      const attempt = Number(sessionStorage.getItem("kf-google-attempt") ?? 0);
      if (attempt && Date.now() - attempt < 5 * 60 * 1000) {
        setGoogleAlert({
          msg: "No se pudo completar el acceso con Google. Verifica que tu cuenta de KetoFlow exista; si no, créala primero con tu correo y contraseña.",
          needRegister: true,
        });
      }
      if (attempt) sessionStorage.removeItem("kf-google-attempt");
    }
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormModel>({
    mode: "onChange",
    defaultValues: model,
  });

  const onSubmit = async (data: LoginFormModel) => {
    const { username, password } = data;
    try {
      await loginWithEmail({ email: username, password: password });
      setSuccess(true);
      setError("");
      router.push("/dashboard");
    } catch (error: any) {
      setSuccess(false);
      // Mostrar el mensaje específico en español (mapAuthError)
      setError(error instanceof Error ? error.message : "Credenciales incorrectas");

      // Cuenta creada pero sin confirmar → llevar DIRECTO a ingresar el código
      if (error?.code === "NOT_CONFIRMED") {
        router.replace(
          `/login/register?step=verify&email=${encodeURIComponent(username)}`
        );
        return;
      }
      setNotConfirmedEmail("");
      setResendInfo("");
    }
  };

  const handleResendCode = async () => {
    if (!notConfirmedEmail) return;
    try {
      const msg = await resendVerificationCode(notConfirmedEmail);
      setResendInfo(msg);
    } catch (error: any) {
      setResendInfo(error?.message || "No se pudo reenviar el código.");
    }
  };

  const handleLoginGoogle = async () => {
    try {
      await loginWithGoogle();
      setSuccess(true);
      setError("");
      // El redirect lo maneja Cognito
    } catch (error) {
      setError("Error al iniciar sesión con Google.");
    }
  };

  // --- Lógica de visibilidad de contraseña (protege contra autocompletado) ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    const currentLength = value.length;
    const prevLength = prevLengthRef.current;
    const prevValue = prevValueRef.current;

    setPasswordValue(value);

    const sameLengthButDifferent = currentLength === prevLength && value !== prevValue;

    if (currentLength === 0) {
      setAllowVisibilityToggle(false);
    } else if (prevLength === 0 && currentLength === 1) {
      setAllowVisibilityToggle(true);
    } else if (prevLength === 1 && currentLength === 2) {
      setAllowVisibilityToggle(true);
    } else if (
      currentLength - prevLength > 1 ||
      currentLength < prevLength ||
      sameLengthButDifferent
    ) {
      setAllowVisibilityToggle(false);
    }

    prevLengthRef.current = currentLength;
    prevValueRef.current = value;
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      const inputValue = inputRef.current?.value || "";
      prevLengthRef.current = inputValue.length;
      if (inputValue.length === 0) {
        setAllowVisibilityToggle(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      {/* Notificaciones: pedir permiso al abrir (queda pendiente hasta iniciar sesión) */}
      <PushPromptCard />

      {/* Mensajes */}
      {sessionExpired && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 3 }}>
          Tu sesión expiró. Inicia sesión de nuevo para continuar.
        </Alert>
      )}
      {/* Errores del login con Google */}
      {googleAlert && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {googleAlert.msg}
          {googleAlert.needRegister && (
            <>
              {" "}
              <Link href="/login/register" style={{ fontWeight: 700 }}>
                Crear cuenta
              </Link>
            </>
          )}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {error}
        </Alert>
      )}
      {notConfirmedEmail && (
        <Alert
          severity="warning"
          sx={{ mb: 2, borderRadius: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => void handleResendCode()}>
              Reenviar código
            </Button>
          }
        >
          Tu correo aún no está verificado.
          {resendInfo ? ` ${resendInfo}` : " Te enviamos un código al registrarte."} Luego verifica
          tu cuenta desde{" "}
          <Link href={`/login/register?step=verify&email=${encodeURIComponent(notConfirmedEmail)}`}>
            Crear cuenta
          </Link>
          .
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>
          ¡Inicio de sesión exitoso!
        </Alert>
      )}

      {/* Tarjeta del formulario */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: "24px",
          border: "1px solid",
          borderColor: "#e2e8f0",
          boxShadow: "0 12px 40px rgba(15, 23, 42, 0.06)",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box display="flex" flexDirection="column" gap={2.5}>
            {/* Correo */}
            <Controller
              name="username"
              control={control}
              rules={{
                required: "Campo requerido",
                validate: {
                  matchPattern: (v) =>
                    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
                    "Ingrese un correo válido",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="txt_correo_loginform"
                  label="Correo electrónico"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  fullWidth
                  size="small"
                  error={!!errors.username}
                  helperText={errors.username?.message ?? " "}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 999 },
                  }}
                />
              )}
            />

            {/* Contraseña */}
            <Controller
              name="password"
              control={control}
              rules={{ required: "Campo requerido" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="txt_contrasena_loginform"
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  fullWidth
                  size="small"
                  error={!!errors.password}
                  helperText={errors.password?.message ?? " "}
                  inputRef={inputRef}
                  onChange={(e) => {
                    field.onChange(e);
                    handleChange(e);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onMouseDown={() => setShowPassword(true)}
                          onMouseUp={() => setShowPassword(false)}
                          onMouseLeave={() => setShowPassword(false)}
                          onTouchStart={() => setShowPassword(true)}
                          onTouchEnd={() => setShowPassword(false)}
                          disabled={!allowVisibilityToggle}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 999 },
                  }}
                />
              )}
            />

            {/* Links */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Link href="/login/register" style={{ textDecoration: "none" }}>
                <Typography variant="body2" color="primary" fontWeight={600}>
                  Crear cuenta
                </Typography>
              </Link>
              <Link href="/login/forgotpassword" style={{ textDecoration: "none" }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Olvidé mi contraseña
                </Typography>
              </Link>
            </Box>

            {/* Botón principal */}
            <Button
              id="btn_iniciarsesion_loginform"
              type="submit"
              variant="contained"
              disabled={!isValid}
              fullWidth
              sx={{ py: 1.6, fontSize: 16 }}
            >
              Iniciar sesión
            </Button>

            {/* Divisor */}
            <Divider>
              <Typography variant="caption" color="text.secondary" px={1}>
                ó
              </Typography>
            </Divider>

            {/* Google */}
            <Box display="flex" justifyContent="center" width="100%">
              <GoogleLoginButton
                onClick={handleLoginGoogle}
                userEmail={userInfo.email}
                userName={userInfo.userName}
                userAvatar={userInfo.photoURL}
              />
            </Box>

            {/* Instalación PWA */}
            <InstallAppButton />
          </Box>
        </form>
      </Paper>

      {/* Refuerzo de marca abajo */}
      <Typography
        variant="caption"
        display="block"
        textAlign="center"
        color="text.secondary"
        mt={4}
        px={2}
      >
        Registra tu progreso. Celebra tus logros. Comparte el camino.
      </Typography>
    </>
  );
}
