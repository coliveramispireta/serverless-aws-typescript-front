"use client";
import "@/app/globals.scss";
import WithGuards from "@/components/withauthguards/withauthguards";
import AppShell from "@/components/ui/appshell";
import GlobalDialogs from "@/components/ui/globaldialogs";
import { sysAuthGuard } from "../authguards";

/**
 * Layout de la sección autenticada de la app (route group "(app)"):
 * aplica guardas de sesión y el shell mobile-first con navegación inferior.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WithGuards authGuards={sysAuthGuard}>
        <AppShell>{children}</AppShell>
      </WithGuards>
      <GlobalDialogs />
    </>
  );
}
