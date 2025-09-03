"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Button, Container, Typography, IconButton, Alert, Divider } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useRouter } from "next/navigation";

// Tu estilo y componentes personalizados
import { AMFormControl, AMFormLabel, AMTextField, AMLinkButton } from "../styledcomponents";
import { loginWithEmail, loginWithGoogle } from "@/services/auth.service";
import GoogleLoginButton from "../buttongoogle/buttongoogle";
import { getUserInfo } from "@/services/xstorage.cross.service";
import Link from "next/link";
// import styles from './LoginPage.module.css' // si tienes estilos locales

// Modelo del formulario
export class LoginFormModel {
  username: string = "";
  password: string = "";
}

// Componente principal
export default function LoginPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [allowVisibilityToggle, setAllowVisibilityToggle] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevLengthRef = useRef<number>(0);
  const prevValueRef = useRef<string>("");
  const router = useRouter();
  const userInfo = getUserInfo();
  const model = new LoginFormModel();

  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields, touchedFields, isValid, isDirty },
    setValue,
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
    } catch (error) {
      setSuccess(false);
      setError("Credenciales incorrectas");
    }
  };

  const handleLoginGoogle = async () => {
    try {
      await loginWithGoogle();
      setSuccess(true);
      setError("");
      //router.push("/dashboard");
    } catch (error) {
      setError("Error al iniciar sesión con Google.");
    }
  };

  const formularioRef = useRef<HTMLFormElement | null>(null);

  //   const handleFormSubmit = (data: LoginFormModel) => {
  //     //Se manda a llamar al metodo proporcionado por el padre del form
  //     //De esta manera en caso de un cambio de logica para el llamado del api
  //     //Se realiza directamente en el padre, quien maneja la logica del contenido a travez de los componentes sin afectar el contenido del child
  //     formProps.onSubmit(data);
  //   };

  const determinaValidez = (fieldName: keyof LoginFormModel) => {
    return errors[fieldName] ? 2 : dirtyFields[fieldName] ? (touchedFields[fieldName] ? 1 : 0) : 0;
  };

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
          Iniciar sesión
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">¡Inicio de sesión exitoso!</Alert>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Campo Usuario */}
            <AMFormControl component="fieldset">
              <AMFormLabel component="legend">Correo electrónico</AMFormLabel>
              <Controller
                name="username"
                control={control}
                rules={{
                  required: "Campo Requerido",
                  validate: {
                    matchPattern: (v) =>
                      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
                      "Ingrese un correo válido",
                  },
                }}
                render={({ field }) => (
                  <AMTextField
                    id="txt_correo_loginform"
                    valuestatus={determinaValidez("username")}
                    color="AMLightBlue"
                    variant="outlined"
                    tabIndex={1}
                    {...field}
                  />
                )}
              />
              <span className="error-message">{errors.username?.message}</span>
            </AMFormControl>

            {/* Campo Contraseña */}
            <AMFormControl component="fieldset">
              <AMFormLabel component="legend">Contraseña</AMFormLabel>
              <Controller
                name="password"
                control={control}
                rules={{ required: "Campo Requerido" }}
                render={({ field }) => (
                  <Box position="relative">
                    <AMTextField
                      inputRef={inputRef}
                      id="txt_contrasena_loginform"
                      type={showPassword ? "text" : "password"}
                      valuestatus={determinaValidez("password")}
                      color="AMLightBlue"
                      variant="outlined"
                      tabIndex={2}
                      {...field}
                      fullWidth
                      onChange={(e) => {
                        field.onChange(e); // Para react-hook-form
                        handleChange(e); // Nuestra lógica de visibilidad
                      }}
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
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Box>
                )}
              />
              <span className="error-message">{errors.password?.message}</span>
            </AMFormControl>

            {/* Olvidé mi contraseña */}
            {/* Registrar cuenta y Olvidé mi contraseña en la misma línea */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              mt={0}
              px={5}
            >
              {/* Registrar cuenta */}
              <AMLinkButton
                id="btn_registrarcuenta_loginform"
                tabIndex={19}
                component={Link}
                href="/login/register"
              >
                ¿Aún no tienes una cuenta? Registrate aquí
              </AMLinkButton>
              <span style={{ color: "grey" }}> / </span>
              {/* Olvidé mi contraseña */}
              <AMLinkButton
                id="btn_olvidecontrasena_loginform"
                tabIndex={20}
                component={Link}
                href="/login/forgotpassword"
              >
                Olvidé mi contraseña
              </AMLinkButton>
            </Box>

            {/* Botón Ingresar */}
            <Button
              id="btn_iniciarsesion_loginform"
              type="submit"
              variant="contained"
              color="primary"
              disabled={!isValid}
              fullWidth
              sx={{ py: 1.5, fontWeight: 600 }}
            >
              Ingresar
            </Button>

            <Box display="flex" alignItems="center" my={3}>
              <Divider sx={{ flexGrow: 1, borderColor: "grey.400" }} />
              <Typography
                sx={{
                  mx: 2,
                  color: "text.secondary",
                  fontWeight: "bold",
                  userSelect: "none",
                }}
                variant="body1"
              >
                ó
              </Typography>
              <Divider sx={{ flexGrow: 1, borderColor: "grey.400" }} />
            </Box>

            <GoogleLoginButton
              onClick={handleLoginGoogle}
              userEmail={userInfo.email}
              userName={userInfo.userName}
              userAvatar={userInfo.photoURL} // usa la URL del avatar o una imagen local
            />
          </Box>
        </form>
      </Box>
    </Container>
  );
}
