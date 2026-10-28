import { MILISEGUNDOS_POR_MINUTO } from "./fechas";
import { formatearPrecio } from "./formato";
import { buscarTrabajador, describirTrabajador } from "../data/trabajadores";
import type { EstadoDeSolicitud, ResultadoDeOperacion, Solicitud, Trabajador } from "../data/tipos";

const SEPARACION_MINIMA_ENTRE_SERVICIOS_EN_MINUTOS = 120;
const PRECIO_MAXIMO = 100000;
export const CANTIDAD_MAXIMA_DE_EVIDENCIAS = 6;

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

export function describirEstadoDeLaAsignacion(solicitud: Solicitud): string {
  if (solicitud.estado === "Cancelado") {
    if (solicitud.idDelTrabajador) {
      return "Asignación registrada antes de la cancelación.";
    }
    return "La solicitud se canceló sin trabajador asignado.";
  }
  if (solicitud.estado === "Realizado") {
    return "Servicio realizado.";
  }
  if (solicitud.estado === "Confirmado") {
    return "El trabajador confirmó el servicio.";
  }
  if (solicitud.idDelTrabajador) {
    return "Asignado por la administración. Falta que el trabajador confirme.";
  }
  return "Todavía no hay trabajador asignado.";
}

export function evaluarCambioDeTrabajador(solicitud: Solicitud): ResultadoDeOperacion {
  if (solicitud.estado === "Cancelado") {
    return rechazar("La solicitud está cancelada. El proceso para reasignarla o reactivarla todavía no está definido.");
  }
  if (solicitud.estado === "Realizado") {
    return rechazar("Este servicio ya se realizó, por eso no se puede cambiar el trabajador.");
  }
  if (solicitud.estado === "Confirmado") {
    return rechazar("El trabajador ya confirmó el servicio. La asignación solo podría cambiar si el servicio se cancela.");
  }
  return permitir();
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
    return rechazar("Elegiste el mismo trabajador que ya estaba asignado.");
  }
  if (idDelTrabajadorNuevo === null) {
    return permitir();
  }
  if (!buscarTrabajador(trabajadores, idDelTrabajadorNuevo)) {
    return rechazar("El trabajador elegido no existe en la lista de trabajadores.");
  }
  const solicitudEnConflicto = buscarSolicitudEnConflicto(solicitudes, idDelTrabajadorNuevo, solicitud.fechaProgramada, solicitud.id);
  if (solicitudEnConflicto) {
    return rechazar(`Ese trabajador ya tiene el servicio ${solicitudEnConflicto.id} cerca de este horario.`);
  }
  return permitir();
}

export function aplicarCambioDeTrabajador(solicitud: Solicitud, idDelTrabajadorNuevo: string | null): Solicitud {
  return { ...solicitud, idDelTrabajador: idDelTrabajadorNuevo };
}

export function describirCambioDeTrabajador(solicitud: Solicitud, idDelTrabajadorNuevo: string | null, trabajadores: Trabajador[]): string[] {
  return [
    `Trabajador: ${describirTrabajador(trabajadores, solicitud.idDelTrabajador)} → ${describirTrabajador(trabajadores, idDelTrabajadorNuevo)}`,
    "El horario, el precio y el estado de la solicitud no cambian.",
  ];
}

export function listarTrabajadoresConDisponibilidad(solicitudes: Solicitud[], trabajadores: Trabajador[], solicitud: Solicitud) {
  return trabajadores.map((trabajador) => {
    const estaOcupado = Boolean(buscarSolicitudEnConflicto(solicitudes, trabajador.id, solicitud.fechaProgramada, solicitud.id));
    return { trabajador, estaOcupado };
  });
}

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
    return rechazar("La solicitud está cancelada, por eso no se puede registrar un acuerdo de precio.");
  }
  if (solicitud.estado === "Realizado") {
    return rechazar("Este servicio ya se realizó, por eso no se puede registrar un acuerdo de precio.");
  }
  if (solicitud.estado !== "Confirmado" || !solicitud.idDelTrabajador) {
    return rechazar("El acuerdo es entre el cliente y el trabajador que atenderá el servicio. Primero el trabajador asignado debe confirmar el servicio.");
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
    errores.aceptaciones = "Para registrar el acuerdo deben aceptarlo el cliente y el trabajador.";
  }
  return errores;
}

export function aplicarAcuerdoDePrecio(solicitud: Solicitud, precio: number, ahora: Date): Solicitud {
  return { ...solicitud, acuerdoDePrecio: { precio, fechaDeRegistro: ahora.toISOString() } };
}

export function describirAcuerdoDePrecio(solicitud: Solicitud, precio: number): string[] {
  let precioAnterior = "Pendiente de acuerdo";
  if (solicitud.acuerdoDePrecio) {
    precioAnterior = formatearPrecio(solicitud.acuerdoDePrecio.precio);
  }
  return [
    `Precio acordado: ${precioAnterior} → ${formatearPrecio(precio)}`,
    `El precio estimado (${formatearPrecio(solicitud.precioEstimado)}) se conserva como referencia.`,
    "Es una simulación local: no queda guardada en el servidor ni verificada por el cliente o el trabajador.",
  ];
}

export function evaluarIncorporacionDeEvidencias(solicitud: Solicitud, cantidadNueva: number): ResultadoDeOperacion {
  if (!estaActiva(solicitud)) {
    return rechazar(`La solicitud está en estado ${solicitud.estado.toLowerCase()}, por eso ya no se pueden agregar fotografías.`);
  }
  if (cantidadNueva <= 0) {
    return rechazar("No hay fotografías seleccionadas.");
  }
  if (solicitud.evidencias.length + cantidadNueva > CANTIDAD_MAXIMA_DE_EVIDENCIAS) {
    return rechazar(`Cada solicitud admite como máximo ${CANTIDAD_MAXIMA_DE_EVIDENCIAS} fotografías.`);
  }
  return permitir();
}
