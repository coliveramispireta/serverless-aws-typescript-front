"use client";

import { Box, Grid, Typography, Avatar, Paper } from "@mui/material";
import { useScreenDetector } from "@/hooks/usescreendetector";
import RatingClient from "../ratingclient/ratingclient";

const teamMembers = [
  {
    name: "Carlos Olivera Mispireta",
    role: "Developer Cloud Fullstack",
    description: [
      "Profesional en Ciencias de la Informática, especializado como Developer Cloud Fullstack, con más de 5 años de experiencia en el desarrollo de aplicaciones web y soluciones tecnológicas.",
      "Para el desarrollo frontend utilizo tecnologías modernas y robustas como Next.js, React, TypeScript, Vite, Tailwind CSS, MUI y Styled Components, creando interfaces responsivas, accesibles y con experiencias de usuario atractivas. Para el backend, desarrollo sistemas robustos y eficientes con Node.js, Express, TypeORM, MongoDB y PostgreSQL.",
      "Además, cuento con experiencia en soluciones en la nube (Apps Script, Google Cloud y AWS) y en el diseño de dashboards interactivos y análisis de datos con herramientas como Looker Studio.",
      "Trabajo aplicando metodologías ágiles, especialmente Scrum, lo que me permite colaborar de manera efectiva en equipos multidisciplinarios, gestionar el backlog de productos y asegurar entregas continuas de valor.",
      "Creo firmemente en la tecnología como motor de transformación para quienes desean crecer y siempre busco combinar innovación, eficiencia y calidad en cada proyecto.",
      "#Desarrollo Full Stack: Frontend & Backend",
      "#Cloud & DevOps: Google Cloud, AWS, Apps Script",
      "#Data & Dashboards: Looker Studio",
    ],
    image: "/img/png/FOTO.png",
    bgcolor: "#1e293b",
  },
];

export default function AboutMeSection() {
  const { isMobile, isTablet, isDesktop, isDesktopLarge } = useScreenDetector();

  return (
    <Box
      sx={{
        px: 8,
        pt: 4,
        pb: 6,
        bgcolor: "#FFF",
        color: "#0f172a",
        width: "100%",
        position: "relative",
      }}
    >
      <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
        Conoce el talento detrás del proyecto
      </Typography>

      <Typography
        variant="h5"
        color="#16a34a"
        marginTop={-1}
        fontWeight="semi-bold"
        textAlign="center"
        gutterBottom
      >
        "Construyendo soluciones serverless modernas, desde la infraestructura hasta la interfaz."
      </Typography>

      <Grid container spacing={4} pt={0} alignItems="center">
        {/* Columna izquierda: Miembros */}
        <Grid item xs={12} md={6}>
          {teamMembers.map((member, index) => (
            <Box key={index} sx={{ position: "relative", mt: 10 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  position: "absolute",
                  top: -90,
                  left: 30,
                  right: 0,
                  zIndex: 2,
                }}
              >
                <Avatar
                  alt={member.name}
                  src={member.image}
                  sx={{
                    width: 180,
                    height: 180,
                    border: "4px solid white",
                    boxShadow: 3,
                    zIndex: 3,
                    backgroundColor: "#f3e8b8",
                  }}
                />
              </Box>

              <Paper
                elevation={20}
                sx={{
                  mt: 11,
                  pt: 6,
                  pb: 4,
                  px: 3,
                  borderRadius: 3,
                  position: "relative",
                  zIndex: 1,
                  textAlign: "justify",
                  backgroundColor: member.bgcolor,
                  color: "#FFF",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography lineHeight={1} variant="h6" fontWeight="bold" mb={0.5}>
                  {member.name}
                </Typography>
                <Typography variant="body2" mt={0} sx={{ fontStyle: "italic" }}>
                  {member.role}
                </Typography>
                {member.description.map((text, i) => (
                  <Typography key={i} variant="body2" mt={i === 0 ? 2 : 0}>
                    {text}
                  </Typography>
                ))}
              </Paper>
            </Box>
          ))}
        </Grid>

        {/* Columna derecha: Ranking */}
        <Grid item xs={12} md={6} alignItems="center">
          <RatingClient />
        </Grid>
      </Grid>
    </Box>
  );
}
