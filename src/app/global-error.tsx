"use client";

import { useEffect } from "react";

/**
 * Red de seguridad global de Next.js.
 * Si cualquier error no capturado llega al render, el usuario ve una pantalla
 * amable de KetoFlow con opción de reintentar — nunca la pantalla blanca
 * "Application error".
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("GlobalError:", error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          background: "linear-gradient(180deg, #ecfdf5 0%, #f8fafc 45%)",
          color: "#0f172a",
        }}
      >
        <div style={{ textAlign: "center", padding: 24, maxWidth: 420 }}>
          <img src="/keto/logo.svg" alt="" width={72} height={72} style={{ margin: "0 auto" }} />
          <h1 style={{ fontSize: 22, marginTop: 16 }}>
            Keto<span style={{ color: "#059669" }}>Flow</span>
          </h1>
          <h2 style={{ fontSize: 17, fontWeight: 600 }}>Algo salió mal</h2>
          <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
            Ocurrió un error inesperado. Tus datos están a salvo.
            <br />
            Toca reintentar para continuar donde estabas.
          </p>
          {error?.message ? (
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "#ef4444",
                background: "#fef2f2",
                borderRadius: 8,
                padding: "8px 10px",
                wordBreak: "break-word",
              }}
            >
              {error.message}
            </p>
          ) : null}
          <button
            onClick={reset}
            style={{
              background: "#059669",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "12px 32px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            Reintentar
          </button>
          <div style={{ marginTop: 12 }}>
            <a href="/inicio" style={{ color: "#059669", fontSize: 13 }}>
              Ir al inicio
            </a>
            {" · "}
            <a href="/login" style={{ color: "#64748b", fontSize: 13 }}>
              Iniciar sesión
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
