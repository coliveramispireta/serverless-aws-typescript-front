"use client";
import { neueHaasUnicaProBold, neueHaasUnicaProRegular } from "@/app/fonts";
import {
  Button,
  ButtonProps,
  Card,
  CardProps,
  FormControl,
  FormControlProps,
  FormLabel,
  FormLabelProps,
  PaletteColor,
  PalleteOnlyKeys,
  Snackbar,
  SnackbarProps,
  Stack,
  StackProps,
  Stepper,
  TextField,
  TextFieldProps,
  Tooltip,
  TooltipProps,
  inputBaseClasses,
  listClasses,
  menuClasses,
  outlinedInputClasses,
  paperClasses,
  selectClasses,
  stepIconClasses,
  styled,
  tablePaginationClasses,
  textFieldClasses,
  tooltipClasses,
  Select,
  SelectProps,
  MenuItem,
  InputLabelProps,
  stepLabelClasses,
  Tabs,
  Tab,
  Box,
  Radio,
  RadioGroup,
  ButtonGroup,
  ButtonGroupProps,
  Step,
  StepContent,
  AccordionSummaryProps,
  AccordionSummary,
  Autocomplete,
  AutocompleteProps,
  radioClasses,
  RadioProps,
} from "@mui/material";
import amthemevars from "../styles/amthemevars.module.scss";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { DataGridPro, gridClasses as proGridClasses } from "@mui/x-data-grid-pro";
import { theme } from "@/app/theme";

export const AMMainCard = styled(Card)<CardProps>(({ theme }) => ({
  boxShadow: "1px 1px 4px 0px rgba(0, 0, 0, 0.05)",
  borderRadius: "4px",
  border: `1px solid ${theme.palette.AMSnowGray.main}`,
}));

export const AMMainCleanCard = styled(Card)<CardProps>(({ theme }) => ({
  boxShadow: "1px 1px 4px 0px rgba(0, 0, 0, 0.05)",
  borderRadius: "4px",
}));

export const AMBlueCard = styled(Card)<CardProps>(({ theme }) => ({
  backgroundColor: theme.palette.AMUltraLightBlue.main,
}));

export const TopSnackBar = styled(Snackbar)<SnackbarProps>(({ theme }) => ({
  padding: "0px",
  width: "100%",
  position: "absolute",
  zIndex: 1,
  [`@media (min-width: 0px)`]: {
    top: "64px",
  },
}));

export const AMStack = styled(Stack)<StackProps>(({ theme }) => ({
  paddingTop: "20px",
  paddingBottom: "20px",
  justifyContent: "space-between",
  backgroundColor: hexToRgba(theme.palette.AMSnowGray.main, 24),
}));

export const AMPrimaryBlueButton = styled(Button)<ButtonProps>(({ theme }) => ({
  backgroundColor: theme.palette.AMLightBlue.main,
  color: theme.palette.AMLightBlue.contrastText,
  ":hover": {
    backgroundColor: theme.palette.AMRed.main,
    color: "white",
  },
}));

export const AMLinkButton = styled(Button)<ButtonProps>(({ theme }) => ({
  color: theme.palette.AMLightBlue.main,
  padding: 0,
  textDecoration: "underline",
  fontSize: "10px",
  textTransform: "none",
  backgroundColor: "transparent",
  minWidth: 0,

  [`@media (min-width: 768px)`]: {
    fontSize: "12px",
  },

  ":hover": {
    backgroundColor: "transparent",
  },
}));

export const AMPrimaryRedButton = styled(Button)<ButtonProps>(({ theme }) => ({
  backgroundColor: theme.palette.AMRed.main,
  color: theme.palette.AMRed.contrastText,
  ":hover": {
    backgroundColor: theme.palette.AMRed.dark,
  },
  ":disabled": {
    backgroundColor: theme.palette.AMMedGray.main, // Cambia esto al color que prefieras
    color: theme.palette.AMMedGray.contrastText, // Opcional: ajusta el color del texto si es necesario
    opacity: "0.3",
  },
}));

export const AMSecondaryButton = styled(Button)<ButtonProps>(({ theme }) => ({
  backgroundColor: theme.palette.AMWhite.main,
  color: theme.palette.AMLightBlue.main,
  border: "1px solid",
  borderColor: theme.palette.AMSnowGray.main,
  ":hover": {
    backgroundColor: theme.palette.AMLightBlue.main,
    color: theme.palette.AMLightBlue.contrastText,
  },
}));

//Tablas en plan gratuito

export const AMStyledDataGrid = styled(DataGrid)(({ theme }) => ({
  caretColor: "transparent",
  border: 0,
  color: theme.palette.mode === "light" ? "rgba(0,0,0,.85)" : "rgba(255,255,255,0.85)",

  WebkitFontSmoothing: "auto",

  letterSpacing: "normal",
  [`& .${gridClasses.columnHeaders}`]: {
    backgroundColor: theme.palette.mode === "light" ? "#fafafa" : "#1d1d1d",
    border: `1px solid ${
      theme.palette.mode === "light" ? theme.palette.AMSnowGray.main : "#303030"
    }`,
    borderRadius: "3px",
    marginBottom: "26px",
    color: theme.palette.primary.main,
    fontFamily: neueHaasUnicaProBold.style.fontFamily,
    maxHeight: "168px !important",
    boxShadow: "0px 0px 5px 0px rgba(0, 0, 0, 0.10)",
  },
  "& .MuiDataGrid-columnsContainer": {
    backgroundColor: theme.palette.mode === "light" ? "#f0f0f0" : "#1d1d1d",
  },
  [`& .${gridClasses.virtualScroller}`]: {
    backgroundColor: theme.palette.mode === "light" ? "#ffffff" : "#1d1d1d",
    minHeight: "110px",
    boxShadow: "0px 0px 5px 0px rgba(0, 0, 0, 0.10)",
    border: `1px solid ${theme.palette.mode === "light" ? "#f2f2f2" : "#303030"}`,
    borderRadius: "3px",
  },
  [`& .${gridClasses.columnHeader}`]: {
    height: "unset !important",
  },
  [`& .${gridClasses.columnHeader}:focus`]: {
    outline: "none",
  },
  [`& .${gridClasses.columnHeaderTitle}`]: {
    whiteSpace: "normal",
    lineHeight: "normal",
  },

  [`& .${gridClasses.columnHeader},${gridClasses.cell}`]: {
    borderRight: `0px solid ${theme.palette.mode === "light" ? "#f0f0f0" : "#303030"}`,
  },
  "& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell": {
    borderBottom: `0px solid ${theme.palette.mode === "light" ? "#f0f0f0" : "#303030"}`,
  },
  [`& .${gridClasses.row} `]: {
    "&:nth-of-type(odd)": {
      backgroundColor: "#FFFFFF",
      "&.Mui-selected": {
        backgroundColor: hexToRgba(theme.palette.AMSnowGray.main, 24),
      },
    },
    "&:nth-of-type(even)": {
      backgroundColor: hexToRgba(theme.palette.AMSnowGray.main, 24),
      "&.Mui-selected": {
        backgroundColor: hexToRgba(theme.palette.AMSnowGray.main, 24),
      },
    },
  },
  [`& .${gridClasses.cell}`]: {
    outline: "none",
  },
  [`& .${gridClasses.cellContent}`]: {
    outline: "none",
    whiteSpace: "normal",
    lineHeight: "normal",
    minHeight: "48px",
    display: "flex",
    alignItems: "center",
    wordBreak: "break-all",
  },
  [`& .${gridClasses.cell}:focus-within`]: {
    outline: "none",
  },
  [`& .${gridClasses.columnSeparator}`]: {
    display: "none",
  },
  //flechas de paginacion
  [`& .${gridClasses.footerContainer}`]: {
    display: "flex",
    width: "100%",
    flexDirection: "row-reverse",
    justifyContent: "center",
  },

  [`& .${tablePaginationClasses.toolbar}`]: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
  },

  [`& .${tablePaginationClasses.actions}`]: {
    order: 1,
  },

  [`& .${tablePaginationClasses.selectLabel}`]: {
    order: 2,
  },

  [`& .${inputBaseClasses.root}`]: {
    order: 3,
  },

  [`& .${tablePaginationClasses.displayedRows}`]: {
    display: "none",
    order: 4,
  },
  [`& .${tablePaginationClasses.selectIcon}`]: {
    color: theme.palette.AMBrandBlue.main,
  },
  [`& .${tablePaginationClasses.select}`]: {
    border: `1px solid ${theme.palette.AMSnowGray.main}`,
    borderRadius: "3px 3px 0px 0px",
    color: theme.palette.AMBrandBlue.main,
    fontFamily: neueHaasUnicaProBold.style.fontFamily,
    fontSize: "14px",
  },

  //El estilo del paper no se aplica ya que no eta dentro del componente de grid
  // [`& .${menuClasses.paper}`]: {
  //   backgroundColor:theme.palette.AMRed.main,
  //   color:'red'
  // },
}));

export const AMStyledNoGapDataGrid = styled(AMStyledDataGrid)(({ theme }) => ({
  [`& .${tablePaginationClasses.menuItem}, .${gridClasses.columnHeaders}`]: {
    marginBottom: "0px",
  },
}));

//Tablas en plan premium

export const AMStyledDataGridPro = styled(DataGridPro)(({ theme }) => ({
  caretColor: "transparent",
  border: 0,
  color: theme.palette.mode === "light" ? "rgba(0,0,0,.85)" : "rgba(255,255,255,0.85)",

  WebkitFontSmoothing: "auto",

  letterSpacing: "normal",
  [`& .${gridClasses.columnHeaders}`]: {
    backgroundColor: theme.palette.mode === "light" ? "#fafafa" : "#1d1d1d",
    border: `1px solid ${
      theme.palette.mode === "light" ? theme.palette.AMSnowGray.main : "#303030"
    }`,
    borderRadius: "3px",
    marginBottom: "26px",
    color: theme.palette.primary.main,
    fontFamily: neueHaasUnicaProBold.style.fontFamily,
    maxHeight: "168px !important",
    boxShadow: "0px 0px 5px 0px rgba(0, 0, 0, 0.10)",
    textAlign: "center",
  },
  "& .MuiDataGrid-columnsContainer": {
    backgroundColor: theme.palette.mode === "light" ? "#f0f0f0" : "#1d1d1d",
  },
  [`& .${gridClasses.virtualScroller}`]: {
    backgroundColor: theme.palette.mode === "light" ? "#ffffff" : "#1d1d1d",
    border: `1px solid ${theme.palette.mode === "light" ? "#f2f2f2" : "#303030"}`,
    borderRadius: "3px",
    minHeight: "171px",
    boxShadow: "0px 0px 5px 0px rgba(0, 0, 0, 0.10)",
  },
  [`& .${gridClasses.columnHeader}`]: {
    height: "unset !important",
  },
  [`& .${gridClasses.columnHeader}:focus`]: {
    outline: "none",
  },
  [`& .${gridClasses.columnHeaderTitle}`]: {
    whiteSpace: "normal",
    lineHeight: "normal",
  },

  [`& .${gridClasses.columnHeader},${gridClasses.cell}`]: {
    borderRight: `0px solid ${theme.palette.mode === "light" ? "#f0f0f0" : "#303030"}`,
  },
  "& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell": {
    borderBottom: `0px solid ${theme.palette.mode === "light" ? "#f0f0f0" : "#303030"}`,
  },

  [`& .${gridClasses.row} `]: {
    "&:nth-of-type(odd)": {
      backgroundColor: "#FFFFFF",
      "&.Mui-selected": {
        backgroundColor: hexToRgba(theme.palette.AMSnowGray.main, 24),
      },
    },
    "&:nth-of-type(even)": {
      backgroundColor: hexToRgba(theme.palette.AMSnowGray.main, 24),
      "&.Mui-selected": {
        backgroundColor: hexToRgba(theme.palette.AMSnowGray.main, 24),
      },
    },
  },

  [`& .${gridClasses.cell}:focus-within`]: {
    outline: "none",
  },
  [`& .${gridClasses.cellContent}`]: {
    outline: "none",
    whiteSpace: "normal",
    lineHeight: "normal",
    minHeight: "48px",
    display: "flex",
    alignItems: "center",
    wordBreak: "break-all",
  },

  [`& .${gridClasses.cell}`]: {
    outline: "none",
  },
  [`& .${gridClasses.columnSeparator}`]: {
    display: "none",
  },
  //flechas de paginacion
  [`& .${gridClasses.footerContainer}`]: {
    display: "flex",
    width: "100%",
    flexDirection: "row-reverse",
    justifyContent: "center",
  },

  [`& .${tablePaginationClasses.toolbar}`]: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
  },

  [`& .${tablePaginationClasses.actions}`]: {
    order: 1,
  },

  [`& .${tablePaginationClasses.selectLabel}`]: {
    order: 2,
    justifySelf: "end",
    marginLeft: "auto",
  },

  [`& .${inputBaseClasses.root}`]: {
    order: 3,
    justifySelf: "end",
  },

  [`& .${tablePaginationClasses.displayedRows}`]: {
    display: "none",
    order: 4,
  },
  [`& .${tablePaginationClasses.selectIcon}`]: {
    color: theme.palette.AMBrandBlue.main,
  },
  [`& .${tablePaginationClasses.select}`]: {
    border: `1px solid ${theme.palette.AMSnowGray.main}`,
    borderRadius: "3px 3px 0px 0px",
    color: theme.palette.AMBrandBlue.main,
    fontFamily: neueHaasUnicaProBold.style.fontFamily,
    fontSize: "14px",
  },
}));

export const AMStyledNoGapDataGridPro = styled(AMStyledDataGridPro)(({ theme }) => ({
  [`& .${tablePaginationClasses.menuItem}, .${gridClasses.columnHeaders}`]: {
    marginBottom: "0px",
  },
}));

export const AMStyledStepper = styled(Stepper)(({ theme }) => ({
  paddingTop: "31px",
  paddingBottom: "31px",

  [`& .${stepIconClasses.root}`]: {
    display: "none",
  },
}));

export const AMMobileStyledStepper = styled(Stepper)(({ theme }) => ({
  [`& .${stepIconClasses.root}`]: {
    display: "none",
  },
  "& .MuiSvgIcon-root": {},
}));

export const AMMobileStyledStep = styled(Step)(({ theme }) => ({
  padding: 0,
  margin: 0,
  width: "100vw",
}));

export const AMMobileStepContent = styled(StepContent)(({ theme }) => ({
  border: "none",
  padding: 0,
  paddingTop: "23px",
  margin: 0,
  maxWidth: "100vw",
  display: "flex",
  overflowX: "scroll",
}));

export const FilterMenuStyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltipArrow}`]: {
    backgroundColor: theme.palette.AMWhite.main,
    color: theme.palette.AMBrandBlue.main,
    maxWidth: 220,
    fontSize: "20px", //el fontsize
    border: `1px solid ${theme.palette.AMSnowGray.main}`,
  },
  [`& .${tooltipClasses.arrow}`]: {
    "&:before": {
      border: `1px solid ${theme.palette.AMSnowGray.main}`,
    },
    color: theme.palette.AMWhite.main,
  },
}));

export const StepperStyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  width: "260px",

  [`& .${tooltipClasses.tooltipArrow}`]: {
    backgroundColor: theme.palette.AMWhite.main,
    color: theme.palette.AMBrandBlue.main,
    marginRight: "10px",
    fontSize: "20px", //el fontsize
    border: `1px solid ${theme.palette.AMSnowGray.main}`,
  },
  [`& .${tooltipClasses.arrow}`]: {
    "&:before": {
      border: `1px solid ${theme.palette.AMSnowGray.main}`,
    },
    color: theme.palette.AMWhite.main,
  },
}));

function hexToRgba(hex: string, transparency: number): string {
  // Parse the hex color values
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Convert transparency from percentage to decimal
  const alpha = transparency / 100;

  // Create and return the rgba color string
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const AMFormControl = styled(FormControl)<FormControlProps>(({ theme }) => ({
  width: "100%",

  paddingLeft: "16px",
  paddingRight: "17px",

  [`@media (min-width: 768px)`]: {
    paddingLeft: "34px",
    paddingRight: "32px",
  },
}));
export const AMFormLabel = styled(FormLabel)<FormLabelProps>(({ theme }) => ({
  fontFamily: neueHaasUnicaProBold.style.fontFamily,
  fontSize: "14px",
  color: theme.palette.AMBrandBlue.main,
  marginBottom: "8px",
}));

export const AMTextField = styled(TextField)<AMTextFieldProps>(({ theme, ...props }) => ({
  fontFamily: neueHaasUnicaProBold.style.fontFamily,
  fontSize: "14px",

  [`& .${outlinedInputClasses.input}`]: {
    backgroundColor: "white",
    "&:-webkit-autofill": {
      WebkitBoxShadow: `0 0 0 1000px ${theme.palette.AMWhite.main} inset`,
      WebkitTextFillColor: theme.palette.AMBrandBlue.main,
    },
    "&:disabled ": {
      // borderColor: theme.palette.AMLightBlue.main,
      borderColor: getColor(props.valuestatus),
      borderWidth: "0.5px",
      color: "green",
    },
  },

  [`& .${outlinedInputClasses.root}`]: {
    "& fieldset": {
      //Primero traen undefined
      //Una vez tocado, cambia a dirty, entonces puede ser 0,1,2
      borderColor: getColor(props.valuestatus),
    },

    "&:hover fieldset": {
      // borderColor: theme.palette.AMLightBlue.main,
      borderColor: getColor(props.valuestatus),
      borderWidth: "0.5px",
    },

    "&.Mui-focused fieldset": {
      borderColor: getColor(props.valuestatus),
      borderWidth: "0.5px",
    },
  },
}));

const getColor = (valuestatus: number | undefined) => {
  switch (valuestatus) {
    case 0:
      return null;
    case 1:
      return theme.palette.success.main;
    case 2:
      return theme.palette.AMRed.main;
    default:
      return null;
  }
};

export const AMAutoComplete = styled(Autocomplete)<AMTextFieldProps>(({ theme, ...props }) => ({
  fontFamily: neueHaasUnicaProBold.style.fontFamily,
  fontSize: "14px",
  [`& .${outlinedInputClasses.input}`]: {
    "&:-webkit-autofill": {
      WebkitBoxShadow: `0 0 0 1000px ${theme.palette.AMWhite.main} inset`,
      WebkitTextFillColor: theme.palette.AMBrandBlue.main,
    },
  },
  [`& .${outlinedInputClasses.root}`]: {
    "& fieldset": {
      borderColor: getColor(props.valuestatus),
    },

    "&:hover fieldset": {
      // borderColor: theme.palette.AMLightBlue.main,
      borderColor: getColor(props.valuestatus),
      borderWidth: "0.5px",
    },

    "&.Mui-focused fieldset": {
      borderColor: getColor(props.valuestatus),
      borderWidth: "0.5px",
    },
  },
}));

interface IAMTextFieldProps {
  valuestatus?: number; //0 para untouched, 1 para ok, 2 para error
}

type AMTextFieldProps = TextFieldProps & IAMTextFieldProps;

export const AMCombobox = styled(Select)(({ theme }) => ({
  fontFamily: neueHaasUnicaProBold.style.fontFamily,
  fontSize: "14px",
  color: theme.palette.AMBrandBlue.main,
  "& .MuiSelect-icon": {
    color: theme.palette.AMRed.main,
  },
  "& .Mui-selected:hover": {
    background: "darkgray",
  },
}));

export const AMMenuItem = styled(MenuItem)(({ theme }) => ({
  fontSize: "14px",
  fontFamily: neueHaasUnicaProRegular.style.fontFamily,
}));

export const AMTextField_2 = styled(TextField)<AMTextFieldProps>(({ theme, ...props }) => ({
  fontFamily: neueHaasUnicaProBold.style.fontFamily,
  fontSize: "12px",
  [`& .${outlinedInputClasses.root}`]: {
    "& fieldset": {
      borderColor: getColor(props.valuestatus),
    },

    "&:hover fieldset": {
      borderColor: getColor(props.valuestatus),
      borderWidth: "0.5px",
    },

    "&.Mui-focused fieldset": {
      borderColor: getColor(props.valuestatus),
      borderWidth: "0.5px",
    },
    "& input": {
      color: theme.palette.AMMedGray.main,
      fontSize: "12px",
    },
  },
  "& .MuiInputLabel-root": {
    shrink: true,
    color: theme.palette.AMBrandBlue.main,
    fontSize: "12px",
    fontFamily: neueHaasUnicaProBold.style.fontFamily,
    paddingTop: "3px",
    marginRight: "0px",
  },
}));

export const BpIcon = styled("span")(({ theme }) => ({
  borderRadius: "50%",
  width: 16,
  height: 16,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 0 0 1px rgb(16 22 26 / 40%)"
      : "inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)",
  backgroundColor: theme.palette.mode === "dark" ? "#fff" : "#f5f8fa",
  backgroundImage:
    theme.palette.mode === "dark"
      ? "linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))"
      : "linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))",
  ".Mui-focusVisible &": {
    outline: "2px auto rgba(19,124,189,.6)",
    outlineOffset: 2,
  },
  "input:hover ~ &": {
    backgroundColor: theme.palette.mode === "dark" ? "#30404d" : "#ebf1f5",
  },
  "input:disabled ~ &": {
    boxShadow: "none",
    background: theme.palette.mode === "dark" ? "rgba(57,75,89,.5)" : "rgba(206,217,224,.5)",
  },
}));

export const BpCheckedIcon = styled(BpIcon)({
  backgroundColor: "#fff",
  backgroundImage: "linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))",
  "&::before": {
    display: "block",
    width: 16,
    height: 16,
    backgroundImage: "radial-gradient(#007DC3,#007DC3 30%,transparent 32%)",
    content: '""',
  },
  "input:hover ~ &": {
    backgroundColor: "#fff",
  },
});

// Inspired by blueprintjs
export function AMRadio(props: RadioProps) {
  return (
    <Radio
      disableRipple
      color="default"
      checkedIcon={<BpCheckedIcon />}
      icon={<BpIcon />}
      {...props}
    />
  );
}

export const AMTextFieldSelect = styled(AMTextField)<AMTextFieldProps>(({ theme, ...props }) => ({
  fontFamily: neueHaasUnicaProRegular.style.fontFamily,
  // height: "50px !important",

  "& .MuiInputLabel-root": {
    fontSize: "12px",
    color: theme.palette.AMBrandBlue.main,
    fontFamily: neueHaasUnicaProRegular.style.fontFamily,
    fontWeight: "normal",
  },
  "& .MuiInputBase": {
    fontFamily: neueHaasUnicaProRegular.style.fontFamily,
    color: getColor(props.valuestatus),
  },

  "& .MuiSelect-icon": {
    borderColor: "#007DC3",
    color: "red",
  },
  "& .MuiSelect-select": {
    fontSize: "14px",
    fontFamily: neueHaasUnicaProRegular.style.fontFamily,
    color: theme.palette.AMBrandBlue.main,
    fontWeight: "0.5px",
  },

  [`& .${outlinedInputClasses.root}`]: {
    fontFamily: neueHaasUnicaProRegular.style.fontFamily,
    "& fieldset": {
      color: theme.palette.AMBrandBlue.main,
      fontFamily: neueHaasUnicaProRegular.style.fontFamily,
    },

    "&:hover fieldset": {
      borderWidth: "1px",
    },

    "&.Mui-focused fieldset": {
      fontFamily: neueHaasUnicaProRegular.style.fontFamily,
      fontWeight: "normal",
      color: theme.palette.AMBrandBlue.main,
      borderWidth: "1px",
    },
  },
}));
interface StyledTabsProps {
  children?: React.ReactNode;
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}
export const AMTabs = styled((props: StyledTabsProps) => (
  <Tabs {...props} TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }} />
))({
  width: "100%",

  "& .MuiTabs-indicator": {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  "& .MuiTabs-indicatorSpan": {
    width: "100%",
    height: "2px",
    backgroundColor: theme.palette.AMBrandBlue.main,
  },

  [`@media (min-width: 768px)`]: {
    paddingTop: "38px",
    // Estilos para pantallas pequeñas
    // Por ejemplo, cambia el color del indicador en pantallas pequeñas
    "& .MuiTabs-indicatorSpan": {
      height: "3px",
    },
  },
});

export const AMTab = styled(Tab)(({ theme }) => ({
  fontSize: "12px",
  padding: "0px",
  marginRight: "0px",
  textTransform: "none",
  fontFamily: neueHaasUnicaProBold.style.fontFamily,
  [`@media (min-width: 768px)`]: {
    fontSize: "18px",
    marginRight: "38px",
  },
}));

export const AMMainBox = styled(Box)(({ theme }) => ({
  paddingTop: "43px",
}));

export const AMButtonGroup = styled(ButtonGroup)<ButtonGroupProps>(({ theme }) => ({
  // backgroundColor: theme.palette.AMRed.main,
  color: theme.palette.AMRed.contrastText,
  ":hover": {
    // backgroundColor: theme.palette.AMRed.dark,
  },
}));

export const AMStepperContainerMainBox = styled(Box)(({ theme }) => ({
  paddingTop: "38px",
  paddingLeft: "0",
  paddingRight: "0",
  width: "100%",

  [`@media (min-width: 768px)`]: {
    paddingLeft: "80px",
    paddingRight: "80px",
    paddingBottom: "32px",
  },

  [`@media (min-width: 1024px)`]: {
    paddingTop: "43px",
    maxWidth: "1200px",
    paddingBottom: "15px",
  },
}));

export const AMBlueCardAdjust = styled(Card)<CardProps>(({ theme }) => ({
  backgroundColor: theme.palette.AMUltraLightBlue.main,
  color: theme.palette.AMBrandBlue.main,
  fontSize: "12px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "97px",
}));

export const AMAccordionSummary = styled(AccordionSummary)<AccordionSummaryProps>(
  ({ theme }) => ({})
);
