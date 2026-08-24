"use client";
import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";
import {
  ArrowForwardIosSharp,
  ExpandMore,
  LightbulbOutlined,
  MenuBook,
} from "@mui/icons-material";

import SectionHeader from "@/components/ui/sectionheader";
import EmptyState from "@/components/ui/emptystate";
import {
  BASE_CATEGORIAS,
  BaseArticle,
  BaseCategoria,
  Bloque,
  basesArticles,
} from "@/content/bases";

/** Render genérico de un bloque de contenido */
function BloqueView({ bloque }: { bloque: Bloque }) {
  switch (bloque.tipo) {
    case "subtitulo":
      return (
        <Typography variant="subtitle2" fontWeight={800} mt={2} mb={0.5}>
          {bloque.texto}
        </Typography>
      );
    case "parrafo":
      return (
        <Typography variant="body2" color="text.secondary" mb={1.25} lineHeight={1.7}>
          {bloque.texto}
        </Typography>
      );
    case "lista":
      return (
        <Box component="ul" sx={{ pl: 4, mb: 1.5 }}>
          {bloque.items.map((item, i) => (
            <Typography key={i} component="li" variant="body2" color="text.secondary" mb={0.75}>
              {item}
            </Typography>
          ))}
        </Box>
      );
    case "pasos":
      return (
        <Box component="ol" sx={{ pl: 4, mb: 1.5 }}>
          {bloque.items.map((item, i) => (
            <Typography key={i} component="li" variant="body2" color="text.secondary" mb={0.75}>
              {item}
            </Typography>
          ))}
        </Box>
      );
    case "tip":
      return (
        <Alert
          icon={<LightbulbOutlined fontSize="small" />}
          severity="success"
          variant="outlined"
          sx={{ my: 1.5, borderRadius: 3 }}
        >
          <Typography variant="body2">{bloque.texto}</Typography>
        </Alert>
      );
    case "alerta":
      return (
        <Alert severity="warning" variant="outlined" sx={{ my: 1.5, borderRadius: 3 }}>
          <Typography variant="body2">{bloque.texto}</Typography>
        </Alert>
      );
    default:
      return null;
  }
}

const CAT_LABELS: Record<BaseCategoria, string> = Object.fromEntries(
  BASE_CATEGORIAS.map((c) => [c.id, c.label])
) as Record<BaseCategoria, string>;

/**
 * Bases de Keto — contenido educativo estático de la app.
 * Acordeones por tema con buscador y filtro por categoría.
 */
export default function BasesPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<BaseCategoria | "todas">("todas");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return basesArticles.filter((a) => {
      const matchCat = cat === "todas" || a.categoria === cat;
      const matchQuery =
        !q ||
        a.titulo.toLowerCase().includes(q) ||
        a.resumen.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [query, cat]);

  // Orden estable por categoría (según BASE_CATEGORIAS)
  const ordered = useMemo(() => {
    const order = new Map(BASE_CATEGORIAS.map((c, i) => [c.id, i]));
    return [...filtered].sort(
      (a, b) => (order.get(a.categoria) ?? 99) - (order.get(b.categoria) ?? 99)
    );
  }, [filtered]);

  return (
    <Box>
      <SectionHeader
        title="Bases de Keto"
        subtitle="Entiende lo que le pasa a tu cuerpo"
      />

      {/* Aviso responsable */}
      <Alert icon={<MenuBook fontSize="small" />} severity="info" sx={{ mb: 2, borderRadius: 3 }}>
        <Typography variant="caption">
          Contenido educativo. No sustituye las indicaciones de tu coach ni el consejo médico.
        </Typography>
      </Alert>

      {/* Buscador */}
      <MuiTextField
        placeholder="Buscar tema… (ej. sal, cetonas, dormir)"
        fullWidth
        size="small"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{
          mb: 1.5,
          "& .MuiOutlinedInput-root": { borderRadius: 999 },
        }}
      />

      {/* Chips de categoría */}
      <Box display="flex" gap={0.75} flexWrap="wrap" mb={2}>
        <Chip
          label="Todas"
          clickable
          size="small"
          color={cat === "todas" ? "primary" : "default"}
          variant={cat === "todas" ? "filled" : "outlined"}
          onClick={() => setCat("todas")}
        />
        {BASE_CATEGORIAS.map((c) => (
          <Chip
            key={c.id}
            label={c.label}
            clickable
            size="small"
            color={cat === c.id ? "primary" : "default"}
            variant={cat === c.id ? "filled" : "outlined"}
            onClick={() => setCat(c.id)}
          />
        ))}
      </Box>

      {/* Lista de artículos */}
      {ordered.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="Sin resultados"
          description={`Nada coincide con "${query}". Prueba otra palabra o cambia la categoría.`}
          actionLabel="Limpiar búsqueda"
          onAction={() => {
            setQuery("");
            setCat("todas");
          }}
        />
      ) : (
        <>
          {ordered.map((article: BaseArticle) => (
            <Accordion
              key={article.id}
              disableGutters
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "AMSnowGray.main",
                borderRadius: "16px !important",
                mb: 1.25,
                overflow: "hidden",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{ px: 2, py: 0.5, "& .MuiAccordionSummary-content": { my: 1.25 } }}
              >
                <Box display="flex" alignItems="center" gap={1.5} minWidth={0}>
                  <Typography fontSize={24} flexShrink={0}>
                    {article.emoji}
                  </Typography>
                  <Box flex={1}>
                    <Typography
                      fontWeight={700}
                      sx={{
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        wordBreak: "break-word",
                      }}
                    >
                      {article.titulo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {CAT_LABELS[article.categoria]} · {article.minutosLectura} min de lectura
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                <Typography
                  variant="body2"
                  fontStyle="italic"
                  color="text.secondary"
                  mb={1.5}
                  borderLeft="3px solid"
                  borderColor="AMUltraLightBlue.main"
                  pl={1.5}
                >
                  {article.resumen}
                </Typography>
                {article.bloques.map((bloque, i) => (
                  <BloqueView key={i} bloque={bloque} />
                ))}
              </AccordionDetails>
            </Accordion>
          ))}

          {/* Pie con conteo */}
          <Box display="flex" justifyContent="center" mt={1.5} gap={1} alignItems="center">
            <ArrowForwardIosSharp
              sx={{ fontSize: 12, transform: "rotate(90deg)", color: "text.disabled" }}
            />
            <Typography variant="caption" color="text.disabled">
              {ordered.length} de {basesArticles.length} temas
            </Typography>
            <ArrowForwardIosSharp
              sx={{ fontSize: 12, transform: "rotate(-90deg)", color: "text.disabled" }}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
