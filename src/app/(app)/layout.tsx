"use client";
import "@/app/globals.scss";
import WithGuards from "@/components/withauthguards/withauthguards";
import AppShell from "@/components/ui/appshell";
import GlobalDialogs from "@/components/ui/globaldialogs";
import { sysAuthGuard } from "../authguards";
import { OnboardingProvider } from "@/context/onboarding/onboarding.context";
import OnboardingIntro from "@/components/onboarding/onboardingintro";
import OnboardingTour from "@/components/onboarding/onboardingtour";

/**
 * Layout de la sección autenticada de la app (route group "(app)"):
 * aplica guardas de sesión y el shell mobile-first con navegación inferior.
 * También monta el onboarding de bienvenida (intro) y el recorrido de ayuda.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      <WithGuards authGuards={sysAuthGuard}>
        <AppShell>{children}</AppShell>
        <OnboardingIntro />
        <OnboardingTour />
      </WithGuards>
      <GlobalDialogs />
    </OnboardingProvider>
  );
}
