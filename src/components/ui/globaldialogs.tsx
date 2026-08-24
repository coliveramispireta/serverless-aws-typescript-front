"use client";
import { useContext } from "react";
import PageContext from "@/context/pagecontext/pagecontext";
import ErrorDialog from "@/smartcomponents/custom/errordialog/errordialog";
import InfoDialog from "@/smartcomponents/custom/infodialog/infodialog";
import SuccessDialog from "@/smartcomponents/custom/successdialog/successdialog";
import WarningDialog from "@/smartcomponents/custom/warningdialog/warningdialog";

/**
 * Diálogos globales conectados al PageContext.
 * Incluirlos una vez por sección que los necesite.
 */
export default function GlobalDialogs() {
  const pageContext = useContext(PageContext);
  if (!pageContext) return null;

  const { successState, errorState, warningState, infoState } = pageContext;

  return (
    <>
      <SuccessDialog
        message={successState.pageMessage.value}
        open={successState.pageDialog.value}
        onClose={successState.handleCloseDialog}
      />
      <ErrorDialog
        message={errorState.pageMessage.value}
        open={errorState.pageDialog.value}
        onClose={errorState.handleCloseDialog}
      />
      <WarningDialog
        message={warningState.pageMessage.value}
        open={warningState.pageDialog.value}
        onClose={warningState.handleCloseDialog}
      />
      <InfoDialog
        message={infoState.pageMessage.value}
        open={infoState.pageDialog.value}
        onClose={infoState.handleCloseDialog}
      />
    </>
  );
}
