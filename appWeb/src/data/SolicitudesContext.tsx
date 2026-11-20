import { createContext } from "react";

import type { ResultadoDeOperacion, SolicitudListado } from "./tipos";

export type ValorDelContextoDeSolicitudes = {
  solicitudes: SolicitudListado[];
  cargando: boolean;
  errorCarga: string | null;

  recargarSolicitudes: () => Promise<void>;

  cambiarTrabajadorAsignado: (
    idSolicitud: string,
    idTrabajadorNuevo: string | null,
  ) => Promise<ResultadoDeOperacion>;
};

export const SolicitudesContext =
  createContext<ValorDelContextoDeSolicitudes | null>(null);
