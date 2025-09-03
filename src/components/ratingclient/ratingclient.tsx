"use client";

import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  Paper,
  Rating,
} from "@mui/material";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { useScreenDetector } from "@/hooks/usescreendetector";
import { useState } from "react";

export default function RatingClient() {
  const { isMobile, isTablet, isDesktop, isDesktopLarge } = useScreenDetector();
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  return (
    <>
      <Box
        sx={{
          px: 8,
          pt: 18,
          pb: 8,
          bgcolor: "#FFF",
          color: "#0f172a",
          width: "100%",
          position: "relative",
        }}
      >
        <Grid>
          <Paper
            elevation={20}
            sx={{
              p: 4,
              borderRadius: 2,
              width: "100%",
              maxWidth: 750, // o 600 si deseas más
              height: 400,
            }}
          >
            <Typography variant="h5" mb={6} textAlign={"center"} fontWeight="bold" gutterBottom>
              Envía tu opinión
            </Typography>

            <Rating
              name="new-rating"
              value={newRating}
              onChange={(_, value) => setNewRating(value || 0)}
              size="large"
              sx={{ mb: 2 }}
            />

            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe tu comentario aquí..."
              rows={5}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "8px",
                padding: "10px",
                border: "1px solid #ccc",
                resize: "none",
                marginBottom: "16px",
                fontFamily: "inherit",
                fontSize: "14px",
              }}
            />

            <button
              onClick={() => {
                if (newComment && newRating > 0) {
                  console.log("Comentario:", newComment);
                  console.log("Rating:", newRating);
                  alert("¡Gracias por tu comentario!");
                  setNewComment("");
                  setNewRating(0);
                } else {
                  alert("Por favor, deja un comentario y una valoración.");
                }
              }}
              style={{
                backgroundColor: "#1e40af",
                color: "#fff",
                border: "none",
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                width: "100%",
              }}
            >
              Enviar comentario
            </button>
          </Paper>
        </Grid>
      </Box>
    </>
  );
}
