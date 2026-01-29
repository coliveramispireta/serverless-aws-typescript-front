//Guards encargadas de las paginas de sys
//Las guards expuestas son inspiradas en las guards funcionales de angular
//Estas simplemente devuelven el boleano de si se puede ver o no la pagina
//Estas implementaciones van en el layout principal de cada modulo

import { ROLES } from "./global";
import { getUserInfo } from "../services/xstorage.cross.service";

//Todas las guardas deben de devolver siempre un booleano
export function sysAuthGuard() {
  //Se obtiene la data del usuario directamente del store
  const userInfo = getUserInfo();

  if (userInfo.isLogged) {
    // if (userInfo["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] == ROLES.ADMINISTRADOR) {
    //       return true
    //     } else {
    //       return false;
    //     }
    return true;
  }
  return false;
}
