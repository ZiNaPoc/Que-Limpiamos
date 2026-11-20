import { useContext } from "react";

import {
  SolicitudesContext,
  type ValorDelContextoDeSolicitudes,
} from "../data/SolicitudesContext";

export function useSolicitudes(): ValorDelContextoDeSolicitudes {
  const valor = useContext(SolicitudesContext);

  if (!valor) {
    throw new Error("useSolicitudes debe usarse dentro de SolicitudesProvider");
  }

  return valor;
}
