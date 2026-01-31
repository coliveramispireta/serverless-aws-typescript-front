
import { createMember } from "@/services/bets/createmember.service";
import { getBets } from "@/services/bets/getbets.service";
import { listMembers } from "@/services/bets/listmembers.service";
import { registrarPago } from "@/services/bets/registrarpago.service";
import { getUserInfo } from "@/services/xstorage.cross.service";
import { use, useEffect, useState } from "react";
import { AlertData } from "../alertcustom/alertcustom";

interface ParticipanteUI {
  nombre: string;
  nombreCompleto: string;
  pesoInicial: number;
  pesoActual: number;
  pesoIdeal: number;
  avatar: string;
  progreso: string;
}

interface FondosApuestas {
  [key: string]: {
    [participante: string]: number;
  };
}

export default function useFitnessHook() {
  const [tab, setTab] = useState(0);
  const [alert, setAlert] = useState<AlertData | null>(null);
  const [tipoApuesta, setTipoApuesta] = useState("mensual");
  const [participanteSeleccionado, setParticipanteSeleccionado] = useState("");
  const [montoApuesta, setMontoApuesta] = useState("");
  const [participantes, setParticipantes] = useState<ParticipanteUI[]>([]);
  const [montoSeleccionado, setMontoSeleccionado] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [fondosApuestas, setFondosApuestas] = useState<FondosApuestas>({
    semanal: {},
    mensual: {},
    final: {},
  });

  const handleOpenAlert = (type: "success" | "error" | "info" | "warning", msg: string) => {
    //console.log("Open alert: ", type, msg);
    setAlert({ type, msg });
  };


  const [pagoData, setPagoData] = useState({
    nombreTitular: "",
    fechaHora: "",
    numeroOperacion: "",
  });
  const userinfo = getUserInfo();

  useEffect(() => {
     fetchMembers();
     fetchBets();
  }, []);

  const fetchMembers = () => {
        listMembers().then((data) => {
          const normalized = data.map((p: any) => ({
            ...p,
            nombre: p.nombreCompleto,
            pesoInicial: p.pesoActual, // inicial = actual al inicio
            progreso: "/progreso1.png",
            avatar:   p.nombreCompleto.toLowerCase().includes("sergio") ? "/bets/sergio.png" 
                    : p.nombreCompleto.toLowerCase().includes("carlos") ? "/bets/carlos.jpeg"  
                    : p.nombreCompleto.toLowerCase().includes("pablo") ? "/bets/pablo.jpeg" 
                    : "/bets/avatar_men.jpg",
          }));
          setParticipantes(normalized);
        });
    };


  const fetchBets = async () => {
    try {
      const data = await getBets();
      
      // Organizar las apuestas por tipo y participante
      const fondosOrganizados: FondosApuestas = {
        semanal: {},
        mensual: {},
        final: {},
      };

      data.forEach((apuesta: any) => {
        const tipo = apuesta.tipoApuesta;
        const participante = apuesta.participante;
        const monto = apuesta.monto;

        if (!fondosOrganizados[tipo]) {
          fondosOrganizados[tipo] = {};
        }

        if (!fondosOrganizados[tipo][participante]) {
          fondosOrganizados[tipo][participante] = 0;
        }

        // Solo sumar apuestas confirmadas/validadas (no pendientes ni rechazadas)
        if (apuesta.estado === "confirmado" || apuesta.estado === "validado") {
          fondosOrganizados[tipo][participante] += monto;
        }
      });

      setFondosApuestas(fondosOrganizados);
    } catch (error) {
      console.error("Error al obtener apuestas:", error);
    }
  };

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
      else if (ancho >= 15 && ancho <= 18) estructura = "mediana";
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
      fetchMembers();
      setTab(1);
      handleOpenAlert("success", "¡Inscripción exitosa! Bienvenido al reto WFC");
    } catch (error) {
      console.error("Error en inscripción:", error);
      handleOpenAlert("error", "Error al registrar la inscripción");
    }
  };


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



  const costoPorInscripcion = 200;
  const pozoPremioInscripciones = participantes.length * costoPorInscripcion;

  const fondoActual = fondosApuestas[tipoApuesta as keyof typeof fondosApuestas];
  const totalFondoApuestas = Object.values(fondoActual).reduce((sum, val) => sum + val, 0);


  const montosDisponibles = [5, 10, 20, 50, 100];
  
    const handleMontoClick = (monto: number) => {
      if (!participanteSeleccionado) {
        handleOpenAlert("warning","Primero selecciona un participante");
        return;
      }
      setMontoSeleccionado(monto);
      setModalOpen(true);
    };
  
    const handlePagoInputChange = (field: string, value: string) => {
      setPagoData((prev) => ({ ...prev, [field]: value }));
    };
  
    const handleRegistrarPago = async () => {
      // Validaciones
      if (!pagoData.nombreTitular || !pagoData.fechaHora || !pagoData.numeroOperacion) {
        handleOpenAlert("warning","Por favor completa todos los campos");
        return;
      }
  
      if (!participanteSeleccionado || !montoSeleccionado) {
        handleOpenAlert("warning", "Datos incompletos");
        return;
      }
  
      try {
        // TODO: Consumir servicio de registro de pago
        const body = {
          participante: participanteSeleccionado,
          monto: montoSeleccionado,
          tipoApuesta: tipoApuesta,
          nombreTitular: pagoData.nombreTitular,
          fechaHora: pagoData.fechaHora,
          numeroOperacion: pagoData.numeroOperacion,
          email: userinfo.email, // Se agregará desde el hook
          estado: "pendiente",
        };
  
        console.log("Registrando pago:", body);
        
      await registrarPago(body);
      
      // Refrescar las apuestas después de registrar
      await fetchBets();
  
        handleOpenAlert("success","¡Pago registrado exitosamente! Está pendiente de validación.");
        handleCloseModal();
      } catch (error) {
        console.error("Error al registrar pago:", error);
        handleOpenAlert("error","Error al registrar el pago. Intenta nuevamente.");
      }
    };
  
    const handleCloseModal = () => {
      setModalOpen(false);
      setMontoSeleccionado(null);
      setPagoData({
        nombreTitular: "",
        fechaHora: "",
        numeroOperacion: "",
      });
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

  return {
    formData,
    handleInputChange,
    calcularPesoIdeal,
    handleInscripcion,
    participantesConProgreso,
    fondoActual,
    totalFondoApuestas,
    pozoPremioInscripciones,
    tipoApuesta,
    setTipoApuesta,
    participanteSeleccionado,
    setParticipanteSeleccionado,
    montoApuesta,
    setMontoApuesta,
    pesoIdealCalculado,
    tab,
    setTab,
    textFieldStyles,
    costoPorInscripcion,
    estructuraOsea,
    todosLosCamposLlenos,
    participantes,
    montosDisponibles,
    handleMontoClick,
    modalOpen,
    handleCloseModal,
    montoSeleccionado,
    pagoData,
    handleRegistrarPago,
    handlePagoInputChange,
    alert,
    setAlert
  };
}
