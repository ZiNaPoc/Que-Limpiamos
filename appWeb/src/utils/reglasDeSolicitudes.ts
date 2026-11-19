import { MILISEGUNDOS_POR_MINUTO } from "./fechas";
import { describirHorario } from "./formato";
import { horarioCubreLaFecha } from "./horarios";
import { buscarTrabajador, describirTrabajador } from "../data/trabajadores";
import type { EstadoDeSolicitud, EtapaDeSolicitud, HorarioDeTrabajo, ResultadoDeOperacion, Solicitud, Trabajador } from "../data/tipos";

// Aquí se decide qué se puede hacer y qué no. Las pantallas solo preguntan "¿se puede?" y muestran la respuesta.

// Margen entre dos servicios del mismo colaborador (2 horas).
const SEPARACION_MINIMA_ENTRE_SERVICIOS_EN_MINUTOS = 120;
// Tiempo extra para confirmar después de la hora programada (1 hora). Pasado ese tiempo ya solo se puede cancelar.
const TOLERANCIA_PARA_CONFIRMAR_EN_MINUTOS = 60;
// Largo permitido del motivo de cancelación (10 a 300 letras).
export const LONGITUD_MINIMA_DEL_MOTIVO = 10;
export const LONGITUD_MAXIMA_DEL_MOTIVO = 300;

// Una solicitud "activa" es la que todavía está en curso: Pendiente o Confirmado.
const ESTADOS_ACTIVOS: EstadoDeSolicitud[] = ["Pendiente", "Confirmado"];

// Etapas en orden, de la primera a la última.
export const ETAPAS_DE_SOLICITUD: EtapaDeSolicitud[] = ["Solicitud enviada", "Asignando colaborador", "Servicio confirmado", "Servicio finalizado", "Cancelada"];

// Calcula la etapa que se muestra, a partir del estado y de si hay colaborador:
// Cancelado - Cancelada; Realizado - Servicio finalizado; Confirmado - Servicio confirmado;
// Pendiente con colaborador - Asignando colaborador; Pendiente sin colaborador - Solicitud enviada.
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

// Activa = Pendiente o Confirmado.
export function estaActiva(solicitud: Solicitud): boolean {
  return ESTADOS_ACTIVOS.includes(solicitud.estado);
}

// Respuesta "sí se puede".
function permitir(mensaje = ""): ResultadoDeOperacion {
  return { exito: true, mensaje };
}

// Respuesta "no se puede" con la razón, que se muestra al administrador.
function rechazar(mensaje: string): ResultadoDeOperacion {
  return { exito: false, mensaje };
}

// Busca si el colaborador ya tiene otro servicio activo a menos de 2 horas de esa hora (ignora la solicitud que se está editando).
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

// Texto de ayuda que aparece junto al colaborador, según la etapa.
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

// ¿Se puede asignar o cambiar colaborador? Solo mientras la solicitud esté Pendiente. Confirmada, finalizada o cancelada ya no.
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

// Resumen de un colaborador para una solicitud: si está inactivo, ocupado, fuera de horario y si tiene la especialidad.
export type DisponibilidadDelTrabajador = {
  trabajador: Trabajador;
  estaInactivo: boolean;
  estaOcupado: boolean;
  fueraDeHorario: boolean;
  tieneLaEspecialidad: boolean;
};

// Revisa si el colaborador está inactivo, ocupado o fuera de horario para la fecha de esa solicitud.
export function evaluarDisponibilidad(solicitudes: Solicitud[], trabajador: Trabajador, solicitud: Solicitud): DisponibilidadDelTrabajador {
  return {
    trabajador,
    estaInactivo: trabajador.estado === "Inactivo",
    estaOcupado: Boolean(buscarSolicitudEnConflicto(solicitudes, trabajador.id, solicitud.fechaProgramada, solicitud.id)),
    fueraDeHorario: !horarioCubreLaFecha(trabajador.horario, solicitud.fechaProgramada),
    tieneLaEspecialidad: trabajador.especialidades.includes(solicitud.idDelServicio),
  };
}

// Puede atender si no tiene ninguna de esas tres razones. La especialidad no bloquea; solo se avisa.
export function puedeAtender(disponibilidad: DisponibilidadDelTrabajador): boolean {
  return !disponibilidad.estaInactivo && !disponibilidad.estaOcupado && !disponibilidad.fueraDeHorario;
}

// Lista para el selector de colaborador: primero los que pueden atender y, entre ellos, los que tienen la especialidad.
export function listarTrabajadoresConDisponibilidad(solicitudes: Solicitud[], trabajadores: Trabajador[], solicitud: Solicitud): DisponibilidadDelTrabajador[] {
  return trabajadores
    .map((trabajador) => evaluarDisponibilidad(solicitudes, trabajador, solicitud))
    .sort((a, b) => Number(puedeAtender(b)) - Number(puedeAtender(a)) || Number(b.tieneLaEspecialidad) - Number(a.tieneLaEspecialidad));
}

// Todas las validaciones antes de asignar: permiso por estado, que sea otro colaborador, que exista, esté activo, trabaje a esa hora y no tenga otro servicio cerca.
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

// Devuelve una copia de la solicitud con el nuevo colaborador (o null para dejarla sin asignar). No modifica la original.
export function aplicarCambioDeTrabajador(solicitud: Solicitud, idDelTrabajadorNuevo: string | null): Solicitud {
  return { ...solicitud, idDelTrabajador: idDelTrabajadorNuevo };
}

// Líneas que se muestran en la ventana "¿Cambiar el colaborador?" para que el administrador revise antes de guardar.
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

// ¿Se puede confirmar? Debe estar Pendiente, con colaborador activo y sin haber pasado 1 hora de la hora programada.
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

// Líneas de la ventana "¿Confirmar el servicio?". Avisa que el cliente verá "Tu servicio fue confirmado" y que ya no se podrá cambiar al colaborador.
export function describirConfirmacion(solicitud: Solicitud, trabajadores: Trabajador[]): string[] {
  const trabajador = buscarTrabajador(trabajadores, solicitud.idDelTrabajador);
  return [
    "Seguimiento: Asignando colaborador → Servicio confirmado",
    `Colaborador: ${trabajador ? trabajador.nombre : "—"}`,
    "El cliente verá «Tu servicio fue confirmado» en Avisos y podrá contactar al colaborador para acordar los detalles.",
    "Después de confirmar ya no se puede cambiar el colaborador.",
  ];
}

// ¿Se puede finalizar? Debe estar Confirmado y ya haber llegado la hora programada.
export function evaluarFinalizacion(solicitud: Solicitud, ahora: Date): ResultadoDeOperacion {
  if (solicitud.estado !== "Confirmado") {
    return rechazar("Solo se finaliza un servicio confirmado.");
  }
  if (new Date(solicitud.fechaProgramada).getTime() > ahora.getTime()) {
    return rechazar("El servicio aún no empieza. Podrás marcarlo como finalizado a partir de la hora programada.");
  }
  return permitir();
}

// Líneas de la ventana "¿Marcar como finalizado?". Avisa que el cliente podrá calificar y que ya no se podrá cancelar.
export function describirFinalizacion(): string[] {
  return ["Seguimiento: Servicio confirmado → Servicio finalizado", "La app le pedirá al cliente que califique el servicio («Califica tu servicio»).", "Una vez finalizado ya no se puede cancelar."];
}

// Devuelve una copia de la solicitud con el nuevo estado.
export function aplicarEstado(solicitud: Solicitud, estado: EstadoDeSolicitud): Solicitud {
  return { ...solicitud, estado };
}

// ¿Se puede cancelar? No si ya está cancelada ni si ya finalizó.
export function evaluarCancelacion(solicitud: Solicitud): ResultadoDeOperacion {
  if (solicitud.estado === "Cancelado") {
    return rechazar("La solicitud ya está cancelada.");
  }
  if (solicitud.estado === "Realizado") {
    return rechazar("El servicio ya finalizó; no se puede cancelar.");
  }
  return permitir();
}

// Revisa el motivo (10 a 300 letras). Devuelve el error o undefined si está bien.
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

// Devuelve una copia de la solicitud cancelada, anotando que la canceló la Administración, el motivo y la fecha.
export function aplicarCancelacion(solicitud: Solicitud, motivo: string, ahora: Date): Solicitud {
  return {
    ...solicitud,
    estado: "Cancelado",
    cancelacion: { canceladaPor: "Administración", motivo: motivo.trim(), fecha: ahora.toISOString() },
  };
}

// Líneas de la ventana "¿Cancelar la solicitud?". Avisa que es definitivo y que el cliente tendrá que pedir el servicio de nuevo.
export function describirCancelacion(solicitud: Solicitud, motivo: string, claveDeHoy: string): string[] {
  return [
    `Seguimiento: ${obtenerEtapa(solicitud)} → Cancelada`,
    `Servicio programado: ${describirHorario(solicitud.fechaProgramada, claveDeHoy)}`,
    `Motivo: ${motivo.trim()}`,
    "Es definitivo: si el cliente aún necesita el servicio, deberá solicitarlo de nuevo desde la app.",
  ];
}

// Servicios activos de un colaborador que quedarían fuera de un nuevo horario. Se usa al editarlo para no dejar servicios sin cubrir.
export function buscarServiciosFueraDelHorario(solicitudes: Solicitud[], idDelTrabajador: string, horario: HorarioDeTrabajo): Solicitud[] {
  return solicitudes.filter((solicitud) => solicitud.idDelTrabajador === idDelTrabajador && estaActiva(solicitud) && !horarioCubreLaFecha(horario, solicitud.fechaProgramada));
}

// Servicios activos (pendientes o confirmados) de un colaborador. Se usa para no desactivarlo si tiene trabajo por atender.
export function buscarServiciosActivosDelTrabajador(solicitudes: Solicitud[], idDelTrabajador: string): Solicitud[] {
  return solicitudes.filter((solicitud) => solicitud.idDelTrabajador === idDelTrabajador && estaActiva(solicitud));
}
