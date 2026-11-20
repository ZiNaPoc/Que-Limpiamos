import { claveDeFechaDesdeIso, diasEntre } from "./fechas";

import type {
  EtapaDeSolicitud,
  FiltrosDeSolicitudes,
  SolicitudListado,
} from "../data/tipos";

export const FILTROS_VACIOS: FiltrosDeSolicitudes = {
  busqueda: "",
  etapa: "todas",
  fechaDelTrabajo: "todas",
  fechaDeSolicitud: "todas",
};

export const FILTROS_ACTIVAS: FiltrosDeSolicitudes = {
  ...FILTROS_VACIOS,
  etapa: "Solicitud enviada",
  fechaDelTrabajo: "hoy",
};

export const FILTROS_ENVIADAS_DE_HOY: FiltrosDeSolicitudes = {
  ...FILTROS_VACIOS,
  etapa: "Solicitud enviada",
  fechaDelTrabajo: "hoy",
};

export function obtenerEtapaListado(
  solicitud: SolicitudListado,
): EtapaDeSolicitud {
  switch (solicitud.estado) {
    case "Pendiente":
      return solicitud.idTrabajador
        ? "Asignando colaborador"
        : "Solicitud enviada";

    case "Confirmado":
      return "Servicio confirmado";

    case "Cancelado":
      return "Cancelada";

    case "En proceso":
      return "Servicio en proceso";

    case "Realizado":
      return "Servicio finalizado";

    case "Rechazado":
      return "Solicitud rechazada";
  }
}

export function estaActivaListado(solicitud: SolicitudListado): boolean {
  return (
    solicitud.estado !== "Realizado" &&
    solicitud.estado !== "Cancelado" &&
    solicitud.estado !== "Rechazado"
  );
}

export function obtenerSolicitudesActivas(
  solicitudes: SolicitudListado[],
): SolicitudListado[] {
  return solicitudes.filter(estaActivaListado);
}

export function obtenerPendientesDeAsignarHoy(
  solicitudes: SolicitudListado[],
  claveDeHoy: string,
): SolicitudListado[] {
  return solicitudes
    .filter(
      (solicitud) =>
        claveDeFechaDesdeIso(solicitud.fechaProgramada) === claveDeHoy &&
        solicitud.estado === "Pendiente" &&
        solicitud.idTrabajador === null,
    )
    .sort(
      (a, b) =>
        new Date(a.fechaProgramada).getTime() -
        new Date(b.fechaProgramada).getTime(),
    );
}

export function obtenerServiciosEnProcesoHoy(
  solicitudes: SolicitudListado[],
  claveDeHoy: string,
): SolicitudListado[] {
  return solicitudes
    .filter(
      (solicitud) =>
        claveDeFechaDesdeIso(solicitud.fechaProgramada) === claveDeHoy &&
        solicitud.estado === "Confirmado",
    )
    .sort(
      (a, b) =>
        new Date(a.fechaProgramada).getTime() -
        new Date(b.fechaProgramada).getTime(),
    );
}

export function obtenerSolicitudesRecientes(
  solicitudes: SolicitudListado[],
  cantidadMaxima: number,
): SolicitudListado[] {
  return [...solicitudes]
    .sort(
      (a, b) =>
        new Date(a.fechaCreacion).getTime() -
        new Date(b.fechaCreacion).getTime(),
    )
    .slice(0, cantidadMaxima);
}

export function tieneFiltrosActivos(
  filtros: FiltrosDeSolicitudes
): boolean {
  return (
    filtros.busqueda.trim() !== "" ||
    filtros.etapa !== "todas" ||
    filtros.fechaDelTrabajo !== "todas" ||
    filtros.fechaDeSolicitud !== "todas"
  );
}

function coincideConFechaDelTrabajo(
  solicitud: SolicitudListado,
  filtro: FiltrosDeSolicitudes["fechaDelTrabajo"],
  claveDeHoy: string,
): boolean {
  if (filtro === "todas") return true;

  const diferencia = diasEntre(
    claveDeFechaDesdeIso(solicitud.fechaProgramada),
    claveDeHoy,
  );

  if (filtro === "hoy") return diferencia === 0;
  if (filtro === "manana") return diferencia === 1;
  if (filtro === "despues") return diferencia > 1;

  return diferencia < 0;
}

function coincideConFechaDeSolicitud(
  solicitud: SolicitudListado,
  filtro: FiltrosDeSolicitudes["fechaDeSolicitud"],
  claveDeHoy: string,
): boolean {
  if (filtro === "todas") return true;

  const diferencia = diasEntre(
    claveDeHoy,
    claveDeFechaDesdeIso(solicitud.fechaCreacion),
  );

  if (filtro === "hoy") return diferencia === 0;

  return diferencia >= 0 && diferencia <= 6;
}

function coincideConEtapa(
    solicitud: SolicitudListado,
    filtro: FiltrosDeSolicitudes['etapa'],
  ): boolean {
    if (filtro === 'todas') return true;

    if(filtro === 'activas') return estaActivaListado(solicitud);

    return obtenerEtapaListado(solicitud) === filtro;
  }

function coincideConBusqueda(
  solicitud: SolicitudListado,
  busqueda: string,
): boolean {
  const texto = busqueda.trim().toLowerCase();

  if(!texto) return true;

  const campos = [
    solicitud.id,
    solicitud.idCliente,
    solicitud.cliente.nombre,
    solicitud.cliente.correo,
    solicitud.cliente.telefono,
    solicitud.servicio,
    solicitud.direccion,
    solicitud.trabajador?.nombre ?? '',
  ];

  return campos.join(" ").toLowerCase().includes(texto);
}

export function filtrarSolicitudes(
  solicitudes: SolicitudListado[],
  filtros: FiltrosDeSolicitudes,
  claveDeHoy: string,
): SolicitudListado[] {
  return solicitudes
  .filter(
    (solicitud) =>
      coincideConEtapa(solicitud, filtros.etapa) &&
      coincideConFechaDelTrabajo(
        solicitud,
        filtros.fechaDelTrabajo,
        claveDeHoy,
      ) &&
      coincideConFechaDeSolicitud(
        solicitud,
        filtros.fechaDeSolicitud,
        claveDeHoy
      ) &&
      coincideConBusqueda(
        solicitud,
        filtros.busqueda,
      ),
  )

  .sort(
    (a,b) =>
      new Date (a.fechaCreacion).getTime() -
     new Date(b.fechaCreacion).getTime()
  )
}