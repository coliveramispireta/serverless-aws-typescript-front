import {
  /* the components you used */
  createTheme,
  PaletteOptions,
  ThemeProvider,
} from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {}

  interface Palette {
    azulcontraste: Palette["primary"];
    AMBrandBlue: Palette["primary"];
    AMDarkGray: Palette["primary"];
    AMLightBlue: Palette["primary"];
    AMMedGray: Palette["primary"];
    AMRed: Palette["primary"];
    AMWhite: Palette["primary"];
    AMUltraLightBlue: Palette["primary"];
    AMUltraLightGray: Palette["primary"];
    AMSnowGray: Palette["primary"];
    AMDarkBlue: Palette["primary"];
    AMYellowAlert: Palette["primary"];
    AMRedAlert: Palette["primary"];
    AMMedBlue: Palette["primary"];
    AMGreen: Palette["primary"];
    AMTeal: Palette["primary"];
    AMPurple: Palette["primary"];
    AMOrange: Palette["primary"];
    AMYellow: Palette["primary"];
    AMBasicFare: Palette["primary"];
    AMClassicFare: Palette["primary"];
    AMFlexibleFare: Palette["primary"];
    AMPlusFare: Palette["primary"];
    AMConfortFare: Palette["primary"];
    AMPremierFare: Palette["primary"];
    BGBasicFare: Palette["primary"];
    BGClassicFare: Palette["primary"];
    BGConfortFare: Palette["primary"];
    BGPremierFare: Palette["primary"];
    BGFlexibleFare: Palette["primary"];
    BGPlusFare: Palette["primary"];
    BasicSecondary: Palette["primary"];
    FlexSecondary: Palette["primary"];
    AMPlusSecondary: Palette["primary"];
    ConfortSecondary: Palette["primary"];
    PremierSecondary: Palette["primary"];
    BorderBasicFare: Palette["primary"];
    BorderClassicFare: Palette["primary"];
    BorderFlexibleFare: Palette["primary"];
    BorderPlusFare: Palette["primary"];
    BorderConfortFare: Palette["primary"];
    BorderPremierFare: Palette["primary"];
  }
  export type PalleteOnlyKeys = keyof Palette;
  interface PaletteOptions {
    azulcontraste: PaletteOptions["primary"];
    AMBrandBlue?: PaletteOptions["primary"];
    AMDarkGray?: PaletteOptions["primary"];
    AMLightBlue?: PaletteOptions["primary"];
    AMMedGray?: PaletteOptions["primary"];
    AMRed?: PaletteOptions["primary"];
    AMWhite?: PaletteOptions["primary"];
    AMUltraLightBlue?: PaletteOptions["primary"];
    AMUltraLightGray?: PaletteOptions["primary"];
    AMSnowGray?: PaletteOptions["primary"];
    AMDarkBlue?: PaletteOptions["primary"];
    AMYellowAlert?: PaletteOptions["primary"];
    AMRedAlert?: PaletteOptions["primary"];
    AMMedBlue?: PaletteOptions["primary"];
    AMGreen?: PaletteOptions["primary"];
    AMTeal?: PaletteOptions["primary"];
    AMPurple?: PaletteOptions["primary"];
    AMOrange?: PaletteOptions["primary"];
    AMYellow?: PaletteOptions["primary"];
    AMBasicFare?: PaletteOptions["primary"];
    AMClassicFare?: PaletteOptions["primary"];
    AMFlexibleFare?: PaletteOptions["primary"];
    AMPlusFare?: PaletteOptions["primary"];
    AMConfortFare?: PaletteOptions["primary"];
    AMPremierFare?: PaletteOptions["primary"];
    BGBasicFare?: PaletteOptions["primary"];
    BGClassicFare?: PaletteOptions["primary"];
    BGConfortFare?: PaletteOptions["primary"];
    BGPremierFare?: PaletteOptions["primary"];
    BGFlexibleFare?: PaletteOptions["primary"];
    BGPlusFare?: PaletteOptions["primary"];
    BasicSecondary?: PaletteOptions["primary"];
    FlexSecondary?: PaletteOptions["primary"];
    AMPlusSecondary?: PaletteOptions["primary"];
    ConfortSecondary?: PaletteOptions["primary"];
    PremierSecondary?: PaletteOptions["primary"];
    BorderBasicFare?: PaletteOptions["primary"];
    BorderClassicFare?: PaletteOptions["primary"];
    BorderFlexibleFare?: PaletteOptions["primary"];
    BorderPlusFare?: PaletteOptions["primary"];
    BorderConfortFare?: PaletteOptions["primary"];
    BorderPremierFare?: PaletteOptions["primary"];
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    error: true;
    info: true;
    success: true;
    warning: true;
  }
}

declare module "@mui/material/Alert" {
  interface AlertPropsColorOverrides {
    error: true;
    info: true;
    success: true;
    warning: true;
    AMYellowAlert: true;
  }
}

declare module "@mui/material/Checkbox" {
  interface CheckboxPropsColorOverrides {
    error: true;
    info: true;
    success: true;
    warning: true;
    AMLightBlue: true;
  }
}

declare module "@mui/material/Pagination" {
  interface PaginationPropsColorOverrides {
    error: true;
    info: true;
    success: true;
    warning: true;
    AMUltraLightBlue: true;
  }
}

declare module "@mui/material/PaginationItem" {
  interface PaginationItemPropsColorOverrides {
    error: true;
    info: true;
    success: true;
    warning: true;
    AMUltraLightBlue: true;
  }
}

declare module "@mui/material/TextField" {
  interface TextFieldPropsColorOverrides {
    error: true;
    info: true;
    success: true;
    warning: true;
    AMLightBlue: true;
  }
}

declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides {
    error: true;
    info: true;
    success: true;
    warning: true;
    AMSnowGray: true;
  }
}
