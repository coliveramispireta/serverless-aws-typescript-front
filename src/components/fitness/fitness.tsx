"use client";

import {
  Box,
  Container,
  Tab,
  Tabs,
  Typography,
  Paper
} from "@mui/material";
import {
  EmojiEvents,
  Person,
  AttachMoney
} from "@mui/icons-material";
import { Inscription } from "./inscription";
import { Ranking } from "./ranking";
import { Bets } from "./bets";
import useFitnessHook from "./usefitnesshook";
import LoadingComponent from "../loadingcomponent/loadingcomponent";
import CustomAlert from "../alertcustom/alertcustom";
import { useEffect } from "react";



export const Fitness = () => {
 
  const {
    tab,
    setTab,
    alert,
    setAlert,
    textFieldStyles,
    formData,
    handleInputChange,
    calcularPesoIdeal,
    handleInscripcion,
    pesoIdealCalculado,
    costoPorInscripcion,
    estructuraOsea,
    todosLosCamposLlenos,
    participantesConProgreso,
    pozoPremioInscripciones,
    participantes,            
    fondoActual,
    totalFondoApuestas,
    tipoApuesta,
    setTipoApuesta,
    participanteSeleccionado,
    setParticipanteSeleccionado,
    montosDisponibles,
    handleMontoClick,
    modalOpen,
    handleCloseModal,
    montoSeleccionado,
    pagoData,
    handleRegistrarPago,
    handlePagoInputChange
  } = useFitnessHook();


  return (
    <>
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
            <Tab disabled icon={<EmojiEvents />} iconPosition="start" label="Ganadores" />
          </Tabs>
        </Paper>

        {/* Tab de Inscripción */}
        {tab === 0 && (
          <>
            <Inscription 
              textFieldStyles={textFieldStyles}
              formData={formData}
              handleInputChange={handleInputChange}
              calcularPesoIdeal={calcularPesoIdeal}
              handleInscripcion={handleInscripcion}
              pesoIdealCalculado={pesoIdealCalculado}
              costoPorInscripcion={costoPorInscripcion}
              estructuraOsea={estructuraOsea}
              todosLosCamposLlenos={todosLosCamposLlenos}
            />
          </>
        )}

        {/* Tab de Ranking */}
        {tab === 1 && (
          <>
            <Ranking 
              participantesConProgreso={participantesConProgreso}
              pozoPremioInscripciones={pozoPremioInscripciones}
              costoPorInscripcion={costoPorInscripcion}
              participantes={participantes}
            />
          </>
        )}

        {/* Tab de Apuestas */}
        {tab === 2 && (
          <>
            <Bets 
              participantesConProgreso={participantesConProgreso}
              fondoActual={fondoActual}
              totalFondoApuestas={totalFondoApuestas}
              tipoApuesta={tipoApuesta}
              setTipoApuesta={setTipoApuesta}
              participanteSeleccionado={participanteSeleccionado}
              setParticipanteSeleccionado={setParticipanteSeleccionado}
              textFieldStyles={textFieldStyles}
              participantes={participantes}
              montosDisponibles={montosDisponibles}
              handleMontoClick={handleMontoClick}
              modalOpen={modalOpen}
              handleCloseModal={handleCloseModal}
              montoSeleccionado={montoSeleccionado}
              pagoData={pagoData}
              handleRegistrarPago={handleRegistrarPago}
              handlePagoInputChange={handlePagoInputChange}
            />

          </>
        )}
      </Container>
    </Box>

    <CustomAlert
      alert={alert} 
      setAlert={setAlert} 
      autoHideDuration={5000}
      />
  </>


  );
};
