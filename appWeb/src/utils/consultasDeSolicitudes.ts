import { claveDeFechaDesdeIso, diasEntre } from "./fechas";
import { buscarTrabajador } from "../data/trabajadores";
import { buscarCliente } from "../data/ClientesContext";
import type { Cliente, FiltrosDeSolicitudes, Solicitud, Trabajador } from "../data/tipos";

export const FILTROS_VACIOS: FiltrosDeSolicitudes = {
  busqueda: "",
  estado: "todos",
  fechaDelTrabajo: "todas",
  fechaDeSolicitud: "todas",
  asignacion: "todas",
};

export const FILTROS_PENDIENTES_DE_HOY: FiltrosDeSolicitudes = {
  ...FILTROS_VACIOS,
  estado: "Pendiente",
  fechaDelTrabajo: "hoy",
  asignacion: "sinAsignar",
};

export const FILTROS_SIN_COLABORADOR: FiltrosDeSolicitudes = {
  ...FILTROS_VACIOS,
  estado: "Pendiente",
  asignacion: "sinAsignar",
};

export const FILTROS_ESPERANDO_CONFIRMACION: FiltrosDeSolicitudes = {
  ...FILTROS_VACIOS,
  estado: "Pendiente",
  asignacion: "asignadas",
};

// Solicitudes pendientes sin colaborador cuyo servicio todavía no pasa.
export function obtenerSinColaborador(solicitudes: Solicitud[], ahora: Date): Solicitud[] {
  return solicitudes.filter((solicitud) => solicitud.estado === "Pendiente" && solicitud.idDelTrabajador === null && milisegundosDe(solicitud.fechaProgramada) >= ahora.getTime() - 60 * 60 * 1000);
}

export function obtenerEsperandoConfirmacion(solicitudes: Solicitud[]): Solicitud[] {
  return solicitudes.filter((solicitud) => solicitud.estado === "Pendiente" && solicitud.idDelTrabajador !== null);
}

function milisegundosDe(fechaIso: string): number {
  return new Date(fechaIso).getTime();
}

export function tieneFiltrosActivos(filtros: FiltrosDeSolicitudes): boolean {
  return (
    filtros.busqueda.trim() !== "" ||
    filtros.estado !== FILTROS_VACIOS.estado ||
    filtros.fechaDelTrabajo !== FILTROS_VACIOS.fechaDelTrabajo ||
    filtros.fechaDeSolicitud !== FILTROS_VACIOS.fechaDeSolicitud ||
    filtros.asignacion !== FILTROS_VACIOS.asignacion
  );
}

export function obtenerPendientesDeAsignarHoy(solicitudes: Solicitud[], claveDeHoy: string): Solicitud[] {
  return solicitudes
    .filter((solicitud) => claveDeFechaDesdeIso(solicitud.fechaProgramada) === claveDeHoy && solicitud.estado === "Pendiente" && solicitud.idDelTrabajador === null)
    .sort((a, b) => milisegundosDe(a.fechaProgramada) - milisegundosDe(b.fechaProgramada));
}

export function obtenerServiciosEnProcesoHoy(solicitudes: Solicitud[], claveDeHoy: string): Solicitud[] {
  return solicitudes
    .filter((solicitud) => claveDeFechaDesdeIso(solicitud.fechaProgramada) === claveDeHoy && solicitud.estado === "Confirmado")
    .sort((a, b) => milisegundosDe(a.fechaProgramada) - milisegundosDe(b.fechaProgramada));
}

export function obtenerSolicitudesRecientes(solicitudes: Solicitud[], cantidadMaxima: number): Solicitud[] {
  return [...solicitudes].sort((a, b) => milisegundosDe(b.fechaDeCreacion) - milisegundosDe(a.fechaDeCreacion)).slice(0, cantidadMaxima);
}

function coincideConFechaDelTrabajo(solicitud: Solicitud, filtro: FiltrosDeSolicitudes["fechaDelTrabajo"], claveDeHoy: string): boolean {
  if (filtro === "todas") {
    return true;
  }
  const diasHastaElTrabajo = diasEntre(claveDeFechaDesdeIso(solicitud.fechaProgramada), claveDeHoy);
  if (filtro === "hoy") {
    return diasHastaElTrabajo === 0;
  }
  if (filtro === "manana") {
    return diasHastaElTrabajo === 1;
  }
  if (filtro === "despues") {
    return diasHastaElTrabajo > 1;
  }
  return diasHastaElTrabajo < 0;
}

function coincideConFechaDeSolicitud(solicitud: Solicitud, filtro: FiltrosDeSolicitudes["fechaDeSolicitud"], claveDeHoy: string): boolean {
  if (filtro === "todas") {
    return true;
  }
  const diasDesdeLaSolicitud = diasEntre(claveDeHoy, claveDeFechaDesdeIso(solicitud.fechaDeCreacion));
  if (filtro === "hoy") {
    return diasDesdeLaSolicitud === 0;
  }
  return diasDesdeLaSolicitud >= 0 && diasDesdeLaSolicitud <= 6;
}

function coincideConAsignacion(solicitud: Solicitud, filtro: FiltrosDeSolicitudes["asignacion"]): boolean {
  if (filtro === "todas") {
    return true;
  }
  if (filtro === "sinAsignar") {
    return solicitud.idDelTrabajador === null;
  }
  return solicitud.idDelTrabajador !== null;
}

function coincideConLaBusqueda(solicitud: Solicitud, busqueda: string, trabajadores: Trabajador[], clientes: Cliente[]): boolean {
  const textoBuscado = busqueda.trim().toLowerCase();
  if (textoBuscado === "") {
    return true;
  }
  const trabajador = buscarTrabajador(trabajadores, solicitud.idDelTrabajador);
  const cliente = buscarCliente(clientes, solicitud.idDelCliente);
  const camposDondeBuscar = [
    solicitud.id,
    solicitud.idDelCliente,
    cliente ? `${cliente.nombre} ${cliente.correo} ${cliente.telefono}` : "",
    solicitud.servicio,
    solicitud.direccion,
    solicitud.descripcion,
    trabajador ? trabajador.nombre : "",
  ];
  return camposDondeBuscar.join(" ").toLowerCase().includes(textoBuscado);
}

export function filtrarSolicitudes(solicitudes: Solicitud[], filtros: FiltrosDeSolicitudes, claveDeHoy: string, trabajadores: Trabajador[], clientes: Cliente[]): Solicitud[] {
  return solicitudes
    .filter((solicitud) => {
      if (filtros.estado !== "todos" && solicitud.estado !== filtros.estado) {
        return false;
      }
      return (
        coincideConFechaDelTrabajo(solicitud, filtros.fechaDelTrabajo, claveDeHoy) &&
        coincideConFechaDeSolicitud(solicitud, filtros.fechaDeSolicitud, claveDeHoy) &&
        coincideConAsignacion(solicitud, filtros.asignacion) &&
        coincideConLaBusqueda(solicitud, filtros.busqueda, trabajadores, clientes)
      );
    })
    .sort((a, b) => milisegundosDe(b.fechaDeCreacion) - milisegundosDe(a.fechaDeCreacion));
}
