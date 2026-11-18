import { createContext, useContext, useState, type ReactNode } from "react";
import {
  aplicarCancelacion,
  aplicarCambioDeTrabajador,
  aplicarEstado,
  evaluarCancelacion,
  evaluarConfirmacion,
  evaluarFinalizacion,
  validarCambioDeTrabajador,
  validarMotivoDeCancelacion,
} from "../utils/reglasDeSolicitudes";
import { crearSolicitudesDeDemostracion } from "./solicitudesDemo";
import { useTrabajadores } from "./TrabajadoresContext";
import type { ResultadoDeOperacion, Solicitud } from "./tipos";

// Lo que ofrece este contexto: la lista y las acciones del flujo
type ValorDelContextoDeSolicitudes = {
  solicitudes: Solicitud[];
  cambiarTrabajadorAsignado: (idDeSolicitud: string, idDelTrabajadorNuevo: string | null) => ResultadoDeOperacion;
  confirmarServicio: (idDeSolicitud: string) => ResultadoDeOperacion;
  finalizarServicio: (idDeSolicitud: string) => ResultadoDeOperacion;
  cancelarSolicitud: (idDeSolicitud: string, motivo: string) => ResultadoDeOperacion;
};

const SolicitudesContext = createContext<ValorDelContextoDeSolicitudes | null>(null);

const SOLICITUD_NO_ENCONTRADA: ResultadoDeOperacion = { exito: false, mensaje: "No se encontró la solicitud." };

// Guarda las solicitudes y aplica las acciones del administrador
export function SolicitudesProvider({ children }: { children: ReactNode }) {
  const { trabajadores } = useTrabajadores();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(() => crearSolicitudesDeDemostracion(new Date()));

  // Actualiza una solicitud dentro de la lista
  function reemplazarSolicitud(solicitudActualizada: Solicitud) {
    setSolicitudes((solicitudesActuales) => solicitudesActuales.map((solicitud) => (solicitud.id === solicitudActualizada.id ? solicitudActualizada : solicitud)));
  }

  function buscarSolicitud(idDeSolicitud: string): Solicitud | undefined {
    return solicitudes.find((solicitud) => solicitud.id === idDeSolicitud);
  }

  // Paso 1: asignar o cambiar al colaborador (valida disponibilidad)
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
    return { exito: true, mensaje: `Colaborador asignado a ${solicitud.id}. Falta confirmar el servicio.` };
  }

  // Paso 2: confirmar el servicio (Pendiente → Confirmado)
  function confirmarServicio(idDeSolicitud: string): ResultadoDeOperacion {
    const solicitud = buscarSolicitud(idDeSolicitud);
    if (!solicitud) {
      return SOLICITUD_NO_ENCONTRADA;
    }
    const permiso = evaluarConfirmacion(solicitud, trabajadores, new Date());
    if (!permiso.exito) {
      return permiso;
    }
    reemplazarSolicitud(aplicarEstado(solicitud, "Confirmado"));
    return { exito: true, mensaje: `${solicitud.id}: servicio confirmado.` };
  }

  // Paso 3: finalizar el servicio (Confirmado → Realizado)
  function finalizarServicio(idDeSolicitud: string): ResultadoDeOperacion {
    const solicitud = buscarSolicitud(idDeSolicitud);
    if (!solicitud) {
      return SOLICITUD_NO_ENCONTRADA;
    }
    const permiso = evaluarFinalizacion(solicitud, new Date());
    if (!permiso.exito) {
      return permiso;
    }
    reemplazarSolicitud(aplicarEstado(solicitud, "Realizado"));
    return { exito: true, mensaje: `${solicitud.id}: servicio finalizado. El cliente ya puede calificarlo.` };
  }

  // Cancelar con motivo (solo si no está finalizada)
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
    return { exito: true, mensaje: `${solicitud.id} quedó cancelada.` };
  }

  return (
    <SolicitudesContext.Provider value={{ solicitudes, cambiarTrabajadorAsignado, confirmarServicio, finalizarServicio, cancelarSolicitud }}>{children}</SolicitudesContext.Provider>
  );
}

// Hook para usar las solicitudes en cualquier pantalla
export function useSolicitudes(): ValorDelContextoDeSolicitudes {
  const valor = useContext(SolicitudesContext);
  if (!valor) {
    throw new Error("useSolicitudes debe usarse dentro de SolicitudesProvider");
  }
  return valor;
}
