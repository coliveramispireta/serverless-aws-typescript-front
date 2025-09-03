"use client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "../app/theme";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/es-mx";
import MuiXLicense from "@/smartcomponents/muilicense/MuiXLicense";
import { UserContextProvider } from "@/context/usercontext/usercontextprovider";
import { PageContextProvider } from "@/context/pagecontext/pagecontextprovider";
interface ClientProvidersProps {
  children: React.ReactNode;
}
export default function ClientProviders({ children }: ClientProvidersProps) {
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
