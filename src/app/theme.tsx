"use client";
import { createTheme } from "@mui/material/styles";
import amthemevars from "../styles/amthemevars.module.scss";
import { neueHaasUnicaProMedium, neueHaasUnicaProRegular } from "./fonts";

/**
 * Tema "KetoCoach": mobile-first, claro y moderno.
 * Paleta definida en styles/amthemevars.module.scss.
 */
export const theme = createTheme({
  typography: {
    fontFamily: [neueHaasUnicaProRegular.style.fontFamily].join(","),
  },
  shape: {
    borderRadius: 14,
  },
  palette: {
    mode: "light",
    background: {
      default: amthemevars.AMUltraLightGray__main,
      paper: amthemevars.AMWhite__main,
    },
    text: {
      primary: amthemevars.AMBrandBlue__main,
      secondary: amthemevars.AMDarkGray__main,
    },
    primary: {
      main: amthemevars.primary__main,
      contrastText: amthemevars.primary__contrastText,
    },
    secondary: {
      main: amthemevars.secondary__main,
      contrastText: amthemevars.secondary__contrastText,
    },
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
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: amthemevars.AMSnowGray__main,
          "&.Mui-checked": {
            color: amthemevars.primary__main,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: amthemevars.AMSnowGray__main,
          "&.Mui-checked": {
            color: amthemevars.primary__main,
          },
        },
      },
    },
  },
});
