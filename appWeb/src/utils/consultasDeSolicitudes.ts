import { claveDeFechaDesdeIso, diasEntre } from "./fechas";
import { estaActiva, obtenerEtapa } from "./reglasDeSolicitudes";
import { buscarTrabajador } from "../data/trabajadores";
import { buscarCliente } from "../data/ClientesContext";
import type { Cliente, FiltrosDeSolicitudes, Solicitud, Trabajador } from "../data/tipos";

// Filtros base y atajos usados desde el inicio del panel
export const FILTROS_VACIOS: FiltrosDeSolicitudes = {
  busqueda: "",
  etapa: "todas",
  fechaDelTrabajo: "todas",
  fechaDeSolicitud: "todas",
  eleccion: "todas",
};

export const FILTROS_ACTIVAS: FiltrosDeSolicitudes = { ...FILTROS_VACIOS, etapa: "activas" };

export const FILTROS_ENVIADAS_DE_HOY: FiltrosDeSolicitudes = { ...FILTROS_VACIOS, etapa: "Solicitud enviada", fechaDelTrabajo: "hoy" };

export function obtenerSolicitudesActivas(solicitudes: Solicitud[]): Solicitud[] {
  return solicitudes.filter(estaActiva);
}

function milisegundosDe(fechaIso: string): number {
  return new Date(fechaIso).getTime();
}

export function tieneFiltrosActivos(filtros: FiltrosDeSolicitudes): boolean {
  return (
    filtros.busqueda.trim() !== "" ||
    filtros.etapa !== FILTROS_VACIOS.etapa ||
    filtros.fechaDelTrabajo !== FILTROS_VACIOS.fechaDelTrabajo ||
    filtros.fechaDeSolicitud !== FILTROS_VACIOS.fechaDeSolicitud ||
    filtros.eleccion !== FILTROS_VACIOS.eleccion
  );
}

// Servicios de hoy que aún no tienen colaborador
export function obtenerPendientesDeAsignarHoy(solicitudes: Solicitud[], claveDeHoy: string): Solicitud[] {
  return solicitudes
    .filter((solicitud) => claveDeFechaDesdeIso(solicitud.fechaProgramada) === claveDeHoy && obtenerEtapa(solicitud) === "Solicitud enviada")
    .sort((a, b) => milisegundosDe(a.fechaProgramada) - milisegundosDe(b.fechaProgramada));
}

// Servicios de hoy ya confirmados
export function obtenerServiciosEnProcesoHoy(solicitudes: Solicitud[], claveDeHoy: string): Solicitud[] {
  return solicitudes
    .filter((solicitud) => claveDeFechaDesdeIso(solicitud.fechaProgramada) === claveDeHoy && solicitud.estado === "Confirmado")
    .sort((a, b) => milisegundosDe(a.fechaProgramada) - milisegundosDe(b.fechaProgramada));
}

export function obtenerSolicitudesRecientes(solicitudes: Solicitud[], cantidadMaxima: number): Solicitud[] {
  return [...solicitudes].sort((a, b) => milisegundosDe(b.fechaDeCreacion) - milisegundosDe(a.fechaDeCreacion)).slice(0, cantidadMaxima);
}

// Filtro por la fecha del servicio
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

function coincideConEtapa(solicitud: Solicitud, filtro: FiltrosDeSolicitudes["etapa"]): boolean {
  if (filtro === "todas") {
    return true;
  }
  if (filtro === "activas") {
    return estaActiva(solicitud);
  }
  return obtenerEtapa(solicitud) === filtro;
}

// Busca texto en cliente, servicio, dirección y colaborador
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
    trabajador ? trabajador.nombre : "",
  ];
  return camposDondeBuscar.join(" ").toLowerCase().includes(textoBuscado);
}

// Aplica todos los filtros; las más nuevas salen primero
export function filtrarSolicitudes(solicitudes: Solicitud[], filtros: FiltrosDeSolicitudes, claveDeHoy: string, trabajadores: Trabajador[], clientes: Cliente[]): Solicitud[] {
  return solicitudes
    .filter((solicitud) => {
      const coincideConLaEleccion = filtros.eleccion === "todas" || solicitud.modoDeEleccion === filtros.eleccion;
      return (
        coincideConEtapa(solicitud, filtros.etapa) &&
        coincideConLaEleccion &&
        coincideConFechaDelTrabajo(solicitud, filtros.fechaDelTrabajo, claveDeHoy) &&
        coincideConFechaDeSolicitud(solicitud, filtros.fechaDeSolicitud, claveDeHoy) &&
        coincideConLaBusqueda(solicitud, filtros.busqueda, trabajadores, clientes)
      );
    })
    .sort((a, b) => milisegundosDe(b.fechaDeCreacion) - milisegundosDe(a.fechaDeCreacion));
}
