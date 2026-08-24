import ClientProviders from "@/components/ClientProvider";
import "./globals.scss";

const metadata = {
  title: "KetoCoach · Tu progreso keto",
  description: "App de apoyo para el coach de dieta cetogénica: registra tu alimentación, peso y logros, y mantente motivado.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <title>KetoCoach · Tu progreso keto</title>
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
