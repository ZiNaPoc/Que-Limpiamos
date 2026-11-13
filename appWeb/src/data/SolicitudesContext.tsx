import { createContext, useContext, useState, type ReactNode } from "react";
import {
  aplicarAcuerdoDePrecio,
  aplicarCancelacion,
  aplicarCambioDeTrabajador,
  evaluarCancelacion,
  evaluarRegistroDeAcuerdoDePrecio,
  validarAcuerdoDePrecio,
  validarCambioDeTrabajador,
  validarMotivoDeCancelacion,
  type DatosDeAcuerdoDePrecio,
} from "../utils/reglasDeSolicitudes";
import { crearSolicitudesDeDemostracion } from "./solicitudesDemo";
import { useTrabajadores } from "./TrabajadoresContext";
import type { ResultadoDeOperacion, Solicitud } from "./tipos";

// Las solicitudes las crea el cliente desde la app móvil. El panel no las crea ni edita su
// servicio, horario o descripción: solo supervisa, asigna colaborador antes de su confirmación,
// registra el precio confirmado y, si hace falta, cancela con un motivo.
// Sin backend, todo vive en memoria mientras la pestaña siga abierta.

type ValorDelContextoDeSolicitudes = {
  solicitudes: Solicitud[];
  cambiarTrabajadorAsignado: (idDeSolicitud: string, idDelTrabajadorNuevo: string | null) => ResultadoDeOperacion;
  registrarAcuerdoDePrecio: (idDeSolicitud: string, datos: DatosDeAcuerdoDePrecio) => ResultadoDeOperacion;
  cancelarSolicitud: (idDeSolicitud: string, motivo: string) => ResultadoDeOperacion;
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
    if (idDelTrabajadorNuevo === null) {
      return { exito: true, mensaje: `${solicitud.id} quedó sin colaborador asignado.` };
    }
    return { exito: true, mensaje: `Colaborador asignado a ${solicitud.id}. Queda pendiente su confirmación.` };
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
    return { exito: true, mensaje: `Precio final registrado en ${solicitud.id}.` };
  }

  function cancelarSolicitud(idDeSolicitud: string, motivo: string): ResultadoDeOperacion {
    const solicitud = buscarSolicitud(idDeSolicitud);
    if (!solicitud) {
      return SOLICITUD_NO_ENCONTRADA;
    }
    const permiso = evaluarCancelacion(solicitud);
    if (!permiso.exito) {
      return permiso;
    }
    const errorDelMotivo = validarMotivoDeCancelacion(motivo);
    if (errorDelMotivo) {
      return { exito: false, mensaje: errorDelMotivo };
    }
    reemplazarSolicitud(aplicarCancelacion(solicitud, motivo, new Date()));
    return { exito: true, mensaje: `${solicitud.id} quedó cancelada. El cliente la verá así en su historial.` };
  }

  return (
    <SolicitudesContext.Provider value={{ solicitudes, cambiarTrabajadorAsignado, registrarAcuerdoDePrecio, cancelarSolicitud }}>{children}</SolicitudesContext.Provider>
  );
}

export function useSolicitudes(): ValorDelContextoDeSolicitudes {
  const valor = useContext(SolicitudesContext);
  if (!valor) {
    throw new Error("useSolicitudes debe usarse dentro de SolicitudesProvider");
  }
  return valor;
}
