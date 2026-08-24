"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "./loading";
import { getUserInfo } from "@/services/xstorage.cross.service";

/**
 * Página raíz: dirige al usuario según su sesión.
 * (El redirect es cliente porque el proyecto usa static export.)
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const userInfo = getUserInfo();
    router.replace(userInfo.isLogged ? "/inicio" : "/login");
  }, [router]);

  return <Loading />;
}
