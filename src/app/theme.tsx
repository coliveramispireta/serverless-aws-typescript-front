"use client";
import { createTheme } from "@mui/material/styles";
import amthemevars from "../styles/amthemevars.module.scss";
import { neueHaasUnicaProMedium, neueHaasUnicaProRegular } from "./fonts";

export const theme = createTheme({
  typography: {
    fontFamily: [neueHaasUnicaProRegular.style.fontFamily].join(","),
  },
  palette: {
    mode: "light",
    primary: {
      main: amthemevars.primary__main,
    },
    secondary: {
      main: amthemevars.secondary__main,
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
    AMBasicFare: {
      main: amthemevars.AMBasicFare__main,
      contrastText: amthemevars.AMBasicFare__contrastText,
    },
    AMClassicFare: {
      main: amthemevars.AMClassicFare__main,
      contrastText: amthemevars.AMClassicFare__contrastText,
    },
    AMFlexibleFare: {
      main: amthemevars.AMFlexibleFare__main,
      contrastText: amthemevars.AMFlexibleFare__contrastText,
    },
    AMPlusFare: {
      main: amthemevars.AMPlusFare__main,
      contrastText: amthemevars.AMPlusFare__contrastText,
    },
    AMConfortFare: {
      main: amthemevars.AMConfortFare__main,
      contrastText: amthemevars.AMConfortFare__contrastText,
    },
    AMPremierFare: {
      main: amthemevars.AMPremierFare__main,
      contrastText: amthemevars.AMPremierFare__contrastText,
    },
    BGBasicFare: {
      main: amthemevars.BGBasicFare__main,
      contrastText: amthemevars.BGBasicFare__contrastText,
    },
    BGClassicFare: {
      main: amthemevars.BGClassicFare__main,
      contrastText: amthemevars.BGClassicFare__contrastText,
    },
    BGConfortFare: {
      main: amthemevars.BGConfortFare__main,
      contrastText: amthemevars.BGConfortFare__contrastText,
    },
    BGPremierFare: {
      main: amthemevars.BGPremierFare__main,
      contrastText: amthemevars.BGPremierFare__contrastText,
    },
    BGFlexibleFare: {
      main: amthemevars.BGFlexibleFare__main,
      contrastText: amthemevars.BGFlexibleFare__contrastText,
    },
    BGPlusFare: {
      main: amthemevars.BGPlusFare__main,
      contrastText: amthemevars.BGPlusFare__contrastText,
    },
    BasicSecondary: {
      main: amthemevars.BasicSecondary__main,
      contrastText: amthemevars.BasicSecondary__contrastText,
    },
    FlexSecondary: {
      main: amthemevars.FlexSecondary__main,
      contrastText: amthemevars.FlexSecondary__contrastText,
    },
    AMPlusSecondary: {
      main: amthemevars.AMPlusSecondary__main,
      contrastText: amthemevars.AMPlusSecondary__contrastText,
    },
    ConfortSecondary: {
      main: amthemevars.ConfortSecondary__main,
      contrastText: amthemevars.ConfortSecondary__contrastText,
    },
    PremierSecondary: {
      main: amthemevars.PremierSecondary__main,
      contrastText: amthemevars.PremierSecondary__contrastText,
    },
    BorderBasicFare: {
      main: amthemevars.BorderBasicFare__main,
      contrastText: amthemevars.BorderBasicFare__contrastText,
    },
    BorderClassicFare: {
      main: amthemevars.BorderClassicFare__main,
      contrastText: amthemevars.BorderClassicFare__contrastText,
    },
    BorderFlexibleFare: {
      main: amthemevars.BorderFlexibleFare__main,
      contrastText: amthemevars.BorderFlexibleFare__contrastText,
    },
    BorderPlusFare: {
      main: amthemevars.BorderPlusFare__main,
      contrastText: amthemevars.BorderPlusFare__contrastText,
    },
    BorderConfortFare: {
      main: amthemevars.BorderConfortFare__main,
      contrastText: amthemevars.BorderConfortFare__contrastText,
    },
    BorderPremierFare: {
      main: amthemevars.BorderPremierFare__main,
      contrastText: amthemevars.BorderPremierFare__contrastText,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          borderRadius: 25,
          padding: ".8rem 3rem ",
          ":disabled": {
            color: "white",
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#e5e5e5",
          "&.Mui-checked": {
            color: "#007dc3",
          },
          "& .MuiSvgIcon-root:not(.MuiSvgIcon-root ~ .MuiSvgIcon-root)": {
            color: "gray",
            strokeWidth: "60px",
          },
          "& .MuiSvgIcon-root:not(.MuiSvgIcon-root ~ .MuiSvgIcon-root) path": {
            color: "gray",
            strokeWidth: "60px",
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: amthemevars.AMSnowGray__main,
          "&.Mui-checked": {
            color: amthemevars.AMLightBlue__main,
          },
        },
      },
    },
  },
});
