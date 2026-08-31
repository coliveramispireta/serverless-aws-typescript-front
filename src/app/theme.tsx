"use client";
import { createTheme, Theme } from "@mui/material/styles";
import amthemevars from "../styles/amthemevars.module.scss";
import { neueHaasUnicaProMedium, neueHaasUnicaProRegular } from "./fonts";

export type AppThemeMode = "light" | "dark";

/**
 * Paleta base LIGHT con TODAS las claves custom.
 * El modo oscuro se construye haciendo spread de esta y sobreescribiendo
 * únicamente los tokens semánticos → es imposible que falte una clave.
 */
function baseCustomPalette() {
  return {
    azulcontraste: {
      main: amthemevars.azulcontraste__main,
      contrastText: amthemevars.azulcontraste__contrastText,
    },
    success: {
      main: amthemevars.success__main,
      contrastText: amthemevars.success__contrastText,
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
      main: amthemevars.AMDarkGray__main,
      contrastText: amthemevars.AMDarkGray__contrastText,
    },
    AMLightBlue: {
      main: amthemevars.AMLightBlue__main,
      contrastText: amthemevars.AMLightBlue__contrastText,
    },
    AMMedGray: {
      main: amthemevars.AMMedGray__main,
      contrastText: amthemevars.AMMedGray__contrastText,
    },
    AMRed: {
      main: amthemevars.AMRed__main,
      dark: amthemevars.AMRed__dark,
      contrastText: amthemevars.AMRed__contrastText,
    },
    AMWhite: {
      main: amthemevars.AMWhite__main,
      contrastText: amthemevars.AMWhite__contrastText,
    },
    AMUltraLightBlue: {
      main: amthemevars.AMUltraLightBlue__main,
      contrastText: amthemevars.AMUltraLightBlue__contrastText,
    },
    AMUltraLightGray: {
      main: amthemevars.AMUltraLightGray__main,
      contrastText: amthemevars.AMUltraLightGray__contrastText,
    },
    AMSnowGray: {
      main: amthemevars.AMSnowGray__main,
      contrastText: amthemevars.AMSnowGray__contrastText,
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
      main: amthemevars.AMRedAlert__main,
      contrastText: amthemevars.AMRedAlert__contrastText,
    },
    AMMedBlue: {
      main: amthemevars.AMMedBlue__main,
      contrastText: amthemevars.AMMedBlue__contrastText,
    },
    AMGreen: {
      main: amthemevars.AMGreen__main,
      contrastText: amthemevars.AMGreen__contrastText,
    },
    AMTeal: {
      main: amthemevars.AMTeal__main,
      contrastText: amthemevars.AMTeal__contrastText,
    },
    AMPurple: {
      main: amthemevars.AMPurple__main,
      contrastText: amthemevars.AMPurple__contrastText,
    },
    AMOrange: {
      main: amthemevars.AMOrange__main,
      contrastText: amthemevars.AMOrange__contrastText,
    },
    AMYellow: {
      main: amthemevars.AMYellow__main,
      contrastText: amthemevars.AMYellow__contrastText,
    },
  };
}

/** Overrides semánticos para modo oscuro */
function darkOverrides() {
  return {
    background: { default: "#0b1220", paper: "#16213a" },
    text: { primary: "#e2e8f0", secondary: "#94a3b8" },
    divider: "#243049",
    primary: { main: "#34d399", contrastText: "#052e22" },
    secondary: { main: "#fbbf24", contrastText: "#422006" },
    success: { main: "#4ade80", contrastText: "#052e16" },
    azulcontraste: { main: "#2dd4bf", contrastText: "#04252c" },
    AMLightBlue: { main: "#34d399", contrastText: "#052e22" },
    AMDarkGray: { main: "#94a3b8", contrastText: "#e2e8f0" },
    AMMedGray: { main: "#64748b", contrastText: "#e2e8f0" },
    AMRed: { main: "#f87171", dark: "#dc2626", contrastText: "#450a0a" },
    AMUltraLightBlue: { main: "#0f2a22", contrastText: "#a7f3d0" },
    AMUltraLightGray: { main: "#0b1220", contrastText: "#94a3b8" },
    AMSnowGray: { main: "#243049", contrastText: "#cbd5e1" },
    AMRedAlert: { main: "#3f1d24", contrastText: "#fecaca" },
    AMMedBlue: { main: "#2dd4bf", contrastText: "#04252c" },
    AMGreen: { main: "#4ade80", contrastText: "#052e16" },
    AMTeal: { main: "#2dd4bf", contrastText: "#04252c" },
    AMPurple: { main: "#a78bfa", contrastText: "#1e1b3a" },
    AMOrange: { main: "#fb923c", contrastText: "#431407" },
  };
}

/** Fábrica del tema KetoFlow */
export function buildTheme(mode: AppThemeMode = "light"): Theme {
  const dark = mode === "dark";

  const customPalette = dark
    ? { ...baseCustomPalette(), ...darkOverrides() }
    : baseCustomPalette();

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
      primary: dark
        ? { main: "#34d399", contrastText: "#052e22" }
        : { main: amthemevars.primary__main, contrastText: amthemevars.primary__contrastText },
      secondary: dark
        ? { main: "#fbbf24", contrastText: "#422006" }
        : { main: amthemevars.secondary__main, contrastText: amthemevars.secondary__contrastText },
      ...customPalette,
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 600,
            padding: ".65rem 1.75rem",
            ":disabled": { color: "white" },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 16, backgroundImage: "none" },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: { borderRadius: 16 },
          root: { backgroundImage: "none" },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: dark ? "#334155" : amthemevars.AMSnowGray__main,
            "&.Mui-checked": { color: dark ? "#34d399" : amthemevars.primary__main },
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: dark ? "#334155" : amthemevars.AMSnowGray__main,
            "&.Mui-checked": { color: dark ? "#34d399" : amthemevars.primary__main },
          },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0 },
      },
      MuiTooltip: {
        defaultProps: {
          // En táctil el default exige pulsación larga (~700 ms). Con 0 el tooltip
          // (p. ej. botón "?" de ayuda) se abre al tocar y se mantiene ~3 s.
          enterTouchDelay: 0,
          enterDelay: 0,
          leaveTouchDelay: 3000,
          arrow: true,
        },
        styleOverrides: {
          tooltip: {
            fontSize: 12.5,
            lineHeight: 1.45,
            maxWidth: 300,
          },
        },
      },
    },
  });
}

/** Tema claro por defecto (retrocompatibilidad con styledcomponents) */
export const theme = buildTheme("light");
