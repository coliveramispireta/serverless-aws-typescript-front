"use client";
import { Box, Button, Typography } from "@mui/material";
import { ArrowBack, Lock } from "@mui/icons-material";
import { useRouter } from "next/navigation";

import WithGuards from "@/components/withauthguards/withauthguards";
import GlobalDialogs from "@/components/ui/globaldialogs";
import EmptyState from "@/components/ui/emptystate";
import { sysAuthGuard } from "../authguards";
import { getUserInfo } from "@/services/xstorage.cross.service";
import { isCoachEmail } from "@/lib/auth/roles";

/**
 * Layout del panel del coach: exige sesión activa Y rol de coach.
 * Si el usuario no es coach, se muestra acceso denegado.
 */
function CoachGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const userInfo = getUserInfo();

  if (!userInfo.isLogged) return null;

  if (!isCoachEmail(userInfo.email)) {
    return (
      <Box className="pageContainer" sx={{ bgcolor: "background.default" }}>
        <Box sx={{ maxWidth: 480, mx: "auto", pt: 8 }}>
          <EmptyState
            emoji="🔒"
            title="Acceso solo para el coach"
            description="Esta sección está reservada al coach del programa."
          />
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            fullWidth
            onClick={() => router.push("/inicio")}
          >
            Volver a la app
          </Button>
          <Box display="flex" justifyContent="center" mt={2} color="text.secondary">
            <Lock fontSize="small" />
            <Typography variant="caption" ml={0.5}>
              Configurado vía NEXT_PUBLIC_COACH_EMAILS
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
}

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WithGuards authGuards={sysAuthGuard}>
        <CoachGuard>{children}</CoachGuard>
      </WithGuards>
      <GlobalDialogs />
    </>
  );
}
