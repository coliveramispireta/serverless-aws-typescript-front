"use client";
import { useMemo } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { buildTheme } from "../app/theme";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/es-mx";
import MuiXLicense from "@/smartcomponents/muilicense/MuiXLicense";
import { UserContextProvider } from "@/context/usercontext/usercontextprovider";
import { PageContextProvider } from "@/context/pagecontext/pagecontextprovider";
import PwaRegister from "@/components/ui/pwaregister";
import { ThemeModeProvider, useThemeMode } from "@/theme/thememode";

function ThemedApp({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeMode();
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es-mx">
        <UserContextProvider>
          <PageContextProvider>{children}</PageContextProvider>
          <MuiXLicense />
        </UserContextProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeModeProvider>
      <ThemedApp>{children}</ThemedApp>
      <PwaRegister />
    </ThemeModeProvider>
  );
}
