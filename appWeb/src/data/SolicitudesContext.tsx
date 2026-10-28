import { createContext, useContext, useState, type ReactNode } from "react";
import {
  aplicarAcuerdoDePrecio,
  aplicarCambioDeTrabajador,
  evaluarIncorporacionDeEvidencias,
  evaluarRegistroDeAcuerdoDePrecio,
  validarAcuerdoDePrecio,
  validarCambioDeTrabajador,
  type DatosDeAcuerdoDePrecio,
} from "../utils/reglasDeSolicitudes";
import { crearSolicitudesDeDemostracion } from "./solicitudesDemo";
import { useTrabajadores } from "./TrabajadoresContext";
import type { EvidenciaFotografica, ResultadoDeOperacion, Solicitud } from "./tipos";

type ValorDelContextoDeSolicitudes = {
  solicitudes: Solicitud[];
  cambiarTrabajadorAsignado: (idDeSolicitud: string, idDelTrabajadorNuevo: string | null) => ResultadoDeOperacion;
  registrarAcuerdoDePrecio: (idDeSolicitud: string, datos: DatosDeAcuerdoDePrecio) => ResultadoDeOperacion;
  incorporarEvidencias: (idDeSolicitud: string, evidencias: EvidenciaFotografica[]) => ResultadoDeOperacion;
};

const SolicitudesContext = createContext<ValorDelContextoDeSolicitudes | null>(null);

const SOLICITUD_NO_ENCONTRADA: ResultadoDeOperacion = { exito: false, mensaje: "No se encontró la solicitud." };

export function SolicitudesProvider({ children }: { children: ReactNode }) {
  const { trabajadores } = useTrabajadores();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(() => crearSolicitudesDeDemostracion(new Date()));

  function reemplazarSolicitud(solicitudActualizada: Solicitud) {
    setSolicitudes((solicitudesActuales) =>
      solicitudesActuales.map((solicitud) => (solicitud.id === solicitudActualizada.id ? solicitudActualizada : solicitud)),
    );
  }

  function buscarSolicitud(idDeSolicitud: string): Solicitud | undefined {
    return solicitudes.find((solicitud) => solicitud.id === idDeSolicitud);
  }

  function cambiarTrabajadorAsignado(idDeSolicitud: string, idDelTrabajadorNuevo: string | null): ResultadoDeOperacion {
    const solicitud = buscarSolicitud(idDeSolicitud);
    if (!solicitud) {
      return SOLICITUD_NO_ENCONTRADA;
    }
    const validacion = validarCambioDeTrabajador(solicitud, idDelTrabajadorNuevo, solicitudes, trabajadores);
    if (!validacion.exito) {
      return validacion;
    }
    reemplazarSolicitud(aplicarCambioDeTrabajador(solicitud, idDelTrabajadorNuevo));
    return { exito: true, mensaje: "Asignación actualizada en esta sesión de demostración." };
  }

  function registrarAcuerdoDePrecio(idDeSolicitud: string, datos: DatosDeAcuerdoDePrecio): ResultadoDeOperacion {
    const solicitud = buscarSolicitud(idDeSolicitud);
    if (!solicitud) {
      return SOLICITUD_NO_ENCONTRADA;
    }
    const permiso = evaluarRegistroDeAcuerdoDePrecio(solicitud);
    if (!permiso.exito) {
      return permiso;
    }
    const errores = validarAcuerdoDePrecio(solicitud, datos);
    const primerError = errores.precio ?? errores.aceptaciones;
    if (primerError) {
      return { exito: false, mensaje: primerError };
    }
    reemplazarSolicitud(aplicarAcuerdoDePrecio(solicitud, Number(datos.precio), new Date()));
    return { exito: true, mensaje: "Acuerdo de precio registrado solo en esta sesión de demostración." };
  }

  function incorporarEvidencias(idDeSolicitud: string, evidencias: EvidenciaFotografica[]): ResultadoDeOperacion {
    const solicitud = buscarSolicitud(idDeSolicitud);
    if (!solicitud) {
      return SOLICITUD_NO_ENCONTRADA;
    }
    const permiso = evaluarIncorporacionDeEvidencias(solicitud, evidencias.length);
    if (!permiso.exito) {
      return permiso;
    }
    reemplazarSolicitud({ ...solicitud, evidencias: [...solicitud.evidencias, ...evidencias] });
    let mensaje = `${evidencias.length} fotografías agregadas a ${solicitud.id} mientras esta pestaña siga abierta.`;
    if (evidencias.length === 1) {
      mensaje = `1 fotografía agregada a ${solicitud.id} mientras esta pestaña siga abierta.`;
    }
    return { exito: true, mensaje };
  }

  return (
    <SolicitudesContext.Provider value={{ solicitudes, cambiarTrabajadorAsignado, registrarAcuerdoDePrecio, incorporarEvidencias }}>{children}</SolicitudesContext.Provider>
  );
}

export function useSolicitudes(): ValorDelContextoDeSolicitudes {
  const valor = useContext(SolicitudesContext);
  if (!valor) {
    throw new Error("useSolicitudes debe usarse dentro de SolicitudesProvider");
  }
  return valor;
}
