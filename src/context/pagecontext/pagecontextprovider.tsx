"use client";
import { ReactNode, useEffect, useState } from "react";
import PageContext, { KeyValueState, PageState, ProfileKeys } from "./pagecontext";
import { getUserProfile } from "../../services/xstorage.cross.service";

export function PageContextProvider({ children }: { children: ReactNode }) {
  const [pageErrorState, setpageErrorState] = useState<string>(""); //estado del mensaje de exitos
  const [requestFileSelectedId, setRequestFileSelectedId] = useState<number>(0); //estado del mensaje de exitos

  const [currentProfile, setCurrentProfile] = useState<ProfileKeys>(getUserProfile());
  const [pageSuccess, setpageSuccess] = useState(false); //estado de los exitos de la pagina
  const [pageSuccessMessage, setpageSuccessMessage] = useState<string>(""); //estado del mensaje de exitos
  const [openSuccessDialog, setopenSuccessDialog] = useState(false); //Estado del dialogo de exitos
  const [snackMessage, setSnackMessage] = useState<string>("");

  const handleOpenSuccessDialog = () => {
    setopenSuccessDialog(true);
  };

  const handleCloseSuccessDialog = () => {
    // En caso de querer colocar GridLogicOperator, deberia ir aqui
    setopenSuccessDialog(false);
  };

  const [pageError, setpageError] = useState(false); //estado de los errores de la pagina
  const [pageErrorMessage, setpageErrorMessage] = useState<string>(""); //estado del mensaje de error
  const [openErrorDialog, setopenErrorDialog] = useState(false); //Estado del dialogo de error
  const handleOpenErrorDialog = () => {
    setopenErrorDialog(true);
  };

  const handleCloseErrorDialog = () => {
    // En caso de querer colocar GridLogicOperator, deberia ir aqui
    setopenErrorDialog(false);
    setpageErrorMessage("");
  };

  const [pageWarning, setpageWarning] = useState(false); // estado de las advertencias de la página
  const [pageWarningMessage, setpageWarningMessage] = useState<string>(""); // estado del mensaje de advertencia
  const [openWarningDialog, setopenWarningDialog] = useState(false); // Estado del diálogo de advertencia

  const handleOpenWarningDialog = () => {
    setopenWarningDialog(true);
  };

  const handleCloseWarningDialog = () => {
    // En caso de querer colocar GridLogicOperator, debería ir aquí
    setopenWarningDialog(false);
    setpageWarningMessage("");
  };

  const [pageInfo, setpageInfo] = useState(false); // estado de la información de la página
  const [pageInfoMessage, setpageInfoMessage] = useState<string>(""); // estado del mensaje de información
  const [openInfoDialog, setopenInfoDialog] = useState(false); // Estado del diálogo de información

  const handleOpenInfoDialog = () => {
    setopenInfoDialog(true);
  };

  const handleCloseInfoDialog = () => {
    // En caso de querer colocar GridLogicOperator, debería ir aquí
    setopenInfoDialog(false);
    setpageInfoMessage("");
  };

  const [downloading, setDownLoading] = useState(false);
  const [downloadingLabel, setDownloadingLabel] = useState(0);

  const [generating, setGenerating] = useState(false);
  const [generatingLabel, setGeneratingLabel] = useState(0);

  const [apiCallState, setApiCallState] = useState(false);
  const [serviceErrorState, setServiceErrorState] = useState<KeyValueState>({
    default: false,
  } as KeyValueState);

  //Error handling para todos los procesos, si se desea customizar, favor de hacerlo dentro del if con errores customizados
  //Y no creando más ifs

  const state: PageState = {
    requestFileSelectedId: { value: requestFileSelectedId, setValue: setRequestFileSelectedId },
    currentProfile: { value: currentProfile, setValue: setCurrentProfile },
    // snackBarMessages: { value: stateSnackBar, setValue: setStateSnackBar },
    pageErrorState: { value: pageErrorState, setValue: setpageErrorState },
    successState: {
      // pageValue:{value:pageSuccess, setValue:setpageSuccess},
      pageMessage: { value: pageSuccessMessage, setValue: setpageSuccessMessage },
      pageDialog: { value: openSuccessDialog, setValue: setopenSuccessDialog },
      handleOpenDialog: handleOpenSuccessDialog,
      handleCloseDialog: handleCloseSuccessDialog,
    },
    errorState: {
      // pageValue:{value:pageError, setValue:setpageError},
      pageMessage: { value: pageErrorMessage, setValue: setpageErrorMessage },
      pageDialog: { value: openErrorDialog, setValue: setopenErrorDialog },
      handleOpenDialog: handleOpenErrorDialog,
      handleCloseDialog: handleCloseErrorDialog,
    },
    warningState: {
      // pageValue:{value:pageWarning, setValue:setpageWarning},
      pageMessage: { value: pageWarningMessage, setValue: setpageWarningMessage },
      pageDialog: { value: openWarningDialog, setValue: setopenWarningDialog },
      handleOpenDialog: handleOpenWarningDialog,
      handleCloseDialog: handleCloseWarningDialog,
    },

    infoState: {
      // pageValue:{value:pageInfo, setValue:setpageInfo},
      pageMessage: { value: pageInfoMessage, setValue: setpageInfoMessage },
      pageDialog: { value: openInfoDialog, setValue: setopenInfoDialog },
      handleOpenDialog: handleOpenInfoDialog,
      handleCloseDialog: handleCloseInfoDialog,
    },
    ajaxDownloadingState: {
      downloading: { value: downloading, setValue: setDownLoading },
      infoPendientes: { value: downloadingLabel, setValue: setDownloadingLabel },
    },
    ajaxGeneratingState: {
      generating: { value: generating, setValue: setGenerating },
      infoPendientes: { value: generatingLabel, setValue: setGeneratingLabel },
    },
    apiCallState: { value: apiCallState, setValue: setApiCallState },
    serviceErrorState: { value: serviceErrorState, setValue: setServiceErrorState },
  };

  return <PageContext.Provider value={state}>{children}</PageContext.Provider>;
}
