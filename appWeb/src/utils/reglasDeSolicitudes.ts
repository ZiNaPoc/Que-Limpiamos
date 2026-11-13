import { MILISEGUNDOS_POR_MINUTO } from "./fechas";
import { describirHorario, formatearPrecio } from "./formato";
import { horarioCubreLaFecha } from "./horarios";
import { buscarTrabajador, describirTrabajador } from "../data/trabajadores";
import type { EstadoDeSolicitud, HorarioDeTrabajo, ResultadoDeOperacion, Solicitud, Trabajador } from "../data/tipos";

// Reglas de negocio compartidas con la app móvil:
// - El administrador no fija precios ni horarios: el precio final lo confirma el colaborador
//   y el horario lo elige el cliente.
// - El colaborador solo se puede cambiar antes de que confirme el servicio.
// - Una solicitud confirmada solo se libera si se cancela.

const SEPARACION_MINIMA_ENTRE_SERVICIOS_EN_MINUTOS = 120;
const PRECIO_MAXIMO = 100000;
export const LONGITUD_MINIMA_DEL_MOTIVO = 10;
export const LONGITUD_MAXIMA_DEL_MOTIVO = 300;

const ESTADOS_ACTIVOS: EstadoDeSolicitud[] = ["Pendiente", "Confirmado"];

export function estaActiva(solicitud: Solicitud): boolean {
  return ESTADOS_ACTIVOS.includes(solicitud.estado);
}

function permitir(mensaje = ""): ResultadoDeOperacion {
  return { exito: true, mensaje };
}

function rechazar(mensaje: string): ResultadoDeOperacion {
  return { exito: false, mensaje };
}

function buscarSolicitudEnConflicto(
  solicitudes: Solicitud[],
  idDelTrabajador: string,
  fechaProgramada: string,
  idDeSolicitudIgnorada: string,
): Solicitud | undefined {
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

// ───────────── Asignación del colaborador ─────────────

export function describirEstadoDeLaAsignacion(solicitud: Solicitud): string {
  if (solicitud.estado === "Cancelado") {
    if (solicitud.idDelTrabajador) {
      return "Asignación registrada antes de la cancelación.";
    }
    return "La solicitud se canceló sin colaborador asignado.";
  }
  if (solicitud.estado === "Realizado") {
    return "Servicio realizado.";
  }
  if (solicitud.estado === "Confirmado") {
    return "El colaborador confirmó el servicio. La asignación queda bloqueada.";
  }
  if (solicitud.idDelTrabajador) {
    if (solicitud.modoDeEleccion === "Cliente") {
      return "El cliente lo eligió desde la app. Falta que el colaborador confirme.";
    }
    return "Asignado. Falta que el colaborador confirme.";
  }
  if (solicitud.modoDeEleccion === "Automática") {
    return "La asignación automática no encontró colaborador disponible. Requiere asignación manual.";
  }
  return "Todavía no hay colaborador asignado.";
}

export function evaluarCambioDeTrabajador(solicitud: Solicitud): ResultadoDeOperacion {
  if (solicitud.estado === "Cancelado") {
    return rechazar("La solicitud está cancelada; la asignación ya no se puede cambiar.");
  }
  if (solicitud.estado === "Realizado") {
    return rechazar("Este servicio ya se realizó, por eso no se puede cambiar el colaborador.");
  }
  if (solicitud.estado === "Confirmado") {
    return rechazar("El colaborador ya confirmó el servicio. La asignación solo se libera si la solicitud se cancela.");
  }
  return permitir();
}

export type DisponibilidadDelTrabajador = {
  trabajador: Trabajador;
  estaOcupado: boolean;
  fueraDeHorario: boolean;
  tieneLaEspecialidad: boolean;
};

export function evaluarDisponibilidad(solicitudes: Solicitud[], trabajador: Trabajador, solicitud: Solicitud): DisponibilidadDelTrabajador {
  return {
    trabajador,
    estaOcupado: Boolean(buscarSolicitudEnConflicto(solicitudes, trabajador.id, solicitud.fechaProgramada, solicitud.id)),
    fueraDeHorario: !horarioCubreLaFecha(trabajador.horario, solicitud.fechaProgramada),
    tieneLaEspecialidad: trabajador.especialidades.includes(solicitud.idDelServicio),
  };
}

export function listarTrabajadoresConDisponibilidad(solicitudes: Solicitud[], trabajadores: Trabajador[], solicitud: Solicitud): DisponibilidadDelTrabajador[] {
  return trabajadores
    .map((trabajador) => evaluarDisponibilidad(solicitudes, trabajador, solicitud))
    .sort((a, b) => Number(b.tieneLaEspecialidad) - Number(a.tieneLaEspecialidad));
}

export function validarCambioDeTrabajador(
  solicitud: Solicitud,
  idDelTrabajadorNuevo: string | null,
  solicitudes: Solicitud[],
  trabajadores: Trabajador[],
): ResultadoDeOperacion {
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
    return rechazar("El colaborador elegido no existe en la lista de trabajadores.");
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
  lineas.push("El horario y el precio no cambian. El nuevo colaborador todavía debe confirmar el servicio.");
  return lineas;
}

// ───────────── Precio confirmado por el colaborador ─────────────

export type DatosDeAcuerdoDePrecio = {
  precio: string;
  aceptadoPorElCliente: boolean;
  aceptadoPorElTrabajador: boolean;
};

export type ErroresDelAcuerdoDePrecio = {
  precio?: string;
  aceptaciones?: string;
};

export function evaluarRegistroDeAcuerdoDePrecio(solicitud: Solicitud): ResultadoDeOperacion {
  if (solicitud.estado === "Cancelado") {
    return rechazar("La solicitud está cancelada, por eso no se puede registrar un precio.");
  }
  if (solicitud.estado === "Realizado") {
    return rechazar("Este servicio ya se realizó, por eso no se puede registrar un precio.");
  }
  if (solicitud.estado !== "Confirmado" || !solicitud.idDelTrabajador) {
    return rechazar("El precio final lo confirma el colaborador al revisar el servicio. Primero debe confirmar la asignación.");
  }
  return permitir();
}

export function validarAcuerdoDePrecio(solicitud: Solicitud, datos: DatosDeAcuerdoDePrecio): ErroresDelAcuerdoDePrecio {
  const errores: ErroresDelAcuerdoDePrecio = {};
  const textoDelPrecio = datos.precio.trim();
  const precio = Number(textoDelPrecio);
  if (textoDelPrecio === "" || !Number.isFinite(precio) || precio <= 0) {
    errores.precio = "Escribe un precio mayor a cero.";
  } else if (precio > PRECIO_MAXIMO) {
    errores.precio = "El precio no puede superar $100,000.";
  } else if (solicitud.acuerdoDePrecio && solicitud.acuerdoDePrecio.precio === precio) {
    errores.precio = "Ese precio ya es el acordado.";
  }
  if (!datos.aceptadoPorElCliente || !datos.aceptadoPorElTrabajador) {
    errores.aceptaciones = "Para registrar el precio deben haberlo aceptado el cliente y el colaborador.";
  }
  return errores;
}

export function aplicarAcuerdoDePrecio(solicitud: Solicitud, precio: number, ahora: Date): Solicitud {
  return { ...solicitud, acuerdoDePrecio: { precio, fechaDeRegistro: ahora.toISOString() } };
}

export function describirAcuerdoDePrecio(solicitud: Solicitud, precio: number): string[] {
  let precioAnterior = "Pendiente de confirmar";
  if (solicitud.acuerdoDePrecio) {
    precioAnterior = formatearPrecio(solicitud.acuerdoDePrecio.precio);
  }
  return [
    `Precio final: ${precioAnterior} → ${formatearPrecio(precio)}`,
    `El precio estimado (${formatearPrecio(solicitud.precioEstimado)}) se conserva como referencia.`,
    "Sin backend, el registro solo dura mientras esta pestaña siga abierta.",
  ];
}

// ───────────── Cancelación ─────────────

export function evaluarCancelacion(solicitud: Solicitud): ResultadoDeOperacion {
  if (solicitud.estado === "Cancelado") {
    return rechazar("La solicitud ya está cancelada.");
  }
  if (solicitud.estado === "Realizado") {
    return rechazar("El servicio ya se realizó; si hubo un problema, se atiende como reporte.");
  }
  return permitir();
}

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

export function aplicarCancelacion(solicitud: Solicitud, motivo: string, ahora: Date): Solicitud {
  return {
    ...solicitud,
    estado: "Cancelado",
    cancelacion: { canceladaPor: "Administración", motivo: motivo.trim(), fecha: ahora.toISOString() },
  };
}

export function describirCancelacion(solicitud: Solicitud, motivo: string, claveDeHoy: string): string[] {
  return [
    `Estado: ${solicitud.estado} → Cancelado`,
    `Servicio programado: ${describirHorario(solicitud.fechaProgramada, claveDeHoy)}`,
    `Motivo: ${motivo.trim()}`,
    "Es definitivo: si el cliente aún necesita el servicio, debe reagendarlo desde la app.",
  ];
}

// ───────────── Horario del colaborador ─────────────

// Cambiar el horario general de un colaborador no puede dejar fuera servicios ya acordados
// (pendientes o confirmados, aunque ya hayan empezado).
export function buscarServiciosFueraDelHorario(solicitudes: Solicitud[], idDelTrabajador: string, horario: HorarioDeTrabajo): Solicitud[] {
  return solicitudes.filter((solicitud) => solicitud.idDelTrabajador === idDelTrabajador && estaActiva(solicitud) && !horarioCubreLaFecha(horario, solicitud.fechaProgramada));
}
