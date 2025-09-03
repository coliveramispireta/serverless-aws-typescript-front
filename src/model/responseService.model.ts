export interface Response {
  config: any;
  data: {
    status: number;
    message: string;
    data: string;
  };
  headers: Record<string, string>;
  request: XMLHttpRequest;
  status: number;
  statusText: string;
}

export interface ResponseSP {
  config: any;
  data: unknown[];
  headers: Record<string, string>;
  request: XMLHttpRequest;
  status: number;
  statusText: string;
  message?: string;
}

export interface ResponseBuscarBoleto {
  ID: number;
  COD_FACT: string;
  DOC_TYPE: string;
  DOC_TYPE_DESC: string;
  FECHA_EMI: string;
  IATA: string;
  MONEDA: string;
  MOT: string;
  NOM_CLIENTE: string;
  ORIGEN: string;
  PATHACUSE: string;
  PATHPDF: string;
  PATHXML: string;
  PNR: string;
  RFC: string;
  TICKETNUMBER: string;
  TIPO: string;
  TIPO_TRANS: string;
  TIPO_VENTA: string;
  TOTAL: string;
  USER: string;
  UUID: string;
  XMLID: string;
}

export interface ResponseValidateTicketRFC {
  ID: number;
  UUID: string;
  isValirRFC: string;
}

export interface ResponseTimbrado {
  status: string;
  zip: string; // Archivo comprimido (si existe, puede ser vacío)
  data: [
    {
      estado: string; // Estado del documento (e.g., "TIMBRADO")
      pathpdf: string; // Ruta o mensaje de error para el archivo PDF
      pathxml: string; // Ruta al archivo XML
      pnr: string; // Código de reserva
      serie: string; // Serie del documento
      tkt: string; // Número de ticket
      trans: string; // Tipo de transacción (e.g., "SALE")
      uuid: string; // Identificador único (UUID)];
    },
  ];
}

export interface ResponseMisFacturaData {
  ID: number;
  DOC_DESC: string;
  ESTADO: string;
  FECHA_TIMB: string;
  RFC: string;
  TX_NAME: string;
  TX_PATH: string;
  TX_PATHPDF: string;
  TX_PNR: string;
  TX_TICKETNUMBER: string;
  [key: number]: string;
}
