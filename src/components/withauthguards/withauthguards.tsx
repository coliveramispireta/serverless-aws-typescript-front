"use client";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

/**
 * Guard de sesión basado en storage.
 * El callback de Google ya NO se procesa aquí: lo hace /dashboard
 * (completeGoogleSignIn), porque el flujo OAuth es authorization-code (?code=…).
 */
export default function WithGuards({
  children,
  authGuards,
}: {
  children: ReactNode;
  authGuards: () => boolean;
}) {
  const router = useRouter();
  const [canRender, setCanRender] = useState<boolean | null>(null);

  useEffect(() => {
    if (!authGuards()) {
      router.push("/login");
    } else {
      setCanRender(true);
    }
  }, [authGuards, router]);

  if (canRender === null) return null; // o un spinner

  return <>{children}</>;
}
