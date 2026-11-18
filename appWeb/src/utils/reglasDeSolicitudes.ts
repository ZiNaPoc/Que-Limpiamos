import { MILISEGUNDOS_POR_MINUTO } from "./fechas";
import { describirHorario } from "./formato";
import { horarioCubreLaFecha } from "./horarios";
import { buscarTrabajador, describirTrabajador } from "../data/trabajadores";
import type { EstadoDeSolicitud, EtapaDeSolicitud, HorarioDeTrabajo, ResultadoDeOperacion, Solicitud, Trabajador } from "../data/tipos";

// Margen entre dos servicios del mismo colaborador
const SEPARACION_MINIMA_ENTRE_SERVICIOS_EN_MINUTOS = 120;
// Tiempo extra para confirmar después de la hora programada
const TOLERANCIA_PARA_CONFIRMAR_EN_MINUTOS = 60;
export const LONGITUD_MINIMA_DEL_MOTIVO = 10;
export const LONGITUD_MAXIMA_DEL_MOTIVO = 300;

const ESTADOS_ACTIVOS: EstadoDeSolicitud[] = ["Pendiente", "Confirmado"];

// Etapas en orden, de la primera a la última
export const ETAPAS_DE_SOLICITUD: EtapaDeSolicitud[] = ["Solicitud enviada", "Asignando colaborador", "Servicio confirmado", "Servicio finalizado", "Cancelada"];

// Calcula la etapa a partir del estado y si hay colaborador
export function obtenerEtapa(solicitud: Solicitud): EtapaDeSolicitud {
  if (solicitud.estado === "Cancelado") {
    return "Cancelada";
  }
  if (solicitud.estado === "Realizado") {
    return "Servicio finalizado";
  }
  if (solicitud.estado === "Confirmado") {
    return "Servicio confirmado";
  }
  return solicitud.idDelTrabajador ? "Asignando colaborador" : "Solicitud enviada";
}

// Activa = Pendiente o Confirmado
export function estaActiva(solicitud: Solicitud): boolean {
  return ESTADOS_ACTIVOS.includes(solicitud.estado);
}

function permitir(mensaje = ""): ResultadoDeOperacion {
  return { exito: true, mensaje };
}

function rechazar(mensaje: string): ResultadoDeOperacion {
  return { exito: false, mensaje };
}

// Busca si el colaborador ya tiene otro servicio muy cerca de esa hora
function buscarSolicitudEnConflicto(solicitudes: Solicitud[], idDelTrabajador: string, fechaProgramada: string, idDeSolicitudIgnorada: string): Solicitud | undefined {
  const momentoBuscado = new Date(fechaProgramada).getTime();
  return solicitudes.find((solicitud) => {
    const esLaSolicitudIgnorada = solicitud.id === idDeSolicitudIgnorada;
    const esDeOtroTrabajador = solicitud.idDelTrabajador !== idDelTrabajador;
    if (esLaSolicitudIgnorada || esDeOtroTrabajador || !estaActiva(solicitud)) {
      return false;
    }
    const distanciaEnMilisegundos = Math.abs(new Date(solicitud.fechaProgramada).getTime() - momentoBuscado);
    return distanciaEnMilisegundos < SEPARACION_MINIMA_ENTRE_SERVICIOS_EN_MINUTOS * MILISEGUNDOS_POR_MINUTO;
  });
}

// Texto de ayuda según la etapa
export function describirEstadoDeLaAsignacion(solicitud: Solicitud): string {
  const etapa = obtenerEtapa(solicitud);
  if (etapa === "Cancelada") {
    return solicitud.idDelTrabajador ? "Asignación registrada antes de la cancelación." : "Se canceló sin colaborador asignado.";
  }
  if (etapa === "Servicio finalizado") {
    return "Servicio finalizado.";
  }
  if (etapa === "Servicio confirmado") {
    return "Servicio confirmado. La asignación queda bloqueada.";
  }
  if (etapa === "Asignando colaborador") {
    if (solicitud.modoDeEleccion === "Cliente") {
      return "El cliente lo eligió personalmente. Falta confirmar el servicio.";
    }
    return "Colaborador asignado. Falta confirmar el servicio.";
  }
  if (solicitud.modoDeEleccion === "Automática") {
    return "El cliente pidió asignación automática. Asigna un colaborador disponible.";
  }
  return "Todavía no hay colaborador asignado.";
}

// Solo se cambia colaborador mientras esté Pendiente
export function evaluarCambioDeTrabajador(solicitud: Solicitud): ResultadoDeOperacion {
  if (solicitud.estado === "Cancelado") {
    return rechazar("La solicitud está cancelada; la asignación ya no se puede cambiar.");
  }
  if (solicitud.estado === "Realizado") {
    return rechazar("El servicio ya finalizó; la asignación ya no se puede cambiar.");
  }
  if (solicitud.estado === "Confirmado") {
    return rechazar("El servicio ya está confirmado. La asignación solo se libera si la solicitud se cancela.");
  }
  return permitir();
}

export type DisponibilidadDelTrabajador = {
  trabajador: Trabajador;
  estaInactivo: boolean;
  estaOcupado: boolean;
  fueraDeHorario: boolean;
  tieneLaEspecialidad: boolean;
};

// Revisa si el colaborador está inactivo, ocupado o fuera de horario
export function evaluarDisponibilidad(solicitudes: Solicitud[], trabajador: Trabajador, solicitud: Solicitud): DisponibilidadDelTrabajador {
  return {
    trabajador,
    estaInactivo: trabajador.estado === "Inactivo",
    estaOcupado: Boolean(buscarSolicitudEnConflicto(solicitudes, trabajador.id, solicitud.fechaProgramada, solicitud.id)),
    fueraDeHorario: !horarioCubreLaFecha(trabajador.horario, solicitud.fechaProgramada),
    tieneLaEspecialidad: trabajador.especialidades.includes(solicitud.idDelServicio),
  };
}

// Puede atender si no tiene ninguna de esas tres razones
export function puedeAtender(disponibilidad: DisponibilidadDelTrabajador): boolean {
  return !disponibilidad.estaInactivo && !disponibilidad.estaOcupado && !disponibilidad.fueraDeHorario;
}

// Lista a los disponibles y con la especialidad primero
export function listarTrabajadoresConDisponibilidad(solicitudes: Solicitud[], trabajadores: Trabajador[], solicitud: Solicitud): DisponibilidadDelTrabajador[] {
  return trabajadores
    .map((trabajador) => evaluarDisponibilidad(solicitudes, trabajador, solicitud))
    .sort((a, b) => Number(puedeAtender(b)) - Number(puedeAtender(a)) || Number(b.tieneLaEspecialidad) - Number(a.tieneLaEspecialidad));
}

// Todas las validaciones antes de asignar un colaborador
export function validarCambioDeTrabajador(solicitud: Solicitud, idDelTrabajadorNuevo: string | null, solicitudes: Solicitud[], trabajadores: Trabajador[]): ResultadoDeOperacion {
  const permiso = evaluarCambioDeTrabajador(solicitud);
  if (!permiso.exito) {
    return permiso;
  }
  if (idDelTrabajadorNuevo === solicitud.idDelTrabajador) {
    return rechazar("Elegiste el mismo colaborador que ya estaba asignado.");
  }
  if (idDelTrabajadorNuevo === null) {
    return permitir();
  }
  const trabajador = buscarTrabajador(trabajadores, idDelTrabajadorNuevo);
  if (!trabajador) {
    return rechazar("El colaborador elegido no existe.");
  }
  if (trabajador.estado === "Inactivo") {
    return rechazar(`${trabajador.nombre} está inactivo y no puede recibir solicitudes.`);
  }
  if (!horarioCubreLaFecha(trabajador.horario, solicitud.fechaProgramada)) {
    return rechazar(`${trabajador.nombre} no trabaja en el horario que eligió el cliente.`);
  }
  const solicitudEnConflicto = buscarSolicitudEnConflicto(solicitudes, idDelTrabajadorNuevo, solicitud.fechaProgramada, solicitud.id);
  if (solicitudEnConflicto) {
    return rechazar(`Ese colaborador ya tiene el servicio ${solicitudEnConflicto.id} cerca de este horario.`);
  }
  return permitir();
}

export function aplicarCambioDeTrabajador(solicitud: Solicitud, idDelTrabajadorNuevo: string | null): Solicitud {
  return { ...solicitud, idDelTrabajador: idDelTrabajadorNuevo };
}

export function describirCambioDeTrabajador(solicitud: Solicitud, idDelTrabajadorNuevo: string | null, trabajadores: Trabajador[]): string[] {
  const lineas = [`Colaborador: ${describirTrabajador(trabajadores, solicitud.idDelTrabajador)} → ${describirTrabajador(trabajadores, idDelTrabajadorNuevo)}`];
  if (solicitud.modoDeEleccion === "Cliente" && solicitud.idDelTrabajador) {
    lineas.push("El cliente eligió personalmente al colaborador actual. Haz el cambio solo si ese colaborador no puede atender el servicio.");
  }
  const trabajadorNuevo = buscarTrabajador(trabajadores, idDelTrabajadorNuevo);
  if (trabajadorNuevo && !trabajadorNuevo.especialidades.includes(solicitud.idDelServicio)) {
    lineas.push(`${trabajadorNuevo.nombre} no tiene «${solicitud.servicio}» entre sus especialidades.`);
  }
  lineas.push("La fecha y la hora no cambian. Después falta confirmar el servicio.");
  return lineas;
}

// Para confirmar: debe haber colaborador activo y no pasar el límite de tiempo
export function evaluarConfirmacion(solicitud: Solicitud, trabajadores: Trabajador[], ahora: Date): ResultadoDeOperacion {
  if (solicitud.estado !== "Pendiente") {
    return rechazar("Solo se confirma una solicitud que está asignando colaborador.");
  }
  const trabajador = buscarTrabajador(trabajadores, solicitud.idDelTrabajador);
  if (!trabajador) {
    return rechazar("Primero asigna un colaborador.");
  }
  if (trabajador.estado === "Inactivo") {
    return rechazar(`${trabajador.nombre} está inactivo. Asigna otro colaborador antes de confirmar.`);
  }
  const limite = new Date(solicitud.fechaProgramada).getTime() + TOLERANCIA_PARA_CONFIRMAR_EN_MINUTOS * MILISEGUNDOS_POR_MINUTO;
  if (ahora.getTime() > limite) {
    return rechazar("La fecha del servicio ya pasó. Cancélala para que el cliente pueda reagendar.");
  }
  return permitir();
}

export function describirConfirmacion(solicitud: Solicitud, trabajadores: Trabajador[]): string[] {
  const trabajador = buscarTrabajador(trabajadores, solicitud.idDelTrabajador);
  return [
    "Seguimiento: Asignando colaborador → Servicio confirmado",
    `Colaborador: ${trabajador ? trabajador.nombre : "—"}`,
    "El cliente verá «Tu servicio fue confirmado» en Avisos y podrá contactar al colaborador para acordar los detalles.",
    "Después de confirmar ya no se puede cambiar el colaborador.",
  ];
}

// Para finalizar: debe estar confirmado y ya haber llegado la hora
export function evaluarFinalizacion(solicitud: Solicitud, ahora: Date): ResultadoDeOperacion {
  if (solicitud.estado !== "Confirmado") {
    return rechazar("Solo se finaliza un servicio confirmado.");
  }
  if (new Date(solicitud.fechaProgramada).getTime() > ahora.getTime()) {
    return rechazar("El servicio aún no empieza. Podrás marcarlo como finalizado a partir de la hora programada.");
  }
  return permitir();
}

export function describirFinalizacion(): string[] {
  return ["Seguimiento: Servicio confirmado → Servicio finalizado", "La app le pedirá al cliente que califique el servicio («Califica tu servicio»).", "Una vez finalizado ya no se puede cancelar."];
}

export function aplicarEstado(solicitud: Solicitud, estado: EstadoDeSolicitud): Solicitud {
  return { ...solicitud, estado };
}

// No se cancela si ya está cancelada o finalizada
export function evaluarCancelacion(solicitud: Solicitud): ResultadoDeOperacion {
  if (solicitud.estado === "Cancelado") {
    return rechazar("La solicitud ya está cancelada.");
  }
  if (solicitud.estado === "Realizado") {
    return rechazar("El servicio ya finalizó; no se puede cancelar.");
  }
  return permitir();
}

// El motivo debe tener un largo válido
export function validarMotivoDeCancelacion(motivo: string): string | undefined {
  const motivoLimpio = motivo.trim();
  if (motivoLimpio.length < LONGITUD_MINIMA_DEL_MOTIVO) {
    return `Explica el motivo con al menos ${LONGITUD_MINIMA_DEL_MOTIVO} caracteres; el cliente lo verá en su historial.`;
  }
  if (motivoLimpio.length > LONGITUD_MAXIMA_DEL_MOTIVO) {
    return `Usa como máximo ${LONGITUD_MAXIMA_DEL_MOTIVO} caracteres.`;
  }
  return undefined;
}

// Marca la cancelación hecha por Administración
export function aplicarCancelacion(solicitud: Solicitud, motivo: string, ahora: Date): Solicitud {
  return {
    ...solicitud,
    estado: "Cancelado",
    cancelacion: { canceladaPor: "Administración", motivo: motivo.trim(), fecha: ahora.toISOString() },
  };
}

export function describirCancelacion(solicitud: Solicitud, motivo: string, claveDeHoy: string): string[] {
  return [
    `Seguimiento: ${obtenerEtapa(solicitud)} → Cancelada`,
    `Servicio programado: ${describirHorario(solicitud.fechaProgramada, claveDeHoy)}`,
    `Motivo: ${motivo.trim()}`,
    "Es definitivo: si el cliente aún necesita el servicio, deberá solicitarlo de nuevo desde la app.",
  ];
}

// Servicios activos que chocarían con un nuevo horario del colaborador
export function buscarServiciosFueraDelHorario(solicitudes: Solicitud[], idDelTrabajador: string, horario: HorarioDeTrabajo): Solicitud[] {
  return solicitudes.filter((solicitud) => solicitud.idDelTrabajador === idDelTrabajador && estaActiva(solicitud) && !horarioCubreLaFecha(horario, solicitud.fechaProgramada));
}

export function buscarServiciosActivosDelTrabajador(solicitudes: Solicitud[], idDelTrabajador: string): Solicitud[] {
  return solicitudes.filter((solicitud) => solicitud.idDelTrabajador === idDelTrabajador && estaActiva(solicitud));
}
