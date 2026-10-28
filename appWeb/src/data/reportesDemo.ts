import type { Reporte, Solicitud } from "./tipos";

const MILISEGUNDOS_POR_HORA = 60 * 60 * 1000;

function horasDespuesDelServicio(solicitudes: Solicitud[], idDeSolicitud: string, horas: number): string {
  const solicitud = solicitudes.find((solicitudBuscada) => solicitudBuscada.id === idDeSolicitud);
  if (!solicitud) {
    return new Date().toISOString();
  }
  return new Date(new Date(solicitud.fechaProgramada).getTime() + horas * MILISEGUNDOS_POR_HORA).toISOString();
}

export function crearReportesDeDemostracion(solicitudes: Solicitud[]): Reporte[] {
  return [
    {
      folio: "R-09",
      idDeSolicitud: "S-1036",
      descripcion: "Al terminar me comentaron un cobro mayor al precio estimado que aparecía en la solicitud. Quiero saber cuál es el monto correcto.",
      fechaDeCreacion: horasDespuesDelServicio(solicitudes, "S-1036", 3),
      estado: "Resuelto",
      solucion: "Se aclaró con la clienta que se cobra el precio estimado de la solicitud.",
    },
    {
      folio: "R-10",
      idDeSolicitud: "S-1034",
      descripcion: "La cocina quedó sin terminar: faltó limpiar la estufa y la tarja.",
      fechaDeCreacion: horasDespuesDelServicio(solicitudes, "S-1034", 4),
      estado: "En revisión",
      solucion: "Se pidió a la trabajadora su versión de lo ocurrido.",
    },
    {
      folio: "R-11",
      idDeSolicitud: "S-1035",
      descripcion: "El trabajador llegó con una hora de retraso y no avisó.",
      fechaDeCreacion: horasDespuesDelServicio(solicitudes, "S-1035", 2),
      estado: "Pendiente",
      solucion: "",
    },
  ];
}
