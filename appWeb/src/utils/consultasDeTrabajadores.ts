import { 
  claveDeFechaDesdeIso, 
  MILISEGUNDOS_POR_MINUTO, 
  obtenerClaveDeFecha 
} from "./fechas";

import { horarioCubreLaFecha } from "./horarios";
import { estaActiva } from "./reglasDeSolicitudes";

import type { 
  Solicitud, 
  SolicitudListado, 
  Trabajador 
} from "../data/tipos";

const DURACION_DE_REFERENCIA_EN_MINUTOS = 120;

export type Reputacion = { promedio: number | null; cantidad: number };

// Promedio de calificaciones de sus servicios
//Cambiar either this or agregar lo de calificacion al schema
/*export function calcularReputacion(solicitudes: SolicitudListado[], idDelTrabajador: string): Reputacion {
  const puntuaciones = solicitudes 
    .filter((solicitud) => solicitud.idTrabajador === idDelTrabajador && solicitud.calificacion)
    .map((solicitud) => solicitud.calificacion!.puntuacion);
  if (puntuaciones.length === 0) {
    return { promedio: null, cantidad: 0 };
  }
  const suma = puntuaciones.reduce((total, puntuacion) => total + puntuacion, 0);
  return { promedio: suma / puntuaciones.length, cantidad: puntuaciones.length };
}
*/

export function describirReputacion(reputacion: Reputacion): string {
  if (reputacion.promedio === null) {
    return "Sin calificaciones";
  }
  const textoDeCalificaciones = reputacion.cantidad === 1 ? "calificación" : "calificaciones";
  return `${reputacion.promedio.toFixed(1)} de 5 · ${reputacion.cantidad} ${textoDeCalificaciones}`;
}

export type EstadoDelTrabajador = "Disponible" | "En servicio" | "Fuera de horario" | "Inactivo";

// Estado actual: disponible, en servicio, fuera de horario o inactivo
export function calcularEstadoDelTrabajador(solicitudes: SolicitudListado[], trabajador: Trabajador, ahora: Date): EstadoDelTrabajador {
  if (trabajador.estado === "Inactivo") {
    return "Inactivo";
  }
  const momento = ahora.getTime();
  const estaEnUnServicio = solicitudes.some((solicitud) => {
    if (solicitud.idTrabajador !== trabajador.id || solicitud.estado !== "Confirmado") {
      return false;
    }
    const inicio = new Date(solicitud.fechaProgramada).getTime();
    return momento >= inicio && momento < inicio + DURACION_DE_REFERENCIA_EN_MINUTOS * MILISEGUNDOS_POR_MINUTO;
  });
  if (estaEnUnServicio) {
    return "En servicio";
  }
  if (!horarioCubreLaFecha(trabajador.horario, ahora.toISOString())) {
    return "Fuera de horario";
  }
  return "Disponible";
}

export function obtenerServiciosActivos(solicitudes: SolicitudListado[], idTrabajador: string): SolicitudListado[] {
  return solicitudes
    .filter((solicitud) => solicitud.idTrabajador === idTrabajador && estaActiva(solicitud))
    .sort((a, b) => new Date(a.fechaProgramada).getTime() - new Date(b.fechaProgramada).getTime());
}

export function contarServiciosDeHoy(solicitudes: SolicitudListado[], idDelTrabajador: string, ahora: Date): number {
  const claveDeHoy = obtenerClaveDeFecha(ahora);
  return obtenerServiciosActivos(solicitudes, idDelTrabajador).filter((solicitud) => claveDeFechaDesdeIso(solicitud.fechaProgramada) === claveDeHoy).length;
}
