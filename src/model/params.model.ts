export interface SPParameters {
  spName: string;
  params: string[];
}

export type UserEmail = string;
export type TicketPnr = string;

export interface ParamsValidateRFC {
  UUID: string;
  P_TKT: string;
  P_RFC: string;
  P_TIPO_DOC: string;
  P_TIPO_VEN: string;
}
