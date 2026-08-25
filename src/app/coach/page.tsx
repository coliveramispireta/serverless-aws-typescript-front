"use client";
import { useState } from "react";
import {
  AppBar,
  Box,
  Container,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  Campaign,
  Forum,
  MenuBook,
  NotificationsActive,
  People,
  Restaurant,
  Timeline,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

import CoachUsuariosView from "@/features/coach/usuariosview";
import CoachRevisionView from "@/features/coach/revisionview";
import CoachRecomendacionesView from "@/features/coach/recomendacionesview";
import CoachMensajesView from "@/features/coach/mensajesview";
import CoachRecetasView from "@/features/coach/recetasview";
import CoachActividadView from "@/features/coach/actividadview";
import CoachFlyerView from "@/features/coach/flyerview";

const TABS = [
  { label: "Usuarios", icon: <People />, element: <CoachUsuariosView /> },
  { label: "Revisión", icon: <Timeline />, element: <CoachRevisionView /> },
  { label: "Publicar", icon: <Campaign />, element: <CoachFlyerView /> },
  { label: "Recomendaciones", icon: <Restaurant />, element: <CoachRecomendacionesView /> },
  { label: "Mensajes", icon: <Forum />, element: <CoachMensajesView /> },
  { label: "Recetas", icon: <MenuBook />, element: <CoachRecetasView /> },
  { label: "Actividad", icon: <NotificationsActive />, element: <CoachActividadView /> },
];

/**
 * Panel del coach: pestañas con las herramientas de seguimiento
 * y publicación de contenido personalizado.
 */
export default function CoachPage() {
  const router = useRouter();
  const [tab, setTab] = useState(0);

  return (
    <Box className="pageContainer" sx={{ bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "AMDarkBlue.main",
          color: "#fff",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, gap: 1 }}>
          <Box onClick={() => router.push("/inicio")} sx={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 1 }}>
            <ArrowBack />
            <Typography variant="h6" fontWeight={800}>
              Panel del coach
            </Typography>
          </Box>
        </Toolbar>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            "& .MuiTab-root": { color: "rgba(255,255,255,.7)", minHeight: 52, fontSize: 13 },
            "& .Mui-selected": { color: "#5eead4 !important" },
            "& .MuiTabs-indicator": { backgroundColor: "#5eead4" },
          }}
        >
          {TABS.map((t) => (
            <Tab key={t.label} icon={t.icon} iconPosition="start" label={t.label} />
          ))}
        </Tabs>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        {TABS[tab].element}
      </Container>
    </Box>
  );
}
