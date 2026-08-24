"use client";
import "@/app/globals.scss";
import WithGuards from "@/components/withauthguards/withauthguards";
import GlobalDialogs from "@/components/ui/globaldialogs";
import { sysAuthGuard } from "../authguards";

/**
 * Layout de /dashboard.
 * Mantiene WithGuards para procesar el callback de Google (hash de Cognito)
 * antes de redirigir a /inicio.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WithGuards authGuards={sysAuthGuard}>{children}</WithGuards>
      <GlobalDialogs />
    </>
  );
}
