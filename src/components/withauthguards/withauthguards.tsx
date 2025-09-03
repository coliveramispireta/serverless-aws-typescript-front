"use client";
import { handleGoogleCallback } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

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
    const checkAuth = async () => {
      const result = authGuards();
      const hash = window.location.hash;

      if (!hash) {
        console.log("no hay hash!");
        if (!result) {
          router.push("/login");
        } else {
          setCanRender(true);
        }
      } else {
        console.log("si hay hash!");
        // Manejar login con Google usando hash
        const loginGoogle = await handleGoogleCallback(hash);
        console.log("loginGoogle:", loginGoogle);

        if (!loginGoogle) {
          router.push("/login");
        } else {
          setCanRender(true);
          // Limpiar el hash de la URL
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    };

    checkAuth();
  }, [authGuards, router]);

  if (canRender === null) return null; // o un spinner

  return <>{children}</>;
}
