import ClientProviders from "@/components/ClientProvider";
import type { Viewport } from "next";
import "./globals.scss";

const metadata = {
  title: "KetoFlow · Tu transformación empieza con una decisión",
  description:
    "App de apoyo para el coach de dieta cetogénica: registra tu alimentación y peso, celebra tus logros y comparte el camino.",
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <title>KetoFlow · Tu transformación empieza con una decisión</title>
        <link rel="manifest" href="/keto/manifest.webmanifest" />
        <link rel="icon" href="/keto/logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/keto/logo.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="KetoFlow" />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
