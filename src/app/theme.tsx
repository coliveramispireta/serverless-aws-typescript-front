"use client";
import { createTheme, Theme } from "@mui/material/styles";
import amthemevars from "../styles/amthemevars.module.scss";
import { neueHaasUnicaProMedium, neueHaasUnicaProRegular } from "./fonts";

export type AppThemeMode = "light" | "dark";

/**
 * Fábrica del tema KetoFlow.
 * - light: paleta original
 * - dark: superficies oscuras + primario más luminoso; los tokens AM*
 *   semánticos (bordes/superficies suaves) se remapean para armonizar.
 */
export function buildTheme(mode: AppThemeMode = "light"): Theme {
  const dark = mode === "dark";

  return createTheme({
    typography: {
      fontFamily: [neueHaasUnicaProRegular.style.fontFamily].join(","),
    },
    shape: {
      borderRadius: 14,
    },
    palette: {
      mode,
      background: dark
        ? { default: "#0b1220", paper: "#16213a" }
        : { default: amthemevars.AMUltraLightGray__main, paper: amthemevars.AMWhite__main },
      text: dark
        ? { primary: "#e2e8f0", secondary: "#94a3b8" }
        : { primary: amthemevars.AMBrandBlue__main, secondary: amthemevars.AMDarkGray__main },
      divider: dark ? "#243049" : undefined,
      primary: {
        main: dark ? "#34d399" : amthemevars.primary__main,
        contrastText: dark ? "#052e22" : amthemevars.primary__contrastText,
      },
      secondary: {
        main: dark ? "#fbbf24" : amthemevars.secondary__main,
        contrastText: dark ? "#422006" : amthemevars.secondary__contrastText,
      },
      azulcontraste: {
        main: dark ? "#2dd4bf" : amthemevars.azulcontraste__main,
        contrastText: dark ? "#04252c" : amthemevars.azulcontraste__contrastText,
      },
      success: {
        main: dark ? "#4ade80" : amthemevars.success__main,
        contrastText: dark ? "#052e16" : amthemevars.success__contrastText,
      },
      warning: {
        main: amthemevars.warning__main,
        contrastText: amthemevars.warning__contrastText,
      },
      AMBrandBlue: {
        main: amthemevars.AMBrandBlue__main,
        contrastText: amthemevars.AMBrandBlue__contrastText,
      },
      AMDarkGray: {
        main: dark ? "#94a3b8" : amthemevars.AMDarkGray__main,
        contrastText: amthemevars.AMDarkGray__contrastText,
      },
      AMLightBlue: {
        main: dark ? "#34d399" : amthemevars.AMLightBlue__main,
        contrastText: dark ? "#052e22" : amthemevars.AMLightBlue__contrastText,
      },
      AMMedGray: {
        main: dark ? "#64748b" : amthemevars.AMMedGray__main,
        contrastText: amthemevars.AMMedGray__contrastText,
      },
      AMRed: {
        main: dark ? "#f87171" : amthemevars.AMRed__main,
        dark: amthemevars.AMRed__dark,
        contrastText: dark ? "#450a0a" : amthemevars.AMRed__contrastText,
      },
      AMWhite: {
        main: amthemevars.AMWhite__main,
        contrastText: amthemevars.AMWhite__contrastText,
      },
      AMUltraLightBlue: {
        // Superficie menta suave → en dark, verde muy profundo
        main: dark ? "#0f2a22" : amthemevars.AMUltraLightBlue__main,
        contrastText: dark ? "#a7f3d0" : amthemevars.AMUltraLightBlue__contrastText,
      },
      AMUltraLightGray: {
        main: dark ? "#0b1220" : amthemevars.AMUltraLightGray__main,
        contrastText: dark ? "#94a3b8" : amthemevars.AMUltraLightGray__contrastText,
      },
      AMSnowGray: {
        // Token de bordes → en dark, borde azul-gris oscuro
        main: dark ? "#243049" : amthemevars.AMSnowGray__main,
        contrastText: dark ? "#cbd5e1" : amthemevars.AMSnowGray__contrastText,
      },
      AMDarkBlue: {
        main: amthemevars.AMDarkBlue__main,
        contrastText: amthemevars.AMDarkBlue__contrastText,
      },
      AMYellowAlert: {
        main: amthemevars.AMYellowAlert__main,
        contrastText: amthemevars.AMYellowAlert__contrastText,
      },
      AMRedAlert: {
        main: dark ? "#3f1d24" : amthemevars.AMRedAlert__main,
        contrastText: dark ? "#fecaca" : amthemevars.AMRedAlert__contrastText,
      },
      AMMedBlue: {
        main: dark ? "#2dd4bf" : amthemevars.AMMedBlue__main,
        contrastText: dark ? "#04252c" : amthemevars.AMMedBlue__contrastText,
      },
      AMGreen: {
        main: dark ? "#4ade80" : amthemevars.AMGreen__main,
        contrastText: dark ? "#052e16" : amthemevars.AMGreen__contrastText,
      },
      AMTeal: {
        main: dark ? "#2dd4bf" : amthemevars.AMTeal__main,
        contrastText: dark ? "#04252c" : amthemevars.AMTeal__contrastText,
      },
      AMPurple: {
        main: dark ? "#a78bfa" : amthemevars.AMPurple__main,
        contrastText: dark ? "#1e1b3a" : amthemevars.AMPurple__contrastText,
      },
      AMOrange: {
        main: dark ? "#fb923c" : amthemevars.AMOrange__main,
        contrastText: dark ? "#431407" : amthemevars.AMOrange__contrastText,
      },
      AMYellow: {
        main: amthemevars.AMYellow__main,
        contrastText: amthemevars.AMYellow__contrastText,
      },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 600,
            padding: ".65rem 1.75rem",
            ":disabled": {
              color: "white",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderColor: dark ? "#243049" : undefined,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 16,
          },
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: dark ? "#334155" : amthemevars.AMSnowGray__main,
            "&.Mui-checked": {
              color: dark ? "#34d399" : amthemevars.primary__main,
            },
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: dark ? "#334155" : amthemevars.AMSnowGray__main,
            "&.Mui-checked": {
              color: dark ? "#34d399" : amthemevars.primary__main,
            },
          },
        },
      },
      MuiAppBar: {
        defaultProps: {
          elevation: 0,
        },
      },
    },
  });
}

/** Tema claro por defecto (retrocompatibilidad con styledcomponents) */
export const theme = buildTheme("light");
