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

// Lo que ofrece este almacén: la lista de solicitudes y las 4 acciones del administrador.
// Cada acción devuelve un ResultadoDeOperacion (exito + mensaje) que la pantalla muestra en el aviso temporal.
type ValorDelContextoDeSolicitudes = {
  solicitudes: Solicitud[];
  cambiarTrabajadorAsignado: (idDeSolicitud: string, idDelTrabajadorNuevo: string | null) => ResultadoDeOperacion;
  confirmarServicio: (idDeSolicitud: string) => ResultadoDeOperacion;
  finalizarServicio: (idDeSolicitud: string) => ResultadoDeOperacion;
  cancelarSolicitud: (idDeSolicitud: string, motivo: string) => ResultadoDeOperacion;
};

const SolicitudesContext = createContext<ValorDelContextoDeSolicitudes | null>(null);

// Respuesta lista para cuando el id no existe.
const SOLICITUD_NO_ENCONTRADA: ResultadoDeOperacion = { exito: false, mensaje: "No se encontró la solicitud." };

// Guarda las solicitudes y aplica las acciones del administrador.
// La solicitud la crea el cliente desde la app móvil - el administrador asigna colaborador - confirma - finaliza (o cancela).
// Cada acción primero revisa las reglas y solo si pasan cambia la solicitud.
// Si otro administrador ya cambió la solicitud, el back debe avisarlo en lugar de aplicar la acción a ciegas.
// Después de cada acción conviene usar la solicitud que devuelve el back (o volver a pedirla) para que la lista y el detalle muestren el estado real.
export function SolicitudesProvider({ children }: { children: ReactNode }) {
  const { trabajadores } = useTrabajadores();
  // Lista completa de solicitudes en memoria. Cuando cambia, todas las pantallas que la usan se actualizan solas.
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(() => crearSolicitudesDeDemostracion(new Date()));

  // Actualiza una sola solicitud dentro de la lista (las demás se quedan igual).
  function reemplazarSolicitud(solicitudActualizada: Solicitud) {
    setSolicitudes((solicitudesActuales) => solicitudesActuales.map((solicitud) => (solicitud.id === solicitudActualizada.id ? solicitudActualizada : solicitud)));
  }

  // Busca una solicitud por su id (devuelve undefined si no existe).
  function buscarSolicitud(idDeSolicitud: string): Solicitud | undefined {
    return solicitudes.find((solicitud) => solicitud.id === idDeSolicitud);
  }

  // Primero: asignar, cambiar o quitar al colaborador. Solo se puede mientras la solicitud esté Pendiente.
  // Revisa que el colaborador exista, esté activo, trabaje a esa hora y no tenga otro servicio cerca.
  // pero todavía no revisa horario ni choque de horas, y aquí la especialidad solo avisa (no bloquea).
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

  // Confirmar el servicio (Pendiente - Confirmado). Necesita colaborador activo y que no haya pasado más de 1 hora de la hora programada.
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

  // Finalizar el servicio (Confirmado -- Realizado). Solo desde la hora programada en adelante.
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

  // cancelar se puede en cualquier momento antes de finalizar y siempre con un motivo (de 10 a 300 letras) que verá el cliente.
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

// Hook para usar las solicitudes en cualquier pantalla (solo funciona dentro de SolicitudesProvider).
export function useSolicitudes(): ValorDelContextoDeSolicitudes {
  const valor = useContext(SolicitudesContext);
  if (!valor) {
    throw new Error("useSolicitudes debe usarse dentro de SolicitudesProvider");
  }
  return valor;
}
