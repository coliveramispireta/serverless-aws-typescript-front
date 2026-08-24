"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "../loading";

/**
 * /dashboard se mantiene como ruta de callback de Cognito/Google
 * (REDIRECT_SIGNIN apunta aquí) y redirige al inicio de la app.
 */
export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/inicio");
  }, [router]);

  return <Loading />;
}
