import {
  /* the components you used */
  Palette,
  PaletteOptions,
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
  }
  export type PalleteOnlyKeys = keyof Palette;
  interface PaletteOptions {
    azulcontraste?: PaletteOptions["primary"];
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
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    error: true;
    info: true;
    success: true;
    warning: true;
    AMLightBlue: true;
    AMTeal: true;
    AMOrange: true;
    AMPurple: true;
    AMRed: true;
    AMGreen: true;
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
    AMUltraLightBlue: true;
    AMLightBlue: true;
    AMTeal: true;
    AMOrange: true;
    AMPurple: true;
  }
}
