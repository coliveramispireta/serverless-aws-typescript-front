"use client";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export default function WithGuardsLogin({
  children,
  authGuards,
}: {
  children: ReactNode;
  authGuards: () => boolean;
}) {
  const router = useRouter();
  const [canRender, setCanRender] = useState<boolean | null>(null);

  useEffect(() => {
    const result = authGuards();
    if (result) {
      router.push("/");
    } else {
      setCanRender(true);
    }
  }, [authGuards, router]);

  if (canRender === null) return null; // o un spinner

  return <>{children}</>;
}
