import SelectItem from "./selectitem.model";

//Interfaz para formulario de DT
export interface BasicFormProps<T> {
  onSubmit: (model: T) => void;
  getModel?: (model: T) => void;
  getRef?: (ref: React.MutableRefObject<HTMLFormElement | null>) => void;
  model?: T;
  catalogoTipo?: SelectItem[];
  catalogoDocumento?: SelectItem[];
  catalogoEstado?: SelectItem[];
  catalogoProceso?: SelectItem[];
  catalogoInsumo?: SelectItem[];
}

export interface CustomFormProps<T> extends BasicFormProps<T> {
  onResend: () => void;
  onSendCodePassword?: (model: T) => void;
}

//Interfaz para formulario de Dialog
export interface BasicModelFormProps<T> {
  model: T;
  onInsert: (model: T) => void;
  onUpdate?: (model: T) => void;
  getModel?: (model: T) => void;
}
