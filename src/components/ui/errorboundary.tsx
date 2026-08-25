"use client";
import { Component, ReactNode } from "react";
import { Box, Button, Typography } from "@mui/material";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * ErrorBoundary local: si una pantalla falla en render, se muestra un
 * fallback dentro del shell (sin perder la navegación) en vez de tumbar
 * toda la aplicación.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? "" };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box textAlign="center" py={6} px={2}>
          <Typography fontSize={40}>🛠️</Typography>
          <Typography fontWeight={700} mt={1}>
            Esta vista tuvo un problema
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            {this.state.message || "Error inesperado"}
          </Typography>
          <Button variant="contained" size="small" onClick={() => this.setState({ hasError: false, message: "" })}>
            Reintentar
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
